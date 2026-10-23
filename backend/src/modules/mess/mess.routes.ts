import { Router } from 'express';
import { getMessMenu, upsertMessMenu } from './mess.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/menu', authenticateToken, getMessMenu);
router.post('/menu', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, upsertMessMenu);

export default router;
