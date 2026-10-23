import { Router } from 'express';
import {
  submitComplaint,
  listComplaints,
  getComplaintDetails,
  addMessage,
  updateComplaintStatus,
} from './complaints.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, listComplaints);
router.post('/', authenticateToken, requireRoles(Role.STUDENT), submitComplaint);
router.get('/:id', authenticateToken, getComplaintDetails);
router.post('/:id/messages', authenticateToken, addMessage);
router.put('/:id/status', authenticateToken, updateComplaintStatus);

export default router;
