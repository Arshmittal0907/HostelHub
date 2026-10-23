import { Router } from 'express';
import { getApprovedColleges, getCollegeById, adminListColleges, adminVerifyCollege } from './colleges.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getApprovedColleges);
router.get('/:id', getCollegeById);

// Platform Admin routes
router.get('/admin/all', authenticateToken, requireRoles(Role.PLATFORM_ADMIN), adminListColleges);
router.post('/admin/:id/verify', authenticateToken, requireRoles(Role.PLATFORM_ADMIN), adminVerifyCollege);

export default router;
