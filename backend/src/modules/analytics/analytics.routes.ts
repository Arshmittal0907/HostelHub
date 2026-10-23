import { Router } from 'express';
import { getWardenDashboardAnalytics, getAdminPlatformAnalytics } from './analytics.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/warden', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, getWardenDashboardAnalytics);
router.get('/admin', authenticateToken, requireRoles(Role.PLATFORM_ADMIN), getAdminPlatformAnalytics);

export default router;
