import { Router } from 'express';
import {
  listFeeCategories,
  createFeeCategory,
  createStudentCharge,
  recordPayment,
  getStudentFees,
  listHostelFinance,
  issueFine,
  appealFine,
  reviewAppeal,
} from './finance.controller';
import { authenticateToken } from '../../middleware/auth';
import { requireRoles } from '../../middleware/roles';
import { enforceCollegeIsolation } from '../../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

// Student routes
router.get('/my-fees', authenticateToken, requireRoles(Role.STUDENT), getStudentFees);
router.post('/pay', authenticateToken, requireRoles(Role.STUDENT, Role.WARDEN), recordPayment);
router.post('/fines/appeal', authenticateToken, requireRoles(Role.STUDENT), appealFine);

// Warden & Admin routes
router.get('/categories', authenticateToken, listFeeCategories);
router.post('/categories', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, createFeeCategory);
router.get('/hostel-overview', authenticateToken, requireRoles(Role.WARDEN, Role.PLATFORM_ADMIN), enforceCollegeIsolation, listHostelFinance);
router.post('/charges', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, createStudentCharge);
router.post('/fines/issue', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, issueFine);
router.put('/fines/appeals/:appealId/review', authenticateToken, requireRoles(Role.WARDEN), enforceCollegeIsolation, reviewAppeal);

export default router;
