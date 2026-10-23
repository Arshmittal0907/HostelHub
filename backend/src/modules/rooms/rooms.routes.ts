import { Router } from 'express';
import {
  listRooms,
  createRoom,
  allocateBed,
  transferBed,
  checkoutBed,
  updateBedStatus,
  getMyRoom,
} from './rooms.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

// Student route
router.get('/my-room', authenticateToken, getMyRoom);

// Warden & Admin routes
router.get('/', authenticateToken, enforceCollegeIsolation, listRooms);
router.post('/', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, createRoom);
router.post('/allocate', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, allocateBed);
router.post('/transfer', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, transferBed);
router.post('/checkout', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, checkoutBed);
router.put('/beds/:bedId/status', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, updateBedStatus);

export default router;
