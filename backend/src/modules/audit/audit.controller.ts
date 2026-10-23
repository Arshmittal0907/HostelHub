import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { Role } from '@prisma/client';

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const { action, entityType, limit = '50', page = '1' } = req.query;

  const where: any = {};

  if (req.user!.role !== Role.PLATFORM_ADMIN) {
    if (!req.collegeId) {
      res.status(400).json({ success: false, message: 'College ID is required.' });
      return;
    }
    where.collegeId = req.collegeId;
  }

  if (action) where.action = String(action);
  if (entityType) where.entityType = String(entityType);

  const take = Math.min(parseInt(String(limit), 10) || 50, 100);
  const skip = (Math.max(parseInt(String(page), 10) || 1, 1) - 1) * take;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { fullName: true, email: true, role: true } },
        college: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
  ]);

  res.json({
    success: true,
    total,
    page: parseInt(String(page), 10),
    totalPages: Math.ceil(total / take),
    data: logs,
  });
}
