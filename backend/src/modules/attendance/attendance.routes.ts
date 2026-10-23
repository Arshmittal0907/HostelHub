import { Router } from 'express';
import { createSession, listSessions, correctRecord, getStudentAttendance } from './attendance.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/my-attendance', authenticateToken, requireRoles(Role.STUDENT), getStudentAttendance);
router.get('/sessions', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, listSessions);
router.post('/sessions', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, createSession);
router.put('/records/:recordId/correct', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, correctRecord);

export default router;
