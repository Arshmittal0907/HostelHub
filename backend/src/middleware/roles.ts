import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please sign in.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission to access this resource.`,
      });
      return;
    }

    next();
  };
}

export function requireApprovedMembership(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please sign in.' });
    return;
  }

  if (req.user.role === Role.PLATFORM_ADMIN) {
    next();
    return;
  }

  if (!req.user.collegeId) {
    res.status(403).json({ success: false, message: 'Account is not associated with any approved college.' });
    return;
  }

  next();
}
