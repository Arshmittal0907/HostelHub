import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Search, Check, X, ShieldAlert, CheckCircle2, Phone, Mail } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [tab, search]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (tab === 'PENDING') query.append('status', 'PENDING_APPROVAL');
      if (tab === 'APPROVED') query.append('status', 'APPROVED');
      if (search) query.append('search', search);

      const res = await apiRequest(`/students?${query.toString()}`);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    const reason = decision === 'REJECTED' ? prompt('Enter reason for rejection:') || 'Criteria not met' : undefined;

    try {
      const res = await apiRequest(`/students/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Operation completed successfully.' });
        fetchStudents();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed.' });
    }
  };

  const pendingCount = students.filter((s) => s.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Registrations & Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review new student hostel applications and manage enrolled residents.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              tab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Pending Approvals</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'APPROVED'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Approved Residents
          </button>

          <button
            onClick={() => setTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Students
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, roll, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        {students.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No student records found under this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Course & Year</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Allocated Bed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="text-[11px] text-slate-500">{s.email} • {s.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{s.course}</div>
                      <div className="text-[10px] text-slate-400">Year {s.year}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {s.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      {s.allocation ? (
                        <span className="font-mono text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          Room {s.allocation.roomNumber} ({s.allocation.bedNumber})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Allocated</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApproveReject(s.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Approve Student"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveReject(s.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                            title="Reject Student"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Verified</span>
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
