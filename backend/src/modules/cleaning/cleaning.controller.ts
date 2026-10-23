import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { AreaType, CleaningStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createTaskSchema = z.object({
  hostelId: z.string().uuid(),
  title: z.string().min(3),
  areaType: z.enum(['ROOM', 'COMMON_AREA', 'WASHROOM', 'CORRIDOR']),
  frequency: z.string().default('DAILY'),
  scheduledTime: z.string().default('10:00 AM'),
  description: z.string().optional(),
});

const reportMissedSchema = z.object({
  roomId: z.string().uuid().optional(),
  missedReason: z.string().min(5),
});

export async function listCleaningSchedule(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const tasks = await prisma.cleaningTask.findMany({
    where: { hostelId },
    include: {
      assignments: {
        include: {
          room: true,
          reportedBy: {
            include: { user: { select: { fullName: true } } },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        take: 20,
      },
    },
  });

  res.json({ success: true, count: tasks.length, data: tasks });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const data = createTaskSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const task = await prisma.cleaningTask.create({
    data: {
      hostelId: data.hostelId,
      collegeId,
      title: data.title,
      areaType: data.areaType as AreaType,
      frequency: data.frequency,
      scheduledTime: data.scheduledTime,
      description: data.description,
    },
  });

  res.status(201).json({ success: true, message: 'Housekeeping task created.', data: task });
}

export async function reportMissedCleaning(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can report missed cleaning.' });
    return;
  }

  const { roomId, missedReason } = reportMissedSchema.parse(req.body);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      allocations: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const targetRoomId = roomId || (student.allocations.length > 0 ? student.allocations[0].roomId : null);

  // Find general room cleaning task
  const roomTask = await prisma.cleaningTask.findFirst({
    where: {
      hostelId: student.hostelId,
      areaType: AreaType.ROOM,
    },
  });

  if (!roomTask) {
    res.status(400).json({ success: false, message: 'No room cleaning task configured for this hostel.' });
    return;
  }

  const assignment = await prisma.cleaningAssignment.create({
    data: {
      taskId: roomTask.id,
      roomId: targetRoomId,
      scheduledDate: new Date(),
      status: CleaningStatus.MISSED,
      missedReason,
      reportedByStudentId: student.id,
    },
  });

  await logAuditEvent(req, 'REPORT_MISSED_CLEANING', 'CleaningAssignment', assignment.id, {
    studentId: student.id,
    roomId: targetRoomId,
    reason: missedReason,
  });

  res.status(201).json({
    success: true,
    message: 'Missed cleaning incident reported to Warden office. Priority housekeeping dispatched.',
    data: assignment,
  });
}

export async function markCompleted(req: Request, res: Response): Promise<void> {
  const assignmentId = String(req.params.assignmentId);

  const updated = await prisma.cleaningAssignment.update({
    where: { id: assignmentId },
    data: {
      status: CleaningStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  res.json({ success: true, message: 'Cleaning marked as completed.', data: updated });
}
