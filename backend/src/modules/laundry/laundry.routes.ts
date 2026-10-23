import { Router } from 'express';
import {
  listSlots,
  createSlot,
  bookSlot,
  getMyBookings,
  listAllBookings,
  updateBookingStatus,
} from './laundry.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

router.get('/slots', authenticateToken, listSlots);
router.post('/slots', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, createSlot);
router.post('/book', authenticateToken, requireRoles(Role.STUDENT), bookSlot);
router.get('/my-bookings', authenticateToken, requireRoles(Role.STUDENT), getMyBookings);
router.get('/all-bookings', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, listAllBookings);
router.put('/bookings/:id/status', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, updateBookingStatus);

export default router;
