import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: { college: true },
        },
        wardenAssignments: {
          include: { hostel: true },
        },
        studentProfile: {
          include: { hostel: true, college: true },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid token or inactive account.' });
      return;
    }

    let collegeId: string | undefined;
    let hostelId: string | undefined;
    let studentProfileId: string | undefined;

    if (user.role === Role.STUDENT && user.studentProfile) {
      collegeId = user.studentProfile.collegeId;
      hostelId = user.studentProfile.hostelId;
      studentProfileId = user.studentProfile.id;
    } else if (user.role === Role.WARDEN && user.wardenAssignments.length > 0) {
      // Primary or first assignment
      const primary = user.wardenAssignments.find((a) => a.isPrimary) || user.wardenAssignments[0];
      collegeId = primary.collegeId;
      hostelId = primary.hostelId;
    } else if (user.memberships.length > 0) {
      collegeId = user.memberships[0].collegeId;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      collegeId,
      hostelId,
      studentProfileId,
    };
    req.collegeId = collegeId;
    req.hostelId = hostelId;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
