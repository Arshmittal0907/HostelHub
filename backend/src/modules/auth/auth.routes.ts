import { Router } from 'express';
import { login, registerStudent, registerWarden, registerCollege, getMe } from './auth.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register-student', registerStudent);
router.post('/register-warden', registerWarden);
router.post('/register-college', registerCollege);
router.get('/me', authenticateToken, getMe);
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
