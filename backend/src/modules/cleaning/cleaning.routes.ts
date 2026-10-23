import { Router } from 'express';
import {
  listCleaningSchedule,
  createTask,
  reportMissedCleaning,
  markCompleted,
} from './cleaning.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/schedule', authenticateToken, listCleaningSchedule);
router.post('/tasks', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, createTask);
router.post('/report-missed', authenticateToken, requireRoles(Role.STUDENT), reportMissedCleaning);
router.put('/assignments/:assignmentId/complete', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, markCompleted);

export default router;
