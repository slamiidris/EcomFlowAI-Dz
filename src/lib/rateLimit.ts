/**
 * Minimal in-memory fixed-window rate limiter for Express.
 *
 * Best-effort per warm serverless instance. For durable cross-instance
 * limits (e.g. OTP guessing) pair it with DB-backed counters — see the
 * `attempts` lockout in src/lib/otp.ts.
 */
import type { NextFunction, Request, Response } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  /** Build a key from the request (default: client IP). */
  keyFn?: (req: Request) => string;
  message?: string;
  /** HTTP status to return when limited (default 429). */
  status?: number;
}

export function createRateLimiter(opts: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Trop de requêtes. Réessaie plus tard.",
    status = 429,
  } = opts;
  const keyFn =
    opts.keyFn ?? ((req: Request) => req.ip || req.socket?.remoteAddress || "unknown");
  const buckets = new Map<string, Bucket>();

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const key = keyFn(req);
    const bucket = buckets.get(key);

    // Fresh window (also lazily prunes stale buckets).
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(status).json({ error: message });
    }
    next();
  };
}
