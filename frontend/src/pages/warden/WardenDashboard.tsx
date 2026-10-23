import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  Bed,
  Users,
  MessageSquareWarning,
  FileCheck2,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/analytics/warden');
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = analytics?.summary;
  const charts = analytics?.charts;

  const PIE_COLORS = ['#026fc7', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
            Hostel Operations Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Warden Control Center — {user?.hostel?.name || 'Assigned Hostel'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            {user?.college?.name} • Managing residential occupancy, attendance roll calls, and disciplinary conduct.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/warden/rooms"
            className="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-sm hover:bg-teal-50 transition"
          >
            Allocate Rooms
          </Link>
          <Link
            to="/warden/attendance"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            Conduct Roll Call
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Occupancy
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {summary?.occupancyPercentage ?? 0}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {summary?.occupiedBeds ?? 0} of {summary?.totalBeds ?? 0} Beds
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Available Beds
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {summary?.availableBeds ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Ready to allocate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Students
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {summary?.pendingApprovals ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Awaiting verification</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
            Open Complaints
          </span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {summary?.openComplaints ?? 0}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
            {summary?.overdueComplaints ?? 0} Overdue SLA
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
            Pending Leaves
          </span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {summary?.pendingLeaves ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Outstation requests</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
            Total Collected
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 truncate">
            ₹{((summary?.totalCollected ?? 0) / 1000).toFixed(0)}k
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Bal: ₹{((summary?.totalOutstanding ?? 0) / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: 7-Day Attendance Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Trend (Last 7 Sessions)</h3>
              <p className="text-[11px] text-slate-500">Roll call compliance percentages</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Live Database Data
            </span>
          </div>

          <div className="h-64">
            {charts?.attendanceTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.attendanceTrend}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c8ce9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0c8ce9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#026fc7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Record attendance sessions to generate trend charts.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Occupancy Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bed Capacity Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-2">Occupied vs Available vs Maintenance</p>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.occupancyBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts?.occupancyBreakdown?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Occupied</span>
              <span className="font-bold text-brand-700">{summary?.occupiedBeds ?? 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Available</span>
              <span className="font-bold text-emerald-700">{summary?.availableBeds ?? 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Maintenance</span>
              <span className="font-bold text-amber-700">{summary?.maintenanceBeds ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Complaints by Category */}
        <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints Volume by Category</h3>
              <p className="text-[11px] text-slate-500">Distribution across maintenance domains</p>
            </div>
            <Link
              to="/warden/complaints"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
            >
              <span>Manage Complaint Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-56">
            {charts?.complaintsByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.complaintsByCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#36a7f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active complaints registered.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
