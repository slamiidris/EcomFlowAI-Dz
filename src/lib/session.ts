/**
 * HMAC-signed session cookie helpers + Express middleware.
 * Shared by all authenticated routes.
 */
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

// Fail closed: in production the secret is mandatory. A missing/empty secret
// would otherwise let anyone forge sessions AND password-reset tokens.
const SESSION_SECRET = (() => {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set when NODE_ENV=production");
  }
  return "dzads-dev-session-secret"; // dev-only fallback
})();

export const SESSION_COOKIE = "dzads_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 3600 * 1000; // 30 days

// ---- Session payload -------------------------------------------------------

export interface SessionPayload {
  sub: string;     // user id
  email: string;
  name: string;
  avatar?: string;
  mock?: boolean;
}

// Attach the verified session to `req.user` so authenticated route handlers
// can use `const user = req.user as SessionPayload;`.
declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

// ---- Signing / verifying ---------------------------------------------------

export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
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

// ---- Cookie parsing --------------------------------------------------------

export function parseCookies(req: Request): Record<string, string> {
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

export function getCurrentUser(req: Request): SessionPayload | null {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySession(token);
}

// ---- Express middleware -----------------------------------------------------

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentification requise." });
  }
  (req as any).user = user;
  next();
}

// ---- Cookie helpers --------------------------------------------------------

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Never send the session cookie over plain HTTP in production.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

// ---- Password reset tokens --------------------------------------------------

const RESET_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function signResetToken(email: string): string {
  const payload = JSON.stringify({ purpose: 'password_reset', email: email.toLowerCase(), exp: Date.now() + RESET_TTL_MS });
  const body = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyResetToken(token: string): { email: string } | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.purpose !== 'password_reset') return null;
    if (Date.now() > payload.exp) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
