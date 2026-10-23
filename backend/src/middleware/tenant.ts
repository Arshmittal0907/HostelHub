import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export function enforceCollegeIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // If Admin, they have platform-level access to verify colleges, etc.
  if (req.user.role === Role.PLATFORM_ADMIN) {
    next();
    return;
  }

  const requestedCollegeId = req.params?.collegeId || (req.query?.collegeId as string) || req.body?.collegeId;

  if (requestedCollegeId && requestedCollegeId !== req.user.collegeId) {
    res.status(403).json({
      success: false,
      message: 'Access denied: Cross-college data access is strictly forbidden.',
    });
    return;
  }

  // Inject user's verified collegeId to prevent parameter tampering
  req.collegeId = req.user.collegeId;
  next();
}

export async function enforceWardenHostelAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  if (req.user.role !== Role.WARDEN) {
    next();
    return;
  }

  const requestedHostelId = req.params?.hostelId || (req.query?.hostelId as string) || req.body?.hostelId;

  if (requestedHostelId) {
    const assignment = await prisma.wardenAssignment.findUnique({
      where: {
        userId_hostelId: {
          userId: req.user.id,
          hostelId: requestedHostelId,
        },
      },
    });

    if (!assignment) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Warden is not assigned to this hostel.',
      });
      return;
    }

    req.hostelId = requestedHostelId;
  }

  next();
}
