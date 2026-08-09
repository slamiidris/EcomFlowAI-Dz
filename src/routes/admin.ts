import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../lib/session';
import { requireAdmin } from '../lib/admin';

const router = Router();

// GET /api/admin/pending-payments
router.get('/api/admin/pending-payments', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { planStatus: 'pending', plan: { not: null } },
      select: {
        id: true, name: true, email: true, plan: true, planStatus: true,
        paymentProof: true, paymentMethod: true, paymentSubmittedAt: true,
        planSelectedAt: true, createdAt: true,
      },
      orderBy: { planSelectedAt: 'desc' },
    });
    res.json(pendingUsers);
  } catch (err) {
    console.error('Get pending payments error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/all-users
router.get('/api/admin/all-users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, plan: true, planStatus: true,
        isAdmin: true, paymentMethod: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/approve/:userId
router.post('/api/admin/approve/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    if (user.planStatus !== 'pending') return res.status(400).json({ error: 'Pas en attente.' });

    const now = new Date();
    let expiresAt: Date | null = null;
    if (user.plan === 'monthly') expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    else if (user.plan === 'quarterly') expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { planStatus: 'active', planActiveFrom: now, planExpiresAt: expiresAt },
    });
    res.json({ ok: true, message: `Plan activé pour ${user.email}.` });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/reject/:userId
router.post('/api/admin/reject/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    await prisma.user.update({
      where: { id: userId },
      data: { planStatus: null, plan: null, paymentProof: null, paymentMethod: null, paymentSubmittedAt: null },
    });
    res.json({ ok: true, message: `Paiement de ${user.email} rejeté.` });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/set-admin/:userId
router.post('/api/admin/set-admin/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = String(req.params.userId);
    await prisma.user.update({ where: { id: userId }, data: { isAdmin: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Set admin error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/stats
router.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, activeSubs, pendingPayments, totalGenerations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { planStatus: 'active' } }),
      prisma.user.count({ where: { planStatus: 'pending' } }),
      prisma.generationHistory.count(),
    ]);
    res.json({ totalUsers, activeSubs, pendingPayments, totalGenerations });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
