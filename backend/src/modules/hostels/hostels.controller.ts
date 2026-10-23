import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

const createHostelSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['BOYS', 'GIRLS', 'MIXED']),
  totalFloors: z.number().int().min(1).max(20).default(3),
  description: z.string().optional(),
});

export async function listHostels(req: Request, res: Response): Promise<void> {
  const collegeId = (req.query.collegeId as string) || req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const hostels = await prisma.hostel.findMany({
    where: { collegeId },
    include: {
      blocks: {
        include: {
          rooms: {
            include: {
              beds: true,
            },
          },
        },
      },
      wardenAssignments: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formatted = hostels.map((h) => {
    let totalBeds = 0;
    let occupiedBeds = 0;
    let availableBeds = 0;

    h.blocks.forEach((b) => {
      b.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          totalBeds++;
          if (bed.status === 'OCCUPIED') occupiedBeds++;
          if (bed.status === 'AVAILABLE') availableBeds++;
        });
      });
    });

    return {
      id: h.id,
      name: h.name,
      type: h.type,
      totalFloors: h.totalFloors,
      description: h.description,
      blocksCount: h.blocks.length,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      wardens: h.wardenAssignments.map((w) => w.user),
    };
  });

  res.json({ success: true, data: formatted });
}

export async function getHostelById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: {
      blocks: {
        include: {
          rooms: {
            include: {
              beds: true,
            },
          },
        },
      },
      wardenAssignments: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      },
    },
  });

  if (!hostel) {
    res.status(404).json({ success: false, message: 'Hostel not found.' });
    return;
  }

  // Cross-college data check
  if (req.user && req.user.role !== Role.PLATFORM_ADMIN && req.user.collegeId !== hostel.collegeId) {
    res.status(403).json({ success: false, message: 'Cross-college access forbidden.' });
    return;
  }

  res.json({ success: true, data: hostel });
}

export async function createHostel(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const data = createHostelSchema.parse(req.body);

  const existing = await prisma.hostel.findFirst({
    where: { collegeId, name: data.name },
  });

  if (existing) {
    res.status(400).json({ success: false, message: 'A hostel with this name already exists in your college.' });
    return;
  }

  const hostel = await prisma.hostel.create({
    data: {
      collegeId,
      name: data.name,
      type: data.type,
      totalFloors: data.totalFloors,
      description: data.description,
    },
  });

  res.status(201).json({ success: true, message: 'Hostel created successfully.', data: hostel });
}
