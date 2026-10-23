import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentAttendancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/attendance/my-attendance');
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const records = data?.records || [];
  const filtered = filter === 'ALL' ? records : records.filter((r: any) => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Attendance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Roll call session records, nightly verification, and attendance compliance.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compliance</span>
          <span className="text-3xl font-black text-brand-700 mt-1">
            {data?.attendancePercentage ?? 100}%
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 mt-0.5">Min required: 75%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sessions</span>
          <span className="text-2xl font-bold text-slate-800 mt-1">{data?.totalSessions ?? 0}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Recorded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1">{data?.presentCount ?? 0}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">On time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Late</span>
          <span className="text-2xl font-bold text-amber-700 mt-1">{data?.lateCount ?? 0}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Admitted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Absent</span>
          <span className="text-2xl font-bold text-rose-700 mt-1">{data?.absentCount ?? 0}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Unexcused</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <h2 className="text-base font-bold text-slate-900">Session Attendance Log</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No attendance sessions matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Conducted By</th>
                  <th className="py-3 px-4">Remarks / Correction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.sessionType}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.conductedBy}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {rec.remarks || '—'}
                      {rec.isCorrected && (
                        <span className="block text-[10px] text-purple-600 font-medium mt-0.5">
                          Corrected: {rec.correctionReason}
                        </span>
                      )}
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
