import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { LaundryBookingStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createSlotSchema = z.object({
  hostelId: z.string().uuid(),
  dayOfWeek: z.string().min(3),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  maxCapacity: z.number().int().min(1).default(15),
});

const bookSlotSchema = z.object({
  slotId: z.string().uuid(),
  bookingDate: z.string(), // ISO date
});

const updateStatusSchema = z.object({
  status: z.enum(['BOOKED', 'COLLECTED', 'COMPLETED', 'CANCELLED']),
});

export async function listSlots(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const slots = await prisma.laundrySlot.findMany({
    where: { hostelId },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  res.json({ success: true, count: slots.length, data: slots });
}

export async function createSlot(req: Request, res: Response): Promise<void> {
  const data = createSlotSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  const slot = await prisma.laundrySlot.create({
    data: {
      hostelId: data.hostelId,
      collegeId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      maxCapacity: data.maxCapacity,
    },
  });

  res.status(201).json({ success: true, message: 'Laundry slot created.', data: slot });
}

export async function bookSlot(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can book laundry slots.' });
    return;
  }

  const { slotId, bookingDate } = bookSlotSchema.parse(req.body);
  const parsedDate = new Date(bookingDate);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  // ATOMIC CAPACITY CHECK & BOOKING
  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.laundrySlot.findUnique({
      where: { id: slotId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                bookingDate: parsedDate,
                status: { not: LaundryBookingStatus.CANCELLED },
              },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new Error('Laundry slot not found.');
    }

    if (slot._count.bookings >= slot.maxCapacity) {
      throw new Error(`Slot is fully booked for ${bookingDate} (Capacity: ${slot.maxCapacity}).`);
    }

    const existingUserBooking = await tx.laundryBooking.findFirst({
      where: {
        slotId,
        studentId: student.id,
        bookingDate: parsedDate,
        status: { not: LaundryBookingStatus.CANCELLED },
      },
    });

    if (existingUserBooking) {
      throw new Error('You already have an active booking for this slot on this date.');
    }

    return await tx.laundryBooking.create({
      data: {
        slotId,
        studentId: student.id,
        hostelId: slot.hostelId,
        collegeId: slot.collegeId,
        bookingDate: parsedDate,
        status: LaundryBookingStatus.BOOKED,
      },
    });
  });

  res.status(201).json({
    success: true,
    message: 'Laundry slot booked successfully! Drop off clothes at scheduled start time.',
    data: booking,
  });
}

export async function getMyBookings(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can view my bookings.' });
    return;
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const bookings = await prisma.laundryBooking.findMany({
    where: { studentId: student.id },
    include: {
      slot: true,
    },
    orderBy: { bookingDate: 'desc' },
  });

  res.json({ success: true, count: bookings.length, data: bookings });
}

export async function listAllBookings(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const bookings = await prisma.laundryBooking.findMany({
    where: { hostelId },
    include: {
      slot: true,
      student: {
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { bookingDate: 'desc' },
    take: 50,
  });

  res.json({ success: true, count: bookings.length, data: bookings });
}

export async function updateBookingStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status } = updateStatusSchema.parse(req.body);

  const booking = await prisma.laundryBooking.update({
    where: { id },
    data: { status: status as LaundryBookingStatus },
  });

  res.json({ success: true, message: `Laundry booking status updated to ${status}.`, data: booking });
}
