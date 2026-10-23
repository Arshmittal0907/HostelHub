import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { AttendanceStatus, SessionType, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createSessionSchema = z.object({
  hostelId: z.string().uuid(),
  date: z.string(), // ISO date string e.g. "2026-10-23"
  sessionType: z.enum(['MORNING', 'EVENING', 'NIGHT']).default('EVENING'),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LEAVE', 'LATE']),
      remarks: z.string().optional(),
    })
  ).optional(),
});

const correctAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LEAVE', 'LATE']),
  correctionReason: z.string().min(3),
});

export async function createSession(req: Request, res: Response): Promise<void> {
  const data = createSessionSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const sessionDate = new Date(data.date);

  // Check if session already exists for this date and type
  let session = await prisma.attendanceSession.findFirst({
    where: {
      hostelId: data.hostelId,
      date: sessionDate,
      sessionType: data.sessionType as SessionType,
    },
  });

  if (!session) {
    session = await prisma.attendanceSession.create({
      data: {
        hostelId: data.hostelId,
        collegeId,
        date: sessionDate,
        sessionType: data.sessionType as SessionType,
        conductedById: req.user!.id,
      },
    });
  }

  // If records provided, bulk upsert them
  if (data.records && data.records.length > 0) {
    for (const rec of data.records) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: rec.studentId,
          },
        },
        create: {
          sessionId: session.id,
          studentId: rec.studentId,
          status: rec.status as AttendanceStatus,
          remarks: rec.remarks,
        },
        update: {
          status: rec.status as AttendanceStatus,
          remarks: rec.remarks,
        },
      });
    }
  }

  await logAuditEvent(req, 'RECORD_ATTENDANCE_SESSION', 'AttendanceSession', session.id, {
    date: data.date,
    sessionType: data.sessionType,
    recordsCount: data.records?.length || 0,
  });

  res.status(201).json({ success: true, message: 'Attendance session recorded successfully.', data: session });
}

export async function listSessions(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: { hostelId },
    include: {
      conductedBy: { select: { fullName: true, email: true } },
      records: {
        include: {
          student: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 30,
  });

  res.json({ success: true, count: sessions.length, data: sessions });
}

export async function correctRecord(req: Request, res: Response): Promise<void> {
  const recordId = String(req.params.recordId);
  const { status, correctionReason } = correctAttendanceSchema.parse(req.body);

  const record = await prisma.attendanceRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    res.status(404).json({ success: false, message: 'Attendance record not found.' });
    return;
  }

  const updated = await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: {
      status: status as AttendanceStatus,
      correctedById: req.user!.id,
      correctedAt: new Date(),
      correctionReason,
    },
  });

  await logAuditEvent(req, 'CORRECT_ATTENDANCE', 'AttendanceRecord', recordId, {
    oldStatus: record.status,
    newStatus: status,
    reason: correctionReason,
  });

  res.json({ success: true, message: 'Attendance corrected successfully.', data: updated });
}

export async function getStudentAttendance(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Student role required.' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!profile) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: profile.id },
    include: {
      session: {
        include: { conductedBy: { select: { fullName: true } } },
      },
      correctedBy: { select: { fullName: true } },
    },
    orderBy: { session: { date: 'desc' } },
  });

  const totalSessions = records.length;
  const presentCount = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
  const lateCount = records.filter((r) => r.status === AttendanceStatus.LATE).length;
  const absentCount = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
  const leaveCount = records.filter((r) => r.status === AttendanceStatus.LEAVE).length;

  const attendancePercentage = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 100;

  res.json({
    success: true,
    data: {
      totalSessions,
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      attendancePercentage,
      records: records.map((r) => ({
        id: r.id,
        date: r.session.date,
        sessionType: r.session.sessionType,
        status: r.status,
        remarks: r.remarks,
        conductedBy: r.session.conductedBy.fullName,
        isCorrected: !!r.correctedById,
        correctionReason: r.correctionReason,
      })),
    },
  });
}
