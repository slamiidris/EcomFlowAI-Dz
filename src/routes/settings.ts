import express, { Router } from "express";
import { prisma } from "../lib/prisma";
import { encryptSecret, maskSecret } from "../lib/crypto";
import { requireAuth, SessionPayload } from "../lib/session";

const router = Router();

const DEFAULT_SETTINGS = {
  facebookAdsToken: "",
  facebookAccountId: "",
  tiktokAdsToken: "",
  tiktokAccountId: "",
  googleAdsCustomerId: "",
  googleAdsDeveloperToken: "",
  snapAdsToken: "",
  snapAccountId: "",
  geminiApiKey: "",
  workspaceName: "E-com DZ Workspace",
  customApiToken: "",
};

// Fields that hold secrets — encrypted at rest, never returned in full.
const SECRET_FIELDS = [
  "facebookAdsToken",
  "tiktokAdsToken",
  "googleAdsDeveloperToken",
  "snapAdsToken",
  "geminiApiKey",
  "customApiToken",
] as const;

// Non-secret identifier fields.
const IDENTIFIER_FIELDS = [
  "facebookAccountId",
  "tiktokAccountId",
  "googleAdsCustomerId",
  "snapAccountId",
  "workspaceName",
] as const;

/** Masks every secret field so raw tokens never reach the browser. */
function toMasked<T extends Record<string, any>>(settings: T) {
  const out: Record<string, any> = { ...settings };
  for (const f of SECRET_FIELDS) {
    out[f] = maskSecret(settings[f]) ?? "";
  }
  return out;
}

// GET /api/settings — the user's ad-platform settings (secrets masked).
router.get("/api/settings", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const settings = await prisma.apiSettings.findUnique({
    where: { userId: user.sub },
  });
  if (!settings) {
    return res.json({ userId: user.sub, ...DEFAULT_SETTINGS });
  }
  res.json(toMasked(settings));
});

// PUT /api/settings — upsert the user's settings (userId is the unique key).
// Secret fields are encrypted before storage; an empty/absent value preserves
// the existing secret instead of overwriting it with a blank.
router.put("/api/settings", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const b = req.body || {};
  const existing = await prisma.apiSettings.findUnique({
    where: { userId: user.sub },
  });

  const createData: Record<string, any> = { userId: user.sub };
  const updateData: Record<string, any> = {};

  for (const f of SECRET_FIELDS) {
    const value = b[f];
    if (value != null && value !== "") {
      const enc = encryptSecret(String(value));
      createData[f] = enc;
      updateData[f] = enc;
    } else if (existing?.[f]) {
      // Leave a blank untouched — keep the currently stored secret.
      updateData[f] = existing[f];
    }
  }

  for (const f of IDENTIFIER_FIELDS) {
    const value = b[f];
    const v = value == null ? null : String(value) || null;
    createData[f] = v;
    updateData[f] = v;
  }
  if (createData.workspaceName == null) createData.workspaceName = "E-com DZ Workspace";

  const settings = await prisma.apiSettings.upsert({
    where: { userId: user.sub },
    create: createData as any,
    update: updateData as any,
  });
  res.json(toMasked(settings));
});

export const settingsRouter = router;
