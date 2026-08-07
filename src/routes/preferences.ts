import express, { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, SessionPayload } from "../lib/session";

const router = Router();

const DEFAULT_WIDGETS = ["featured", "stats", "geo", "prediction", "history"];

// GET /api/preferences — the user's UI preferences (created on first access).
router.get("/api/preferences", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  let prefs = await prisma.userPreferences.findUnique({
    where: { userId: user.sub },
  });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: {
        userId: user.sub,
        toolsOrder: [],
        dashboardConfig: {},
        dashboardWidgetOrder: DEFAULT_WIDGETS,
        language: "fr",
        theme: "dark",
      },
    });
  }
  res.json(prefs);
});

// PUT /api/preferences — partial update / upsert of the user's preferences.
router.put("/api/preferences", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const b = req.body || {};
  const data: any = {};
  if (b.toolsOrder !== undefined) data.toolsOrder = b.toolsOrder;
  if (b.dashboardConfig !== undefined) data.dashboardConfig = b.dashboardConfig;
  if (b.dashboardWidgetOrder !== undefined) data.dashboardWidgetOrder = b.dashboardWidgetOrder;
  if (b.language !== undefined) data.language = b.language;
  if (b.theme !== undefined) data.theme = b.theme;
  if (b.lastImage !== undefined) data.lastImage = b.lastImage;
  if (b.lastScript !== undefined) data.lastScript = b.lastScript;
  if (b.lastLpActiveId !== undefined) data.lastLpActiveId = b.lastLpActiveId;
  if (b.lastChatActiveId !== undefined) data.lastChatActiveId = b.lastChatActiveId;

  if (Object.keys(data).length === 0) {
    // Nothing to update — return the current preferences (or create defaults).
    const existing = await prisma.userPreferences.findUnique({
      where: { userId: user.sub },
    });
    if (existing) return res.json(existing);
    const created = await prisma.userPreferences.create({
      data: { userId: user.sub },
    });
    return res.json(created);
  }

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.sub },
    create: { userId: user.sub, ...data },
    update: data,
  });
  res.json(prefs);
});

export const preferencesRouter = router;
