import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { Role, CollegeStatus, StudentStatus } from '@prisma/client';
import { logAuditEvent } from '../../middleware/audit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerStudentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  collegeId: z.string().uuid(),
  hostelId: z.string().uuid(),
  rollNumber: z.string().min(2),
  course: z.string().min(2),
  year: z.number().int().min(1).max(6),
  emergencyContact: z.string().min(5),
});

const registerWardenSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  collegeId: z.string().uuid(),
  hostelId: z.string().uuid(),
  staffId: z.string().optional(),
  designation: z.string().optional(),
});

const registerCollegeSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2).max(15).toUpperCase(),
  officialEmail: z.string().email(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  phone: z.string().min(10),
  representativeName: z.string().min(2),
  representativeRole: z.string().min(2),
  representativeContact: z.string().min(10),
  hostelNames: z.array(z.string()).optional(),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: {
        include: {
          college: true,
          hostel: true,
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              room: { include: { block: true } },
              bed: true,
            },
          },
        },
      },
      wardenAssignments: {
        include: {
          college: true,
          hostel: true,
        },
      },
      memberships: {
        include: {
          college: true,
        },
      },
    },
  });

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });

  let college = null;
  let hostel = null;
  let activeAllocation = null;

  if (user.role === Role.STUDENT && user.studentProfile) {
    college = user.studentProfile.college;
    hostel = user.studentProfile.hostel;
    if (user.studentProfile.allocations.length > 0) {
      activeAllocation = user.studentProfile.allocations[0];
    }
  } else if (user.role === Role.WARDEN && user.wardenAssignments.length > 0) {
    college = user.wardenAssignments[0].college;
    hostel = user.wardenAssignments[0].hostel;
  } else if (user.memberships.length > 0) {
    college = user.memberships[0].college;
  }

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile
        ? {
            id: user.studentProfile.id,
            rollNumber: user.studentProfile.rollNumber,
            course: user.studentProfile.course,
            year: user.studentProfile.year,
            status: user.studentProfile.status,
            activeAllocation,
          }
        : null,
      wardenAssignments: user.wardenAssignments.map((wa) => ({
        id: wa.id,
        hostelId: wa.hostelId,
        hostelName: wa.hostel.name,
        hostelType: wa.hostel.type,
      })),
      college: college
        ? {
            id: college.id,
            name: college.name,
            code: college.code,
            status: college.status,
          }
        : null,
      hostel: hostel
        ? {
            id: hostel.id,
            name: hostel.name,
            type: hostel.type,
          }
        : null,
    },
  });
}

export async function registerStudent(req: Request, res: Response): Promise<void> {
  const data = registerStudentSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const college = await prisma.college.findUnique({
    where: { id: data.collegeId },
  });

  if (!college || college.status !== CollegeStatus.APPROVED) {
    res.status(400).json({ success: false, message: 'Selected college is not approved or does not exist.' });
    return;
  }

  const hostel = await prisma.hostel.findFirst({
    where: { id: data.hostelId, collegeId: data.collegeId },
  });

  if (!hostel) {
    res.status(400).json({ success: false, message: 'Selected hostel does not exist in this college.' });
    return;
  }

  const existingRoll = await prisma.studentProfile.findFirst({
    where: { collegeId: data.collegeId, rollNumber: data.rollNumber },
  });

  if (existingRoll) {
    res.status(400).json({ success: false, message: 'A student with this roll number is already registered in this college.' });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: Role.STUDENT,
      },
    });

    await tx.collegeMembership.create({
      data: {
        userId: user.id,
        collegeId: data.collegeId,
        role: Role.STUDENT,
        isApproved: false,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        collegeId: data.collegeId,
        hostelId: data.hostelId,
        rollNumber: data.rollNumber,
        course: data.course,
        year: data.year,
        emergencyContact: data.emergencyContact,
        status: StudentStatus.PENDING_APPROVAL,
      },
    });

    return user;
  });

  res.status(201).json({
    success: true,
    message: 'Student registration submitted successfully! Awaiting Warden approval before dashboard access is unlocked.',
    userId: newUser.id,
  });
}

export async function registerWarden(req: Request, res: Response): Promise<void> {
  const data = registerWardenSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const college = await prisma.college.findUnique({
    where: { id: data.collegeId },
  });

  if (!college || college.status !== CollegeStatus.APPROVED) {
    res.status(400).json({ success: false, message: 'Selected college is not approved or does not exist.' });
    return;
  }

  const hostel = await prisma.hostel.findFirst({
    where: { id: data.hostelId, collegeId: data.collegeId },
  });

  if (!hostel) {
    res.status(400).json({ success: false, message: 'Selected hostel does not exist in this college.' });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: Role.WARDEN,
      },
    });

    await tx.collegeMembership.create({
      data: {
        userId: u.id,
        collegeId: data.collegeId,
        role: Role.WARDEN,
        isApproved: true,
        approvedAt: new Date(),
      },
    });

    await tx.wardenAssignment.create({
      data: {
        userId: u.id,
        hostelId: data.hostelId,
        collegeId: data.collegeId,
        isPrimary: true,
      },
    });

    return u;
  });

  res.status(201).json({
    success: true,
    message: 'Warden account created and assigned to hostel successfully.',
    userId: user.id,
  });
}

export async function registerCollege(req: Request, res: Response): Promise<void> {
  const data = registerCollegeSchema.parse(req.body);

  const existingCode = await prisma.college.findUnique({
    where: { code: data.code },
  });
  if (existingCode) {
    res.status(400).json({ success: false, message: `College code '${data.code}' is already registered.` });
    return;
  }

  const existingEmail = await prisma.college.findUnique({
    where: { officialEmail: data.officialEmail },
  });
  if (existingEmail) {
    res.status(400).json({ success: false, message: 'A college with this official email is already registered.' });
    return;
  }

  const college = await prisma.$transaction(async (tx) => {
    const col = await tx.college.create({
      data: {
        name: data.name,
        code: data.code,
        officialEmail: data.officialEmail,
        website: data.website || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        representativeName: data.representativeName,
        representativeRole: data.representativeRole,
        representativeContact: data.representativeContact,
        status: CollegeStatus.PENDING_VERIFICATION,
      },
    });

    // Optionally create requested initial hostels
    if (data.hostelNames && data.hostelNames.length > 0) {
      for (const hName of data.hostelNames) {
        if (hName.trim()) {
          await tx.hostel.create({
            data: {
              collegeId: col.id,
              name: hName.trim(),
              type: hName.toLowerCase().includes('girl') ? 'GIRLS' : 'BOYS',
            },
          });
        }
      }
    }

    return col;
  });

  res.status(201).json({
    success: true,
    message: 'College registration application submitted successfully! It is now pending Platform Admin verification.',
    collegeId: college.id,
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      studentProfile: {
        include: {
          college: true,
          hostel: true,
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              room: { include: { block: true } },
              bed: true,
            },
          },
        },
      },
      wardenAssignments: {
        include: {
          college: true,
          hostel: true,
        },
      },
      memberships: {
        include: {
          college: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile,
      wardenAssignments: user.wardenAssignments,
      memberships: user.memberships,
    },
  });
}
