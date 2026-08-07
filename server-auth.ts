import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { Express, Request, Response } from "express";

// ---------------------------------------------------------------------------
// Env configuration
// ---------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "dzads-dev-session-secret");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dzads.ai";
const ADMIN_TELEGRAM = process.env.ADMIN_TELEGRAM || "DzAdsAdmin";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export const isGoogleConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

export const SESSION_COOKIE = "dzads_session";
const STATE_COOKIE = "dzads_oauth_state";
const SESSION_MAX_AGE_MS = 30 * 24 * 3600 * 1000; // 30 days

// ---------------------------------------------------------------------------
// User store (JSON file — no database)
// ---------------------------------------------------------------------------
export type PlanId = "monthly" | "quarterly" | "lifetime";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: PlanId | null;
  planStatus: "pending" | "active" | null;
  planSelectedAt?: number;
  planActiveFrom?: number;
  planExpiresAt?: number | null;
  createdAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export const PLAN_DURATION_MS: Record<PlanId, number | null> = {
  monthly: 30 * 24 * 3600 * 1000,
  quarterly: 90 * 24 * 3600 * 1000,
  lifetime: null, // never expires
};

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readUsers(): AuthUser[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users: AuthUser[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUser(email: string): AuthUser | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function upsertUser(profile: {
  email: string;
  name: string;
  avatar?: string;
}): AuthUser {
  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === profile.email.toLowerCase());
  let user: AuthUser;
  if (existing) {
    user = {
      ...existing,
      name: profile.name || existing.name,
      avatar: profile.avatar || existing.avatar,
    };
    const idx = users.indexOf(existing);
    users[idx] = user;
  } else {
    user = {
      id: crypto.randomUUID(),
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatar: profile.avatar,
      plan: null,
      planStatus: null,
      createdAt: Date.now(),
    };
    users.push(user);
  }
  writeUsers(users);
  return user;
}

// ---------------------------------------------------------------------------
// Signed session cookie (HMAC-SHA256, no extra deps)
// ---------------------------------------------------------------------------
interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  avatar?: string;
  mock?: boolean;
}

function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifySession(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

function getCurrentUser(req: Request): SessionPayload | null {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySession(token);
}

// ---------------------------------------------------------------------------
// Google OAuth
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

async function exchangeCodeForProfile(code: string): Promise<{ email: string; name: string; avatar?: string }> {
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
// Route registration
// ---------------------------------------------------------------------------
export function registerAuthRoutes(app: Express) {
  // Start Google OAuth (or dev-mode mock when credentials are missing)
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!isGoogleConfigured) {
      // DEV MOCK — lets the full flow be tested without Google credentials.
      const user = upsertUser({ email: "demo@dzads.ai", name: "Ahmed (Demo)" });
      const token = signSession({
        sub: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        mock: true,
      });
      res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
      });
      return res.redirect("/");
    }

    const state = crypto.randomUUID();
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60 * 1000,
    });
    return res.redirect(getGoogleAuthURL(state));
  });

  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const cookies = parseCookies(req);
    if (!code || !state || state !== cookies[STATE_COOKIE]) {
      return res.status(400).send("Paramètres OAuth invalides. Réessayez.");
    }
    try {
      const profile = await exchangeCodeForProfile(code);
      const user = upsertUser(profile);
      const token = signSession({
        sub: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      });
      res.clearCookie(STATE_COOKIE, { path: "/" });
      res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
      });
      return res.redirect("/");
    } catch (err: any) {
      console.error("OAuth callback error:", err);
      return res.status(500).send("Échec de la connexion Google. Réessayez.");
    }
  });

  // Public config used by the landing/checkout UI (admin payment contacts).
  app.get("/api/config", (req: Request, res: Response) => {
    res.json({ adminEmail: ADMIN_EMAIL, adminTelegram: ADMIN_TELEGRAM });
  });

  // Current user
  app.get("/api/auth/me", (req: Request, res: Response) => {
    const session = getCurrentUser(req);
    if (!session) return res.status(401).json({ user: null });
    const user = findUser(session.email);
    if (!user) return res.status(401).json({ user: null });
    return res.json({ user, isMock: Boolean(session.mock) });
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.json({ ok: true });
  });

  // Select a plan (pending manual payment verification)
  app.post("/api/auth/plan", (req: Request, res: Response) => {
    const session = getCurrentUser(req);
    if (!session) return res.status(401).json({ error: "Authentification requise." });

    const plan = req.body?.plan;
    if (plan !== "monthly" && plan !== "quarterly" && plan !== "lifetime") {
      return res.status(400).json({ error: "Plan invalide." });
    }

    const users = readUsers();
    const idx = users.findIndex((u) => u.email === session.email);
    if (idx === -1) return res.status(404).json({ error: "Utilisateur introuvable." });

    const user = users[idx];
    user.plan = plan;
    user.planStatus = "pending";
    user.planSelectedAt = Date.now();
    users[idx] = user;
    writeUsers(users);

    return res.json({ user });
  });

  // Admin confirmation of manual payment (guarded by ADMIN_TOKEN)
  app.post("/api/admin/confirm-plan", (req: Request, res: Response) => {
    if (!ADMIN_TOKEN || req.headers["x-admin-token"] !== ADMIN_TOKEN) {
      return res.status(403).json({ error: "Accès refusé." });
    }
    const { email, action } = req.body || {};
    const users = readUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === String(email || "").toLowerCase());
    if (idx === -1) return res.status(404).json({ error: "Utilisateur introuvable." });

    const user = users[idx];
    if (action === "approve" && user.plan) {
      user.planStatus = "active";
      user.planActiveFrom = Date.now();
      const duration = PLAN_DURATION_MS[user.plan];
      user.planExpiresAt = duration === null ? null : Date.now() + duration;
    } else if (action === "reject") {
      user.plan = null;
      user.planStatus = null;
      user.planSelectedAt = undefined;
      user.planActiveFrom = undefined;
      user.planExpiresAt = undefined;
    } else {
      return res.status(400).json({ error: "Action invalide (approve|reject)." });
    }

    users[idx] = user;
    writeUsers(users);
    return res.json({ user });
  });
}

export { ADMIN_EMAIL, ADMIN_TELEGRAM };
