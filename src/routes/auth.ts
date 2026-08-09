import crypto from "crypto";
import express, { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { sendOtpEmail } from "../lib/email";
import { issueOtp, verifyOtpCode, OtpRateLimitedError } from "../lib/otp";
import {
  clearSessionCookie,
  getCurrentUser,
  parseCookies,
  requireAuth,
  SessionPayload,
  setSessionCookie,
  signResetToken,
  signSession,
  verifyResetToken,
} from "../lib/session";

const router = Router();

// ---------------------------------------------------------------------------
// Env configuration
// ---------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL =
  process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dzads.ai";
export const ADMIN_TELEGRAM = process.env.ADMIN_TELEGRAM || "DzAdsAdmin";

const STATE_COOKIE = "dzads_oauth_state";
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

export function getGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// ---------------------------------------------------------------------------
// Google OAuth helpers (same flow as the original server-auth.ts)
// ---------------------------------------------------------------------------
function getGoogleAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForProfile(
  code: string,
): Promise<{ email: string; name: string; avatar?: string }> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token exchange failed (${tokenRes.status})`);
  const token = await tokenRes.json();

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) throw new Error("Failed to fetch Google user info");
  const info = await infoRes.json();
  return { email: info.email, name: info.name || info.email, avatar: info.picture };
}

// ---------------------------------------------------------------------------
// Prisma-backed user upsert
// ---------------------------------------------------------------------------
async function upsertUser(profile: { email: string; name: string; avatar?: string }) {
  return prisma.user.upsert({
    where: { email: profile.email.toLowerCase() },
    create: {
      email: profile.email,
      name: profile.name || profile.email,
      avatarUrl: profile.avatar,
    },
    update: { name: profile.name || undefined, avatarUrl: profile.avatar || undefined },
  });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/auth/google — start Google OAuth, or run the dev mock when Google
// credentials are missing so the full flow stays testable without them.
router.get("/api/auth/google", async (req, res) => {
  try {
    if (!getGoogleConfigured()) {
      const user = await upsertUser({ email: "demo@dzads.ai", name: "Ahmed (Demo)" });
      const token = signSession({
        sub: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatarUrl ?? undefined,
        mock: true,
      });
      setSessionCookie(res, token);
      return res.redirect("/");
    }

    const state = crypto.randomUUID();
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: STATE_MAX_AGE_MS,
    });
    return res.redirect(getGoogleAuthURL(state));
  } catch (err: any) {
    console.error("Google auth error:", err);
    return res.status(500).send("Échec de la connexion. Réessayez.");
  }
});

// GET /api/auth/google/callback — verify state, exchange the code, log the user in.
router.get("/api/auth/google/callback", async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies[STATE_COOKIE]) {
    return res.status(400).send("Paramètres OAuth invalides. Réessayez.");
  }
  try {
    const profile = await exchangeCodeForProfile(code);
    const user = await upsertUser(profile);
    const token = signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatarUrl ?? undefined,
    });
    res.clearCookie(STATE_COOKIE, { path: "/" });
    setSessionCookie(res, token);
    return res.redirect("/");
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return res.status(500).send("Échec de la connexion Google. Réessayez.");
  }
});

// ---------------------------------------------------------------------------
// Email / password authentication with 6-digit OTP verification
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function rateLimitError(err: unknown): boolean {
  return err instanceof OtpRateLimitedError;
}

/** Strips sensitive fields (password hash) before sending a user to the client. */
function publicUser<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

// POST /api/auth/register — name + email + password. Creates the account and
// sends a verification OTP to the email. The account only activates on verify.
router.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const displayName = String(name || "").trim();

    if (!displayName) {
      return res.status(400).json({ error: "Le nom est requis." });
    }
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ error: "Adresse email invalide." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing && existing.emailVerifiedAt) {
      return res
        .status(409)
        .json({ error: "Un compte existe déjà avec cet email. Connecte-toi." });
    }

    // Create the account, or refresh an unverified account re-registering.
    let user = existing;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: displayName,
          passwordHash: hashPassword(password),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: displayName, passwordHash: hashPassword(password) },
      });
    }

    const otp = await issueOtp(user.id, "verification");
    const sent = await sendOtpEmail(user.email, otp.code, {
      reason: "verification",
      expiresMinutes: Math.ceil(otp.expiresInSec / 60),
    });

    return res.status(201).json({
      ok: true,
      email: user.email,
      mode: "verification",
      dev: sent.dev,
      expiresInSec: otp.expiresInSec,
    });
  } catch (err: any) {
    if (rateLimitError(err)) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Register error:", err);
    return res
      .status(500)
      .json({ error: "Erreur lors de la création du compte." });
  }
});

// POST /api/auth/login — email + password. Sends a 6-digit OTP (verification
// if the email is unverified, login otherwise) that must be confirmed.
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      // Same message for unknown email / wrong password — don't leak accounts.
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const reason: "verification" | "login" = user.emailVerifiedAt
      ? "login"
      : "verification";
    const otp = await issueOtp(user.id, reason);
    const sent = await sendOtpEmail(user.email, otp.code, {
      reason,
      expiresMinutes: Math.ceil(otp.expiresInSec / 60),
    });

    return res.json({
      ok: true,
      email: user.email,
      mode: reason,
      dev: sent.dev,
      expiresInSec: otp.expiresInSec,
    });
  } catch (err: any) {
    if (rateLimitError(err)) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Login error:", err);
    return res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

// POST /api/auth/verify-otp — confirm the 6-digit code, activate the email
// (if needed) and create the session.
router.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !code) {
      return res.status(400).json({ error: "Code et email requis." });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    const ok = await verifyOtpCode(user.id, String(code));
    if (!ok) {
      return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    if (!user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    const token = signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatarUrl ?? undefined,
    });
    setSessionCookie(res, token);

    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return res.json({ user: publicUser(fresh!) });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Erreur lors de la vérification." });
  }
});

// POST /api/auth/resend-otp — send a fresh code (rate-limited).
router.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const { email, reason } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email requis." });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(400).json({ error: "Aucun compte pour cet email." });
    }

    const otpReason: "verification" | "login" | "password_reset" =
      reason === "login" || reason === "password_reset" ? reason : "verification";
    const otp = await issueOtp(user.id, otpReason);
    const sent = await sendOtpEmail(user.email, otp.code, {
      reason: otpReason,
      expiresMinutes: Math.ceil(otp.expiresInSec / 60),
    });

    return res.json({
      ok: true,
      email: user.email,
      dev: sent.dev,
      expiresInSec: otp.expiresInSec,
    });
  } catch (err: any) {
    if (rateLimitError(err)) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Resend OTP error:", err);
    return res.status(500).json({ error: "Erreur lors de l'envoi du code." });
  }
});

// GET /api/auth/me — the current session's user (Prisma-backed).
router.get("/api/auth/me", async (req, res) => {
  const session = getCurrentUser(req);
  if (!session) return res.status(401).json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return res.status(401).json({ user: null });
  return res.json({ user: publicUser(user), isMock: Boolean(session.mock) });
});

// POST /api/auth/plan — select a subscription plan for the user.
router.post("/api/auth/plan", requireAuth, async (req, res) => {
  const session = req.user as SessionPayload;
  const { plan } = req.body || {};
  if (!plan) return res.status(400).json({ error: "Plan requis." });
  const user = await prisma.user.update({
    where: { id: session.sub },
    data: {
      plan,
      planStatus: "active",
      planSelectedAt: new Date(),
      planActiveFrom: new Date(),
    },
  });
  res.json({ user: publicUser(user) });
});

// POST /api/auth/logout — clear the session cookie.
router.post("/api/auth/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// GET /api/config — public config (admin payment contacts).
router.get("/api/config", (_req, res) => {
  res.json({ adminEmail: ADMIN_EMAIL, adminTelegram: ADMIN_TELEGRAM });
});

// ---------------------------------------------------------------------------
// Password reset flow
// ---------------------------------------------------------------------------

// POST /api/auth/forgot-password — send a password-reset OTP. Enumeration-safe:
// always returns the same shape whether or not the email has an account.
router.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string")
      return res.status(400).json({ error: "Email requis." });
    const normalized = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Always return the same shape regardless of whether user exists (enumeration-safe)
    const dummyResponse = { ok: true, email: normalized, expiresInSec: 600 };

    if (!user || !user.passwordHash) {
      // User not found or Google-only account — return success but don't send
      return res.json(dummyResponse);
    }

    const otp = await issueOtp(user.id, "password_reset");
    const sent = await sendOtpEmail(user.email, otp.code, {
      reason: "password_reset",
      expiresMinutes: 10,
    });
    return res.json({
      ok: true,
      email: normalized,
      dev: sent.dev,
      expiresInSec: otp.expiresInSec,
    });
  } catch (err: any) {
    if (err instanceof OtpRateLimitedError)
      return res
        .status(429)
        .json({ error: "Trop de demandes. Réessaie dans une minute." });
    console.error("forgot-password error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST /api/auth/verify-reset-otp — confirm the password-reset code and issue
// a short-lived reset token.
router.post("/api/auth/verify-reset-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email et code requis." });
    const normalized = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(400).json({ error: "Code invalide ou expiré." });

    const ok = await verifyOtpCode(user.id, code, { reasons: ["password_reset"] });
    if (!ok) return res.status(400).json({ error: "Code invalide ou expiré." });

    const resetToken = signResetToken(user.email);
    return res.json({ ok: true, email: normalized, resetToken, expiresInSec: 600 });
  } catch (err: any) {
    console.error("verify-reset-otp error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST /api/auth/reset-password — set a new password using a verified reset token.
router.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    if (!email || !resetToken || !password)
      return res.status(400).json({ error: "Tous les champs sont requis." });
    if (typeof password !== "string" || password.length < 8)
      return res
        .status(400)
        .json({ error: "Le mot de passe doit contenir au moins 8 caractères." });

    const normalized = email.trim().toLowerCase();
    const payload = verifyResetToken(resetToken);
    if (!payload || payload.email !== normalized)
      return res.status(400).json({ error: "Lien expiré ou invalide. Recommence." });

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(400).json({ error: "Utilisateur introuvable." });

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) },
    });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST /api/user/payment-proof — submit payment proof
router.post("/user/payment-proof", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { proof, method } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        paymentProof: proof || null,
        paymentMethod: method || null,
        paymentSubmittedAt: new Date(),
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Payment proof error:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// POST /api/admin/make-me-admin — TEMPORARY: make a user admin (remove after use)
router.get("/admin/make-me-admin", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: "admin@dzads.ai" } });
    if (!user) return res.status(404).json({ error: "User not found" });
    await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
    res.json({ ok: true, message: `${user.email} is now admin` });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export const authRouter = router;

