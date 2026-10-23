import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';
import { BedStatus, AllocationStatus, Role } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const createRoomSchema = z.object({
  hostelId: z.string().uuid(),
  blockName: z.string().min(1),
  roomNumber: z.string().min(1),
  floor: z.number().int().min(0).max(20),
  roomType: z.string().default('DOUBLE'),
  capacity: z.number().int().min(1).max(10).default(2),
});

const allocateBedSchema = z.object({
  studentId: z.string().uuid(),
  bedId: z.string().uuid(),
  startDate: z.string().optional(),
});

const transferBedSchema = z.object({
  studentId: z.string().uuid(),
  targetBedId: z.string().uuid(),
  reason: z.string().optional(),
});

const checkoutBedSchema = z.object({
  studentId: z.string().uuid(),
  reason: z.string().optional(),
});

const updateBedStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED']),
});

export async function listRooms(req: Request, res: Response): Promise<void> {
  const hostelId = (req.query.hostelId as string) || req.hostelId;
  const { blockId, floor, availableOnly } = req.query;

  if (!hostelId) {
    res.status(400).json({ success: false, message: 'Hostel ID is required.' });
    return;
  }

  const where: any = { hostelId };
  if (blockId) where.blockId = String(blockId);
  if (floor !== undefined) where.floor = parseInt(String(floor), 10);

  const rooms = await prisma.room.findMany({
    where,
    include: {
      block: true,
      beds: {
        include: {
          allocations: {
            where: { status: AllocationStatus.ACTIVE },
            include: {
              student: {
                include: {
                  user: {
                    select: { id: true, fullName: true, email: true, phone: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
  });

  let filteredRooms = rooms;
  if (availableOnly === 'true') {
    filteredRooms = rooms.filter((r) => r.beds.some((b) => b.status === BedStatus.AVAILABLE));
  }

  res.json({ success: true, count: filteredRooms.length, data: filteredRooms });
}

export async function createRoom(req: Request, res: Response): Promise<void> {
  const data = createRoomSchema.parse(req.body);
  const collegeId = req.collegeId;

  if (!collegeId) {
    res.status(400).json({ success: false, message: 'College ID is required.' });
    return;
  }

  // Ensure block exists or create it
  let block = await prisma.block.findFirst({
    where: { hostelId: data.hostelId, name: data.blockName },
  });

  if (!block) {
    block = await prisma.block.create({
      data: {
        hostelId: data.hostelId,
        name: data.blockName,
        code: data.blockName.toUpperCase().replace(/\s+/g, '-'),
      },
    });
  }

  // Check duplicate room
  const existingRoom = await prisma.room.findFirst({
    where: { hostelId: data.hostelId, roomNumber: data.roomNumber },
  });

  if (existingRoom) {
    res.status(400).json({ success: false, message: `Room ${data.roomNumber} already exists in this hostel.` });
    return;
  }

  const newRoom = await prisma.$transaction(async (tx) => {
    const r = await tx.room.create({
      data: {
        blockId: block.id,
        hostelId: data.hostelId,
        collegeId,
        roomNumber: data.roomNumber,
        floor: data.floor,
        roomType: data.roomType,
        capacity: data.capacity,
      },
    });

    // Create beds (e.g. 101-A, 101-B...)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < data.capacity; i++) {
      const suffix = alphabet[i] || `${i + 1}`;
      await tx.bed.create({
        data: {
          roomId: r.id,
          bedNumber: `${data.roomNumber}-${suffix}`,
          status: BedStatus.AVAILABLE,
        },
      });
    }

    return r;
  });

  await logAuditEvent(req, 'CREATE_ROOM', 'Room', newRoom.id, {
    roomNumber: data.roomNumber,
    capacity: data.capacity,
  });

  res.status(201).json({ success: true, message: 'Room and beds created successfully.', data: newRoom });
}

export async function allocateBed(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, bedId, startDate } = allocateBedSchema.parse(req.body);
    const collegeId = req.collegeId;

    if (!collegeId) {
      res.status(400).json({ success: false, message: 'College ID is required.' });
      return;
    }

    // ATOMIC ALLOCATION TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and check bed
      const bed = await tx.bed.findUnique({
        where: { id: bedId },
        include: { room: true },
      });

      if (!bed) {
        throw new Error('Bed not found.');
      }

      if (bed.status !== BedStatus.AVAILABLE) {
        throw new Error(`Bed ${bed.bedNumber} is not available (current status: ${bed.status}). Double allocation prevented.`);
      }

      // 2. Check student profile
      const student = await tx.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          allocations: {
            where: { status: AllocationStatus.ACTIVE },
          },
        },
      });

      if (!student) {
        throw new Error('Student profile not found.');
      }

      if (student.status !== 'APPROVED') {
        throw new Error('Student must be approved by Warden before room allocation.');
      }

      if (student.allocations.length > 0) {
        throw new Error('Student already has an active room allocation. Use transfer if moving beds.');
      }

      // 3. Mark bed as OCCUPIED
      const updatedBed = await tx.bed.update({
        where: { id: bedId },
        data: { status: BedStatus.OCCUPIED },
      });

      // 4. Create allocation
      const allocation = await tx.roomAllocation.create({
        data: {
          studentId: student.id,
          bedId: bed.id,
          roomId: bed.roomId,
          hostelId: bed.room.hostelId,
          collegeId,
          startDate: startDate ? new Date(startDate) : new Date(),
          status: AllocationStatus.ACTIVE,
          allocatedById: req.user!.id,
        },
      });

      // 5. Create notification for student
      await tx.notification.create({
        data: {
          userId: student.userId,
          title: 'Room Allocated',
          message: `You have been allocated Room ${bed.room.roomNumber}, Bed ${bed.bedNumber}.`,
          type: 'SUCCESS',
          link: '/student/hostel',
        },
      });

      return { allocation, bed: updatedBed, room: bed.room };
    });

    await logAuditEvent(req, 'ALLOCATE_BED', 'RoomAllocation', result.allocation.id, {
      studentId,
      bedId,
      roomNumber: result.room.roomNumber,
    });

    res.json({
      success: true,
      message: `Bed ${result.bed.bedNumber} in Room ${result.room.roomNumber} successfully allocated.`,
      data: result.allocation,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function transferBed(req: Request, res: Response): Promise<void> {
  const { studentId, targetBedId, reason } = transferBedSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Find active allocation
    const activeAlloc = await tx.roomAllocation.findFirst({
      where: { studentId, status: AllocationStatus.ACTIVE },
      include: { bed: true, room: true },
    });

    if (!activeAlloc) {
      throw new Error('Student does not have an active bed allocation to transfer from.');
    }

    // 2. Check target bed
    const targetBed = await tx.bed.findUnique({
      where: { id: targetBedId },
      include: { room: true },
    });

    if (!targetBed) {
      throw new Error('Target bed not found.');
    }

    if (targetBed.status !== BedStatus.AVAILABLE) {
      throw new Error(`Target bed ${targetBed.bedNumber} is not available (status: ${targetBed.status}).`);
    }

    // 3. Mark current bed as AVAILABLE
    await tx.bed.update({
      where: { id: activeAlloc.bedId },
      data: { status: BedStatus.AVAILABLE },
    });

    // 4. Mark old allocation as TRANSFERRED
    await tx.roomAllocation.update({
      where: { id: activeAlloc.id },
      data: {
        status: AllocationStatus.TRANSFERRED,
        endDate: new Date(),
      },
    });

    // 5. Mark target bed as OCCUPIED
    await tx.bed.update({
      where: { id: targetBedId },
      data: { status: BedStatus.OCCUPIED },
    });

    // 6. Create new active allocation
    const newAlloc = await tx.roomAllocation.create({
      data: {
        studentId,
        bedId: targetBed.id,
        roomId: targetBed.roomId,
        hostelId: targetBed.room.hostelId,
        collegeId: targetBed.room.collegeId,
        status: AllocationStatus.ACTIVE,
        allocatedById: req.user!.id,
      },
    });

    return { newAlloc, oldBed: activeAlloc.bed.bedNumber, newBed: targetBed.bedNumber };
  });

  await logAuditEvent(req, 'TRANSFER_BED', 'RoomAllocation', result.newAlloc.id, {
    studentId,
    targetBedId,
    reason,
  });

  res.json({
    success: true,
    message: `Student transferred from Bed ${result.oldBed} to Bed ${result.newBed}.`,
    data: result.newAlloc,
  });
}

export async function checkoutBed(req: Request, res: Response): Promise<void> {
  const { studentId, reason } = checkoutBedSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const activeAlloc = await tx.roomAllocation.findFirst({
      where: { studentId, status: AllocationStatus.ACTIVE },
      include: { bed: true, room: true },
    });

    if (!activeAlloc) {
      throw new Error('Student does not have an active bed allocation to check out from.');
    }

    await tx.bed.update({
      where: { id: activeAlloc.bedId },
      data: { status: BedStatus.AVAILABLE },
    });

    const updatedAlloc = await tx.roomAllocation.update({
      where: { id: activeAlloc.id },
      data: {
        status: AllocationStatus.CHECKED_OUT,
        endDate: new Date(),
      },
    });

    return { updatedAlloc, bedNumber: activeAlloc.bed.bedNumber };
  });

  await logAuditEvent(req, 'CHECKOUT_BED', 'RoomAllocation', result.updatedAlloc.id, {
    studentId,
    reason,
  });

  res.json({
    success: true,
    message: `Student checked out from Bed ${result.bedNumber}.`,
    data: result.updatedAlloc,
  });
}

export async function updateBedStatus(req: Request, res: Response): Promise<void> {
  const bedId = String(req.params.bedId);
  const { status } = updateBedStatusSchema.parse(req.body);

  const bed = await prisma.bed.findUnique({
    where: { id: bedId },
    include: {
      allocations: {
        where: { status: AllocationStatus.ACTIVE },
      },
    },
  });

  if (!bed) {
    res.status(404).json({ success: false, message: 'Bed not found.' });
    return;
  }

  if (bed.allocations.length > 0 && status === BedStatus.AVAILABLE) {
    res.status(400).json({ success: false, message: 'Cannot mark occupied bed as available. Check out the student first.' });
    return;
  }

  const updated = await prisma.bed.update({
    where: { id: bedId },
    data: { status: status as BedStatus },
  });

  res.json({ success: true, message: `Bed status updated to ${status}.`, data: updated });
}

export async function getMyRoom(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== Role.STUDENT) {
    res.status(403).json({ success: false, message: 'Only students can access My Room.' });
    return;
  }

  const profile: any = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      college: true,
      hostel: true,
      allocations: {
        where: { status: AllocationStatus.ACTIVE },
        include: {
          bed: true,
          room: {
            include: {
              block: true,
              beds: {
                include: {
                  allocations: {
                    where: { status: AllocationStatus.ACTIVE },
                    include: {
                      student: {
                        include: {
                          user: {
                            select: { id: true, fullName: true, email: true, phone: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const activeAlloc = profile.allocations[0];

  if (!activeAlloc) {
    res.json({
      success: true,
      allocated: false,
      message: 'No active room allocation assigned yet. Please contact your Warden.',
      college: profile.college,
      hostel: profile.hostel,
    });
    return;
  }

  // Roommates in the same room (excluding self)
  const roommates: any[] = [];
  activeAlloc.room.beds.forEach((b: any) => {
    b.allocations.forEach((alloc: any) => {
      if (alloc.studentId !== profile.id) {
        roommates.push({
          fullName: alloc.student.user.fullName,
          email: alloc.student.user.email,
          phone: alloc.student.user.phone,
          course: alloc.student.course,
          year: alloc.student.year,
          bedNumber: b.bedNumber,
        });
      }
    });
  });

  res.json({
    success: true,
    allocated: true,
    data: {
      collegeName: profile.college.name,
      hostelName: profile.hostel.name,
      hostelType: profile.hostel.type,
      blockName: activeAlloc.room.block.name,
      floor: activeAlloc.room.floor,
      roomNumber: activeAlloc.room.roomNumber,
      roomType: activeAlloc.room.roomType,
      bedNumber: activeAlloc.bed.bedNumber,
      allocatedAt: activeAlloc.allocatedAt,
      roommates,
    },
  });
}
