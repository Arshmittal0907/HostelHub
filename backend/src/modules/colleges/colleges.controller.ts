import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { CollegeStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';
import { z } from 'zod';

const verifyCollegeSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'REQUEST_INFO']),
  reason: z.string().min(5),
});

export async function getApprovedColleges(req: Request, res: Response): Promise<void> {
  const { search, city, state } = req.query;

  const where: any = {
    status: CollegeStatus.APPROVED,
  };

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
      { city: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  if (city) {
    where.city = { contains: String(city), mode: 'insensitive' };
  }

  if (state) {
    where.state = { contains: String(state), mode: 'insensitive' };
  }

  const colleges = await prisma.college.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      state: true,
      website: true,
      officialEmail: true,
      phone: true,
      hostels: {
        select: {
          id: true,
          name: true,
          type: true,
          totalFloors: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, count: colleges.length, data: colleges });
}

export async function getCollegeById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      hostels: {
        select: {
          id: true,
          name: true,
          type: true,
          totalFloors: true,
          description: true,
        },
      },
    },
  });

  if (!college) {
    res.status(404).json({ success: false, message: 'College not found.' });
    return;
  }

  // Non-admins can only see public approved colleges unless they are members
  if (college.status !== CollegeStatus.APPROVED) {
    if (!req.user || req.user.role !== Role.PLATFORM_ADMIN) {
      res.status(403).json({ success: false, message: 'This college is currently pending verification.' });
      return;
    }
  }

  res.json({ success: true, data: college });
}

export async function adminListColleges(req: Request, res: Response): Promise<void> {
  const { status, search } = req.query;

  const where: any = {};
  if (status) {
    where.status = status as CollegeStatus;
  }
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { code: { contains: String(search), mode: 'insensitive' } },
      { city: { contains: String(search), mode: 'insensitive' } },
      { officialEmail: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const colleges = await prisma.college.findMany({
    where,
    include: {
      documents: true,
      hostels: true,
      reviewedBy: {
        select: { id: true, fullName: true, email: true },
      },
      verificationReviews: {
        orderBy: { reviewedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, count: colleges.length, data: colleges });
}

export async function adminVerifyCollege(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { decision, reason } = verifyCollegeSchema.parse(req.body);

  const college = await prisma.college.findUnique({
    where: { id },
  });

  if (!college) {
    res.status(404).json({ success: false, message: 'College not found.' });
    return;
  }

  let newStatus: CollegeStatus;
  if (decision === 'APPROVED') {
    newStatus = CollegeStatus.APPROVED;
  } else if (decision === 'REJECTED') {
    newStatus = CollegeStatus.REJECTED;
  } else {
    newStatus = CollegeStatus.PENDING_VERIFICATION;
  }

  const updatedCollege = await prisma.$transaction(async (tx) => {
    const col = await tx.college.update({
      where: { id },
      data: {
        status: newStatus,
        verificationNotes: reason,
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
      },
    });

    await tx.verificationReview.create({
      data: {
        collegeId: id,
        reviewedById: req.user!.id,
        decision,
        reason,
      },
    });

    return col;
  });

  await logAuditEvent(req, `COLLEGE_VERIFICATION_${decision}`, 'College', id, {
    collegeName: college.name,
    decision,
    reason,
  });

  res.json({
    success: true,
    message: `College '${college.name}' status updated to ${newStatus}.`,
    data: updatedCollege,
  });
}
