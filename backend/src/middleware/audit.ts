import { Request } from 'express';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

export async function logAuditEvent(
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any> | string
): Promise<void> {
  try {
    if (!req.user) return;

    await prisma.auditLog.create({
      data: {
        collegeId: req.user.collegeId || null,
        actorId: req.user.id,
        actorRole: req.user.role,
        action,
        entityType,
        entityId,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
