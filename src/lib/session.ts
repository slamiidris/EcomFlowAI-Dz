/**
 * HMAC-signed session cookie helpers + Express middleware.
 * Shared by all authenticated routes.
 */
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "dzads-dev-session-secret");

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
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
