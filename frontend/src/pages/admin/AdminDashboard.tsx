import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Building2, ShieldCheck, Users, Bed, MessageSquareWarning, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/analytics/admin');
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const colleges = data?.colleges;
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
            HostelHub Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Multi-College Governance & Verification Workstation
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
            Review institutional applications, inspect statutory recognition records, and oversee platform integrity.
          </p>
        </div>

        <Link
          to="/admin/colleges"
          className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs shadow-sm hover:bg-purple-50 transition shrink-0"
        >
          Verify Pending Colleges ({colleges?.pending ?? 0})
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Colleges
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">{colleges?.total ?? 0}</div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{colleges?.approved ?? 0} Approved</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{colleges?.pending ?? 0} Pending</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Provisioned Hostels
          </span>
          <div className="text-3xl font-black text-teal-700 mt-1">{totals?.hostels ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Boys & Girls residential blocks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Registered Students
          </span>
          <div className="text-3xl font-black text-brand-700 mt-1">{totals?.students ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Across all partner colleges</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Appointed Wardens
          </span>
          <div className="text-3xl font-black text-purple-700 mt-1">{totals?.wardens ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Assigned hostel managers</span>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Recent Institutional Verification Reviews
          </h2>
          <Link
            to="/admin/colleges"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentReviews?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No institutional reviews logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Recorded Reason</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Reviewed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentReviews?.map((rev: any) => (
                  <tr key={rev.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {rev.college?.name} ({rev.college?.code})
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rev.decision} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{rev.reason}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{rev.reviewedBy?.fullName}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(rev.reviewedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
