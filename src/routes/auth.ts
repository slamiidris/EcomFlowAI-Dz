import crypto from "crypto";
import express, { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  clearSessionCookie,
  getCurrentUser,
  parseCookies,
  requireAuth,
  SessionPayload,
  setSessionCookie,
  signSession,
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

// GET /api/auth/me — the current session's user (Prisma-backed).
router.get("/api/auth/me", async (req, res) => {
  const session = getCurrentUser(req);
  if (!session) return res.status(401).json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return res.status(401).json({ user: null });
  return res.json({ user, isMock: Boolean(session.mock) });
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
  res.json({ user });
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

export const authRouter = router;

