import { Router } from 'express';
import { listAuditLogs } from './audit.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), listAuditLogs);

export default router;
