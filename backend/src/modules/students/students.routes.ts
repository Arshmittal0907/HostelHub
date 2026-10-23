import { Router } from 'express';
import { listStudents, approveStudent, updateProfile } from './students.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, listStudents);
router.post('/:id/approve', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, approveStudent);
router.put('/profile', authenticateToken, requireRoles(Role.STUDENT), updateProfile);

export default router;
