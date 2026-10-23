import { Router } from 'express';
import {
  listRules,
  createRule,
  listFacilities,
  addMenuItem,
} from './facilities.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/rules', authenticateToken, listRules);
router.post('/rules', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, createRule);
router.get('/', authenticateToken, listFacilities);
router.post('/cafeteria/items', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, addMenuItem);

export default router;
