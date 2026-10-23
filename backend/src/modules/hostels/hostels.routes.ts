import { Router } from 'express';
import { listHostels, getHostelById, createHostel } from './hostels.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', listHostels);
router.get('/:id', getHostelById);
router.post('/', authenticateToken, requireRoles(Role.PLATFORM_ADMIN, Role.WARDEN), enforceCollegeIsolation, createHostel);

export default router;
