import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { LeaveType, LeaveStatus, Role } from '@prisma/client';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { logAuditEvent } from '../../middleware/audit';

const applyLeaveSchema = z.object({
  leaveType: z.enum(['WEEKEND', 'HOME_VISIT', 'MEDICAL', 'EMERGENCY', 'OTHER']).default('HOME_VISIT'),
  startDate: z.string(), // ISO datetime
  endDate: z.string(), // ISO datetime
  reason: z.string().min(5),
  destination: z.string().min(3),
  contactNumber: z.string().min(10),
  emergencyContact: z.string().optional(),
});

const reviewLeaveSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  wardenRemarks: z.string().optional(),
});

export async function applyLeave(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can apply for leave.' });
    return;
  }

  const data = applyLeaveSchema.parse(req.body);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      studentId: student.id,
      collegeId: student.collegeId,
      hostelId: student.hostelId,
      leaveType: data.leaveType as LeaveType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      destination: data.destination,
      contactNumber: data.contactNumber,
      emergencyContact: data.emergencyContact,
      status: LeaveStatus.PENDING,
    },
  });

  await logAuditEvent(req, 'APPLY_LEAVE', 'LeaveRequest', leave.id, {
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
  });

  res.status(201).json({
    success: true,
    message: 'Leave application submitted successfully. Awaiting Warden approval.',
    data: leave,
  });
}

export async function listLeaveRequests(req: Request, res: Response): Promise<void> {
  const { status } = req.query;
  const where: any = {};

  if (req.user!.role === Role.STUDENT) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }
    where.studentId = student.id;
  } else {
    // Warden or Admin
    const hostelId = (req.query.hostelId as string) || req.hostelId;
    if (hostelId) where.hostelId = hostelId;
    if (req.collegeId) where.collegeId = req.collegeId;
  }

  if (status) where.status = status as LeaveStatus;

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: { room: true, bed: true },
          },
        },
      },
      approvedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // For approved leaves, attach generated QR code
  const enriched = await Promise.all(
    leaves.map(async (l) => {
      let qrCodeDataUrl = null;
      if (l.status === LeaveStatus.APPROVED && l.qrToken) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(
            JSON.stringify({
              passCode: l.passCode,
              qrToken: l.qrToken,
              validUntil: l.endDate,
            })
          );
        } catch (e) {
          console.error('QR code generation error:', e);
        }
      }
      return {
        ...l,
        qrCodeDataUrl,
      };
    })
  );

  res.json({ success: true, count: enriched.length, data: enriched });
}

export async function reviewLeave(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { decision, wardenRemarks } = reviewLeaveSchema.parse(req.body);

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      student: { include: { user: true } },
    },
  });

  if (!leave) {
    res.status(404).json({ success: false, message: 'Leave request not found.' });
    return;
  }

  let passCode = null;
  let qrToken = null;

  if (decision === 'APPROVED') {
    passCode = `PASS-${Date.now().toString().slice(-6)}`;
    qrToken = crypto.randomBytes(24).toString('hex');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const l = await tx.leaveRequest.update({
      where: { id },
      data: {
        status: decision === 'APPROVED' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
        approvedById: req.user!.id,
        approvedAt: new Date(),
        wardenRemarks,
        passCode,
        qrToken,
      },
    });

    await tx.notification.create({
      data: {
        userId: leave.student.userId,
        title: `Leave Request ${decision}`,
        message: decision === 'APPROVED'
          ? `Your leave request for ${leave.destination} is APPROVED. Digital Pass: ${passCode}`
          : `Your leave request was rejected: ${wardenRemarks || 'Administrative discretion'}`,
        type: decision === 'APPROVED' ? 'SUCCESS' : 'ALERT',
        link: '/student/leave',
      },
    });

    return l;
  });

  await logAuditEvent(req, `LEAVE_${decision}`, 'LeaveRequest', id, {
    decision,
    passCode,
    wardenRemarks,
  });

  res.json({
    success: true,
    message: `Leave request ${decision.toLowerCase()} successfully.`,
    data: updated,
  });
}

// Verification endpoint for Campus Security Gate
export async function verifyLeavePass(req: Request, res: Response): Promise<void> {
  const tokenOrCode = String(req.params.tokenOrCode);

  const leave: any = await prisma.leaveRequest.findFirst({
    where: {
      OR: [{ qrToken: tokenOrCode }, { passCode: tokenOrCode }],
    },
    include: {
      student: {
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: { room: true, bed: true },
          },
        },
      },
      hostel: { select: { name: true, type: true } },
      college: { select: { name: true } },
      approvedBy: { select: { fullName: true } },
    },
  });

  if (!leave) {
    res.status(404).json({
      success: false,
      valid: false,
      message: 'Invalid Gate Pass. No matching leave record found in database.',
    });
    return;
  }

  const now = new Date();
  const isExpired = now > leave.endDate;
  const isNotYetActive = now < new Date(leave.startDate.getTime() - 4 * 60 * 60 * 1000); // Allow 4h early exit window

  let statusMessage = 'VALID GATE PASS';
  let isValid = true;

  if (leave.status !== LeaveStatus.APPROVED) {
    statusMessage = `PASS INVALID: Status is ${leave.status}`;
    isValid = false;
  } else if (isExpired) {
    statusMessage = 'PASS EXPIRED: Return window has lapsed';
    isValid = false;
  } else if (isNotYetActive) {
    statusMessage = 'APPROVED (UPCOMING WINDOW)';
    isValid = true;
  }

  res.json({
    success: true,
    valid: isValid,
    statusMessage,
    data: {
      passCode: leave.passCode,
      studentName: leave.student.user.fullName,
      rollNumber: leave.student.rollNumber,
      college: leave.college.name,
      hostel: leave.hostel.name,
      roomNumber: leave.student.allocations.length > 0 ? leave.student.allocations[0].room.roomNumber : 'N/A',
      destination: leave.destination,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      approvedBy: leave.approvedBy?.fullName,
      approvedAt: leave.approvedAt,
    },
  });
}
