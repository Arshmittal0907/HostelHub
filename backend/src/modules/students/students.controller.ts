import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { StudentStatus, AllocationStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const approveStudentSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

const updateProfileSchema = z.object({
  phone: z.string().min(10).optional(),
  emergencyContact: z.string().min(5).optional(),
});

export async function listStudents(req: Request, res: Response): Promise<void> {
  const collegeId = req.collegeId;
  const hostelId = (req.query.hostelId as string) || req.hostelId;
  const { status, search, course, year } = req.query;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const where: any = { collegeId };
  if (hostelId) where.hostelId = hostelId;
  if (status) where.status = status as StudentStatus;
  if (course) where.course = { contains: String(course), mode: 'insensitive' };
  if (year) where.year = parseInt(String(year), 10);

  if (search) {
    where.OR = [
      { rollNumber: { contains: String(search), mode: 'insensitive' } },
      { user: { fullName: { contains: String(search), mode: 'insensitive' } } },
      { user: { email: { contains: String(search), mode: 'insensitive' } } },
    ];
  }

  const students = await prisma.studentProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
      },
      hostel: {
        select: { id: true, name: true, type: true },
      },
      allocations: {
        where: { status: AllocationStatus.ACTIVE },
        include: {
          bed: true,
          room: { select: { roomNumber: true, floor: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = students.map((s) => ({
    id: s.id,
    userId: s.userId,
    fullName: s.user.fullName,
    email: s.user.email,
    phone: s.user.phone,
    rollNumber: s.rollNumber,
    course: s.course,
    year: s.year,
    emergencyContact: s.emergencyContact,
    status: s.status,
    hostelName: s.hostel.name,
    hostelType: s.hostel.type,
    allocation: s.allocations.length > 0
      ? {
          roomNumber: s.allocations[0].room.roomNumber,
          floor: s.allocations[0].room.floor,
          bedNumber: s.allocations[0].bed.bedNumber,
        }
      : null,
    createdAt: s.createdAt,
  }));

  res.json({ success: true, count: formatted.length, data: formatted });
}

export async function approveStudent(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { decision, reason } = approveStudentSchema.parse(req.body);

  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: { user: true, college: true },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student application not found.' });
    return;
  }

  const newStatus = decision === 'APPROVED' ? StudentStatus.APPROVED : StudentStatus.REJECTED;

  await prisma.$transaction(async (tx) => {
    await tx.studentProfile.update({
      where: { id },
      data: {
        status: newStatus,
        approvedAt: new Date(),
        approvedById: req.user!.id,
      },
    });

    await tx.collegeMembership.updateMany({
      where: { userId: student.userId, collegeId: student.collegeId },
      data: {
        isApproved: decision === 'APPROVED',
        approvedAt: new Date(),
        approvedById: req.user!.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: student.userId,
        title: `Hostel Application ${decision}`,
        message: decision === 'APPROVED'
          ? 'Your hostel registration has been approved by the Warden! Room allocation is now pending.'
          : `Your hostel registration was rejected: ${reason || 'Application criteria not met.'}`,
        type: decision === 'APPROVED' ? 'SUCCESS' : 'ALERT',
        link: '/student/profile',
      },
    });
  });

  await logAuditEvent(req, `STUDENT_REGISTRATION_${decision}`, 'StudentProfile', id, {
    studentName: student.user.fullName,
    rollNumber: student.rollNumber,
    decision,
    reason,
  });

  res.json({
    success: true,
    message: `Student application for ${student.user.fullName} (${student.rollNumber}) marked as ${newStatus}.`,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can update student profile.' });
    return;
  }

  const data = updateProfileSchema.parse(req.body);

  await prisma.$transaction(async (tx) => {
    if (data.phone) {
      await tx.user.update({
        where: { id: req.user!.id },
        data: { phone: data.phone },
      });
    }

    if (data.emergencyContact) {
      await tx.studentProfile.update({
        where: { userId: req.user!.id },
        data: { emergencyContact: data.emergencyContact },
      });
    }
  });

  res.json({ success: true, message: 'Profile updated successfully.' });
}
