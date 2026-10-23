import { Router } from 'express';
import {
  applyLeave,
  listLeaveRequests,
  reviewLeave,
  verifyLeavePass,
} from './leave.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { Role } from '@prisma/client';

const router = Router();

// Public gate verification endpoint
router.get('/verify/:tokenOrCode', verifyLeavePass);

// Authenticated routes
router.get('/', authenticateToken, listLeaveRequests);
router.post('/apply', authenticateToken, requireRoles(Role.STUDENT), applyLeave);
router.put('/:id/review', authenticateToken, requireRoles(Role.WARDEN), reviewLeave);

export default router;
