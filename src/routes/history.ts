import express, { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, SessionPayload } from "../lib/session";

const router = Router();

const HISTORY_LIMIT = 20;

// GET /api/history — list the user's recent generation history (max 20).
router.get("/api/history", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const history = await prisma.generationHistory.findMany({
    where: { userId: user.sub },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  res.json(history);
});

// POST /api/history — create a history entry.
router.post("/api/history", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const b = req.body || {};
  if (!b.type || !b.title) {
    return res.status(400).json({ error: "type et title sont requis." });
  }
  const entry = await prisma.generationHistory.create({
    data: {
      userId: user.sub,
      type: b.type,
      title: b.title,
      previewText: b.previewText,
      payload: b.payload ?? {},
      metadata: b.metadata,
    },
  });
  res.json(entry);
});

// DELETE /api/history/:id — delete a single entry owned by the user.
router.delete("/api/history/:id", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  const id = req.params.id as string;
  const existing = await prisma.generationHistory.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.sub) {
    return res.status(404).json({ error: "Entrée introuvable." });
  }
  await prisma.generationHistory.delete({ where: { id } });
  res.json({ ok: true });
});

// DELETE /api/history — clear all history for the user.
router.delete("/api/history", requireAuth, async (req, res) => {
  const user = req.user as SessionPayload;
  await prisma.generationHistory.deleteMany({ where: { userId: user.sub } });
  res.json({ ok: true });
});

export const historyRouter = router;
