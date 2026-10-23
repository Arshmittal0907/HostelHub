import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { ComplaintCategory, Urgency, ComplaintStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createComplaintSchema = z.object({
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'CLEANLINESS', 'INTERNET', 'FOOD', 'NOISE', 'OTHER']),
  title: z.string().min(5),
  description: z.string().min(10),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
});

const addMessageSchema = z.object({
  message: z.string().min(1),
  isInternalNote: z.boolean().default(false),
  attachmentUrl: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED']),
  notes: z.string().optional(),
});

function calculateSlaDeadline(urgency: Urgency): Date {
  const now = Date.now();
  switch (urgency) {
    case Urgency.EMERGENCY:
      return new Date(now + 6 * 60 * 60 * 1000); // 6 hours
    case Urgency.HIGH:
      return new Date(now + 24 * 60 * 60 * 1000); // 24 hours
    case Urgency.MEDIUM:
      return new Date(now + 48 * 60 * 60 * 1000); // 48 hours
    case Urgency.LOW:
    default:
      return new Date(now + 72 * 60 * 60 * 1000); // 72 hours
  }
}

export async function submitComplaint(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can submit complaints.' });
    return;
  }

  const data = createComplaintSchema.parse(req.body);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const count = await prisma.complaint.count();
  const ticketNumber = `COMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const slaDeadline = calculateSlaDeadline(data.urgency as Urgency);

  const complaint = await prisma.$transaction(async (tx) => {
    const c = await tx.complaint.create({
      data: {
        ticketNumber,
        studentId: student.id,
        collegeId: student.collegeId,
        hostelId: student.hostelId,
        category: data.category as ComplaintCategory,
        title: data.title,
        description: data.description,
        urgency: data.urgency as Urgency,
        status: ComplaintStatus.SUBMITTED,
        slaDeadline,
      },
    });

    await tx.complaintEvent.create({
      data: {
        complaintId: c.id,
        actorId: req.user!.id,
        action: 'TICKET_CREATED',
        notes: `Ticket raised with urgency ${data.urgency}. Target SLA: ${slaDeadline.toISOString()}`,
      },
    });

    return c;
  });

  await logAuditEvent(req, 'SUBMIT_COMPLAINT', 'Complaint', complaint.id, {
    ticketNumber,
    category: data.category,
    urgency: data.urgency,
  });

  res.status(201).json({
    success: true,
    message: `Complaint registered under ticket ID ${ticketNumber}.`,
    data: complaint,
  });
}

export async function listComplaints(req: Request, res: Response): Promise<void> {
  const { status, category, urgency, search } = req.query;

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

  if (status) where.status = status as ComplaintStatus;
  if (category) where.category = category as ComplaintCategory;
  if (urgency) where.urgency = urgency as Urgency;

  if (search) {
    where.OR = [
      { ticketNumber: { contains: String(search), mode: 'insensitive' } },
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const complaints = await prisma.complaint.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              room: true,
              bed: true,
            },
          },
        },
      },
      hostel: { select: { name: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
  });

  const now = new Date();
  const formatted = complaints.map((c) => ({
    ...c,
    isOverdue: c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED && c.slaDeadline < now,
  }));

  res.json({ success: true, count: formatted.length, data: formatted });
}

export async function getComplaintDetails(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const complaint: any = await prisma.complaint.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: { room: true, bed: true },
          },
        },
      },
      hostel: true,
      events: {
        include: { actor: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      messages: {
        include: { sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  // Student ownership check
  if (req.user!.role === Role.STUDENT && complaint.student.userId !== req.user!.id) {
    res.status(403).json({ success: false, message: 'Access denied: You cannot view another student complaint.' });
    return;
  }

  // Filter out internal notes for students
  if (req.user!.role === Role.STUDENT) {
    complaint.messages = complaint.messages.filter((m: any) => !m.isInternalNote);
  }

  res.json({ success: true, data: complaint });
}

export async function addMessage(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = addMessageSchema.parse(req.body);

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  // If student is sending message, isInternalNote MUST be false
  const isInternal = req.user!.role === Role.STUDENT ? false : data.isInternalNote;

  const msg = await prisma.complaintMessage.create({
    data: {
      complaintId: id,
      senderId: req.user!.id,
      message: data.message,
      isInternalNote: isInternal,
      attachmentUrl: data.attachmentUrl,
    },
    include: {
      sender: { select: { fullName: true, role: true } },
    },
  });

  // Notify opposite party
  if (req.user!.role === Role.WARDEN && !isInternal) {
    await prisma.notification.create({
      data: {
        userId: complaint.student.userId,
        title: 'New Reply on Complaint',
        message: `Warden replied on ticket ${complaint.ticketNumber}.`,
        type: 'INFO',
        link: `/student/complaints/${complaint.id}`,
      },
    });
  }

  res.status(201).json({ success: true, message: 'Message posted.', data: msg });
}

export async function updateComplaintStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status, notes } = updateStatusSchema.parse(req.body);

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  // Students can only REOPEN resolved tickets
  if (req.user!.role === Role.STUDENT) {
    if (status !== ComplaintStatus.REOPENED) {
      res.status(403).json({ success: false, message: 'Students can only reopen closed or resolved complaints.' });
      return;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.complaint.update({
      where: { id },
      data: {
        status: status as ComplaintStatus,
        resolvedAt: status === ComplaintStatus.RESOLVED ? new Date() : undefined,
      },
    });

    await tx.complaintEvent.create({
      data: {
        complaintId: id,
        actorId: req.user!.id,
        action: `STATUS_${status}`,
        notes: notes || `Complaint status changed to ${status}`,
      },
    });

    await tx.notification.create({
      data: {
        userId: complaint.student.userId,
        title: `Complaint ${status}`,
        message: `Your ticket ${complaint.ticketNumber} is now marked as ${status}.`,
        type: status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
        link: `/student/complaints/${complaint.id}`,
      },
    });

    return c;
  });

  await logAuditEvent(req, 'UPDATE_COMPLAINT_STATUS', 'Complaint', id, {
    oldStatus: complaint.status,
    newStatus: status,
    notes,
  });

  res.json({ success: true, message: `Ticket status updated to ${status}.`, data: updated });
}
