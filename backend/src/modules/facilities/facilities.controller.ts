import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { FacilityType, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createRuleSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(10),
  penaltyDetails: z.string().optional(),
});

const createMenuItemSchema = z.object({
  facilityId: z.string().uuid(),
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
  isAvailable: z.boolean().default(true),
  mealTiming: z.string().optional(),
});

export async function listRules(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const rules = await prisma.hostelRule.findMany({
    where: {
      collegeId,
      isActive: true,
      OR: [{ hostelId: null }, { hostelId: hostelId || undefined }],
    },
    orderBy: [{ category: 'asc' }, { updatedAt: 'desc' }],
  });

  res.json({ success: true, count: rules.length, data: rules });
}

export async function createRule(req: Request, res: Response): Promise<void> {
  const data = createRuleSchema.parse(req.body);
  const collegeId = req.collegeId;
  const hostelId = req.hostelId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const rule = await prisma.hostelRule.create({
    data: {
      collegeId,
      hostelId: hostelId || null,
      category: data.category,
      title: data.title,
      description: data.description,
      penaltyDetails: data.penaltyDetails,
    },
  });

  await logAuditEvent(req, 'CREATE_RULE', 'HostelRule', rule.id, {
    title: data.title,
    category: data.category,
  });

  res.status(201).json({ success: true, message: 'Hostel rule published.', data: rule });
}

export async function listFacilities(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  const { type } = req.query;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const where: any = { collegeId, isActive: true };
  if (type) where.type = type as FacilityType;

  const facilities = await prisma.facility.findMany({
    where,
    include: {
      hours: true,
      menuItems: true,
      staff: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { type: 'asc' },
  });

  res.json({ success: true, count: facilities.length, data: facilities });
}

export async function addMenuItem(req: Request, res: Response): Promise<void> {
  const data = createMenuItemSchema.parse(req.body);

  const item = await prisma.cafeteriaMenuItem.create({
    data: {
      facilityId: data.facilityId,
      name: data.name,
      category: data.category,
      price: data.price,
      isAvailable: data.isAvailable,
      mealTiming: data.mealTiming,
    },
  });

  res.status(201).json({ success: true, message: 'Cafeteria item added.', data: item });
}
