import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Home,
  CalendarCheck,
  CreditCard,
  MessageSquareWarning,
  FileCheck2,
  Megaphone,
  ArrowRight,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [fees, setFees] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [rRes, aRes, fRes, cRes, lRes, nRes]: any[] = await Promise.all([
        apiRequest('/rooms/my-room').catch(() => ({ success: false })),
        apiRequest('/attendance/my-attendance').catch(() => ({ success: false })),
        apiRequest('/finance/my-fees').catch(() => ({ success: false })),
        apiRequest('/complaints').catch(() => ({ success: false, data: [] })),
        apiRequest('/leave').catch(() => ({ success: false, data: [] })),
        apiRequest('/notices').catch(() => ({ success: false, data: [] })),
      ]);

      if (rRes.success && rRes.allocated) setRoomData(rRes.data);
      if (aRes.success) setAttendance(aRes.data);
      if (fRes.success) setFees(fRes.summary);
      if (cRes.success) setComplaints(cRes.data);
      if (lRes.success) setLeaves(lRes.data);
      if (nRes.success) setNotices(nRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openComplaintsCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  ).length;

  const activeLeave = leaves.find((l) => l.status === 'APPROVED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
            Student Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-xl">
            {user?.studentProfile?.course || 'Undergraduate Program'} • Year {user?.studentProfile?.year || 1} • Roll:{' '}
            <span className="font-mono">{user?.studentProfile?.rollNumber}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeLeave && (
            <Link
              to="/student/leave"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm hover:bg-emerald-50 transition flex items-center space-x-1.5"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Digital Gate Pass Active</span>
            </Link>
          )}

          <Link
            to="/student/complaints"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            Report an Issue
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: My Room */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Room & Bed</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>

            {roomData ? (
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  Room {roomData.roomNumber}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Bed <span className="font-bold text-brand-700">{roomData.bedNumber}</span> • {roomData.blockName} • Floor {roomData.floor}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {roomData.roommates?.length || 0} Roommate(s) allocated
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                Pending bed assignment by Warden.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Twin Sharing Room</span>
            <Link to="/student/room" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Status</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">
                {attendance?.attendancePercentage ?? 100}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Good Standing
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Present in {attendance?.presentCount ?? 0} out of {attendance?.totalSessions ?? 0} recorded sessions.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Night roll call: 09:30 PM</span>
            <Link to="/student/attendance" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
              <span>Attendance Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Outstanding Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hostel Fees & Fines</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900">
              ₹{(fees?.totalPending ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {fees?.totalPending > 0
                ? 'Pending dues for catering or accommodation.'
                : 'All applicable dues and charges are fully settled.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {fees?.finesCount ?? 0} Disciplinary Fine(s)
            </span>
            <Link to="/student/fees" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
              <span>Pay & Statements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Open Complaints */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Center</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900">
              {openComplaintsCount} Active Ticket(s)
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {openComplaintsCount > 0
                ? 'Under maintenance review by hostel warden.'
                : 'No open repair or grievance complaints.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Avg SLA: 24 - 48 Hours</span>
            <Link to="/student/complaints" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
              <span>View Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 5: Outstation Leave Pass */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Leave Pass</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>

            {activeLeave ? (
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 text-emerald-700">
                  <span>Pass: {activeLeave.passCode}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 truncate">
                  To: {activeLeave.destination}
                </div>
                <div className="text-[10px] text-slate-400">
                  Until: {new Date(activeLeave.endDate).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-slate-700">No Active Gate Pass</div>
                <p className="text-xs text-slate-400 mt-1">Apply 24 hours prior to travel for clearance.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Security QR Gate Pass</span>
            <Link to="/student/leave" className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
              <span>Apply / View Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 6: Daily Services */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Hostel Services</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="text-sm font-bold text-slate-900">Laundry & Housekeeping</div>
            <p className="text-xs text-slate-500 mt-1">
              Book your washing slot and view daily room sanitation schedule.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-3">
            <Link to="/student/laundry" className="text-xs font-bold text-brand-600 hover:text-brand-800">
              Laundry Slots
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/student/cleaning" className="text-xs font-bold text-brand-600 hover:text-brand-800">
              Housekeeping
            </Link>
          </div>
        </div>
      </div>

      {/* Notices Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Official Hostel Notices & Bulletins</h2>
          </div>
          <span className="text-xs text-slate-400">{notices.length} Published</span>
        </div>

        <div className="space-y-3">
          {notices.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No notices published for your hostel.
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-200 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{notice.title}</h3>
                  <StatusBadge status={notice.priority} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-2">
                  <span>Published by {notice.publishedBy?.fullName || 'Warden Office'}</span>
                  <span>•</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
