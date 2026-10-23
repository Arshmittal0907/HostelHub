import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import collegesRoutes from './modules/colleges/colleges.routes';
import hostelsRoutes from './modules/hostels/hostels.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import studentsRoutes from './modules/students/students.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import messRoutes from './modules/mess/mess.routes';
import laundryRoutes from './modules/laundry/laundry.routes';
import cleaningRoutes from './modules/cleaning/cleaning.routes';
import financeRoutes from './modules/finance/finance.routes';
import complaintsRoutes from './modules/complaints/complaints.routes';
import leaveRoutes from './modules/leave/leave.routes';
import facilitiesRoutes from './modules/facilities/facilities.routes';
import noticesRoutes from './modules/notices/notices.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev servers)
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HostelHub Core API',
    version: '1.0.0',
  });
});

// Mount domain modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/colleges', collegesRoutes);
app.use('/api/v1/hostels', hostelsRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/mess', messRoutes);
app.use('/api/v1/laundry', laundryRoutes);
app.use('/api/v1/cleaning', cleaningRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/facilities', facilitiesRoutes);
app.use('/api/v1/notices', noticesRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit', auditRoutes);

// Error Handler
app.use(errorHandler);

export default app;
