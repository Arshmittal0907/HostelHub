import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        fullName: string;
        collegeId?: string;
        hostelId?: string;
        studentProfileId?: string;
      };
      collegeId?: string;
      hostelId?: string;
    }
  }
}
