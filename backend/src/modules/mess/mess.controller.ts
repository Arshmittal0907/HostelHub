import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { MealType, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const upsertMenuSchema = z.object({
  hostelId: z.string().uuid(),
  dayOfWeek: z.string().min(3),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER']),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  title: z.string().min(2),
  description: z.string().optional(),
  items: z.string().min(2),
  isSpecial: z.boolean().default(false),
});

export async function getMessMenu(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const menus = await prisma.messMenu.findMany({
    where: { hostelId },
    orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
  });

  res.json({ success: true, count: menus.length, data: menus });
}

export async function upsertMessMenu(req: Request, res: Response): Promise<void> {
  const data = upsertMenuSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const menu = await prisma.messMenu.upsert({
    where: {
      hostelId_dayOfWeek_mealType: {
        hostelId: data.hostelId,
        dayOfWeek: data.dayOfWeek,
        mealType: data.mealType as MealType,
      },
    },
    create: {
      hostelId: data.hostelId,
      collegeId,
      dayOfWeek: data.dayOfWeek,
      mealType: data.mealType as MealType,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      description: data.description,
      items: data.items,
      isSpecial: data.isSpecial,
    },
    update: {
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      description: data.description,
      items: data.items,
      isSpecial: data.isSpecial,
    },
  });

  await logAuditEvent(req, 'UPDATE_MESS_MENU', 'MessMenu', menu.id, {
    day: data.dayOfWeek,
    meal: data.mealType,
    title: data.title,
  });

  res.json({ success: true, message: 'Mess menu saved successfully.', data: menu });
}
