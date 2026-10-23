import { Router } from 'express';
import {
  listNotices,
  createNotice,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notices.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, listNotices);
router.post('/', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, createNotice);

router.get('/notifications', authenticateToken, getMyNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

export default router;
