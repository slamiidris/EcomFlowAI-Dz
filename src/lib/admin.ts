import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ error: 'Non autorisé.' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
