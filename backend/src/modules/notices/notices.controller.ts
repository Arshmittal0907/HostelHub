import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { TargetAudience, NoticePriority, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createNoticeSchema = z.object({
  hostelId: z.string().uuid().optional(),
  targetAudience: z.enum(['ALL', 'STUDENTS_ONLY', 'WARDENS_ONLY', 'SPECIFIC_HOSTEL']).default('ALL'),
  title: z.string().min(5),
  content: z.string().min(10),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  expiresAt: z.string().optional(),
});

export async function listNotices(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const where: any = { collegeId };

  if (req.user!.role === Role.STUDENT) {
    where.targetAudience = { in: [TargetAudience.ALL, TargetAudience.STUDENTS_ONLY, TargetAudience.SPECIFIC_HOSTEL] };
    if (req.hostelId) {
      where.OR = [{ hostelId: null }, { hostelId: req.hostelId }];
    }
  }

  const notices = await prisma.notice.findMany({
    where,
    include: {
      publishedBy: { select: { fullName: true, role: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ success: true, count: notices.length, data: notices });
}

export async function createNotice(req: Request, res: Response): Promise<void> {
  const data = createNoticeSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const notice = await prisma.notice.create({
    data: {
      collegeId,
      hostelId: data.hostelId || null,
      targetAudience: data.targetAudience as TargetAudience,
      title: data.title,
      content: data.content,
      priority: data.priority as NoticePriority,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      publishedById: req.user!.id,
    },
  });

  await logAuditEvent(req, 'PUBLISH_NOTICE', 'Notice', notice.id, {
    title: data.title,
    priority: data.priority,
    audience: data.targetAudience,
  });

  res.status(201).json({ success: true, message: 'Notice published.', data: notice });
}

export async function getMyNotifications(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({ success: true, unreadCount, count: notifications.length, data: notifications });
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  await prisma.notification.updateMany({
    where: { id, userId: req.user!.id },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'Marked as read.' });
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'All notifications marked as read.' });
}
