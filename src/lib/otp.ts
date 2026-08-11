/**
 * 6-digit email OTP issuance & verification (stored hashed, never raw).
 * Rate-limited: 1 send / 60s, max 6 sends per hour per user.
 */
import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const OTP_MAX_PER_HOUR = 6;
const MAX_OTP_ATTEMPTS = 5; // hard lockout per code

// Keyed HMAC so a DB dump cannot be brute-forced offline (6-digit space).
// Fails closed in production when no secret is configured.
const OTP_SECRET = (() => {
  const s = process.env.OTP_HASH_SECRET || process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("OTP_HASH_SECRET (or SESSION_SECRET) must be set when NODE_ENV=production");
  }
  return "dzads-dev-otp-secret"; // dev-only fallback
})();

export class OtpRateLimitedError extends Error {
  status = 429;
  constructor(message: string) {
    super(message);
    this.name = "OtpRateLimitedError";
  }
}

function hashOtp(code: string): string {
  return createHmac("sha256", OTP_SECRET).update(code).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export interface IssuedOtp {
  code: string;
  expiresInSec: number;
}

/** Issues a fresh OTP row for a user. Throws OtpRateLimitedError on spam. */
export async function issueOtp(
  userId: string,
  reason: "verification" | "login" | "password_reset" = "verification",
): Promise<IssuedOtp> {
  const now = new Date();

  const recent = await prisma.emailOtp.findFirst({
    where: {
      userId,
      used: false,
      createdAt: { gte: new Date(now.getTime() - OTP_RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    throw new OtpRateLimitedError(
      "Un code a déjà été envoyé. Réessaie dans une minute.",
    );
  }

  const hourAgo = new Date(now.getTime() - 3600_000);
  const sentThisHour = await prisma.emailOtp.count({
    where: { userId, createdAt: { gte: hourAgo } },
  });
  if (sentThisHour >= OTP_MAX_PER_HOUR) {
    throw new OtpRateLimitedError(
      "Trop de codes envoyés. Réessaie dans une heure.",
    );
  }

  const code = generateOtpCode();
  await prisma.emailOtp.create({
    data: {
      id: randomUUID(),
      userId,
      codeHash: hashOtp(code),
      reason,
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    },
  });

  return { code, expiresInSec: Math.floor(OTP_TTL_MS / 1000) };
}

/** Validates a submitted code; consumes it (marks used) on success. */
export async function verifyOtpCode(
  userId: string,
  code: string,
  opts?: { reasons?: string[] },
): Promise<boolean> {
  const codeStr = String(code || "").trim();
  if (!/^\d{6}$/.test(codeStr)) return false;

  const reasons = opts?.reasons ?? ["verification", "login"];
  const otp = await prisma.emailOtp.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: { gt: new Date() },
      reason: { in: reasons },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;

  // Already locked out — burn the code so it can't be matched later.
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { used: true } });
    return false;
  }

  const expected = Buffer.from(hashOtp(codeStr), "hex");
  const candidate = Buffer.from(otp.codeHash, "hex");
  const match =
    expected.length === candidate.length &&
    timingSafeEqual(expected, candidate);

  if (match) {
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { used: true } });
  } else {
    // Increment the guess counter; lock the code out at the limit.
    const attempts = otp.attempts + 1;
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts, used: attempts >= MAX_OTP_ATTEMPTS },
    });
  }
  return match;
}
