import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { CollegeDirectoryPage } from './pages/public/CollegeDirectoryPage';
import { RegisterCollegePage } from './pages/public/RegisterCollegePage';
import { VerifyPassPage } from './pages/public/VerifyPassPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterStudentPage } from './pages/auth/RegisterStudentPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentRoomPage } from './pages/student/StudentRoomPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentMessPage } from './pages/student/StudentMessPage';
import { StudentLaundryPage } from './pages/student/StudentLaundryPage';
import { StudentCleaningPage } from './pages/student/StudentCleaningPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentComplaintsPage } from './pages/student/StudentComplaintsPage';
import { StudentLeavePage } from './pages/student/StudentLeavePage';
import { StudentRulesPage } from './pages/student/StudentRulesPage';
import { StudentFacilitiesPage } from './pages/student/StudentFacilitiesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Warden Portal Pages
import { WardenDashboard } from './pages/warden/WardenDashboard';
import { WardenStudentsPage } from './pages/warden/WardenStudentsPage';
import { WardenRoomsPage } from './pages/warden/WardenRoomsPage';
import { WardenAttendancePage } from './pages/warden/WardenAttendancePage';
import { WardenMessPage } from './pages/warden/WardenMessPage';
import { WardenServicesPage } from './pages/warden/WardenServicesPage';
import { WardenFinancePage } from './pages/warden/WardenFinancePage';
import { WardenComplaintsPage } from './pages/warden/WardenComplaintsPage';
import { WardenLeavePage } from './pages/warden/WardenLeavePage';
import { WardenNoticesPage } from './pages/warden/WardenNoticesPage';
import { WardenAuditPage } from './pages/warden/WardenAuditPage';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCollegesPage } from './pages/admin/AdminCollegesPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

// Route Guards
const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'PLATFORM_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'WARDEN') return <Navigate to="/warden" replace />;
    return <Navigate to="/student" replace />;
  }

  return <Layout />;
};

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'PLATFORM_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'WARDEN') return <Navigate to="/warden" replace />;
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Visitor Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/colleges" element={<CollegeDirectoryPage />} />
        <Route path="/register-college" element={<RegisterCollegePage />} />
        <Route path="/verify-pass" element={<VerifyPassPage />} />
        <Route path="/verify-pass/:code" element={<VerifyPassPage />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthGuard>
              <LoginPage />
            </AuthGuard>
          }
        />
        <Route
          path="/register-student"
          element={
            <AuthGuard>
              <RegisterStudentPage />
            </AuthGuard>
          }
        />

        {/* Student Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/room" element={<StudentRoomPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/mess" element={<StudentMessPage />} />
          <Route path="/student/laundry" element={<StudentLaundryPage />} />
          <Route path="/student/cleaning" element={<StudentCleaningPage />} />
          <Route path="/student/fees" element={<StudentFeesPage />} />
          <Route path="/student/complaints" element={<StudentComplaintsPage />} />
          <Route path="/student/leave" element={<StudentLeavePage />} />
          <Route path="/student/rules" element={<StudentRulesPage />} />
          <Route path="/student/facilities" element={<StudentFacilitiesPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Warden Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['WARDEN']} />}>
          <Route path="/warden" element={<WardenDashboard />} />
          <Route path="/warden/students" element={<WardenStudentsPage />} />
          <Route path="/warden/rooms" element={<WardenRoomsPage />} />
          <Route path="/warden/attendance" element={<WardenAttendancePage />} />
          <Route path="/warden/mess" element={<WardenMessPage />} />
          <Route path="/warden/services" element={<WardenServicesPage />} />
          <Route path="/warden/finance" element={<WardenFinancePage />} />
          <Route path="/warden/complaints" element={<WardenComplaintsPage />} />
          <Route path="/warden/leave" element={<WardenLeavePage />} />
          <Route path="/warden/notices" element={<WardenNoticesPage />} />
          <Route path="/warden/audit" element={<WardenAuditPage />} />
        </Route>

        {/* Platform Admin Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/colleges" element={<AdminCollegesPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
