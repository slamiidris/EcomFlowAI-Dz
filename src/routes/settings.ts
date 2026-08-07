import express, { Router } from "express";
import { prisma } from "../lib/prisma";
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

// GET /api/settings — the user's ad-platform settings (or empty defaults).
router.get("/api/settings", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const settings = await prisma.apiSettings.findUnique({
    where: { userId: user.sub },
  });
  if (!settings) {
    return res.json({ userId: user.sub, ...DEFAULT_SETTINGS });
  }
  res.json(settings);
});

// PUT /api/settings — upsert the user's settings (userId is the unique key).
router.put("/api/settings", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const b = req.body || {};
  const settings = await prisma.apiSettings.upsert({
    where: { userId: user.sub },
    create: {
      userId: user.sub,
      facebookAdsToken: b.facebookAdsToken,
      facebookAccountId: b.facebookAccountId,
      tiktokAdsToken: b.tiktokAdsToken,
      tiktokAccountId: b.tiktokAccountId,
      googleAdsCustomerId: b.googleAdsCustomerId,
      googleAdsDeveloperToken: b.googleAdsDeveloperToken,
      snapAdsToken: b.snapAdsToken,
      snapAccountId: b.snapAccountId,
      geminiApiKey: b.geminiApiKey,
      workspaceName: b.workspaceName || "E-com DZ Workspace",
      customApiToken: b.customApiToken,
    },
    update: {
      facebookAdsToken: b.facebookAdsToken,
      facebookAccountId: b.facebookAccountId,
      tiktokAdsToken: b.tiktokAdsToken,
      tiktokAccountId: b.tiktokAccountId,
      googleAdsCustomerId: b.googleAdsCustomerId,
      googleAdsDeveloperToken: b.googleAdsDeveloperToken,
      snapAdsToken: b.snapAdsToken,
      snapAccountId: b.snapAccountId,
      geminiApiKey: b.geminiApiKey,
      workspaceName: b.workspaceName,
      customApiToken: b.customApiToken,
    },
  });
  res.json(settings);
});

export const settingsRouter = router;
