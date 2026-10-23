import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { FileCheck2, Check, X, Clock, MapPin, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, [tab]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const url = tab === 'ALL' ? '/leave' : `/leave?status=${tab}`;
      const res = await apiRequest(url);
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    const wardenRemarks = prompt(`Enter comments/remarks for ${decision} decision:`) || undefined;

    try {
      const res = await apiRequest(`/leave/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ decision, wardenRemarks }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Operation completed successfully.' });
        fetchLeaves();
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Operation failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Outstation Leave Applications & Gate Pass Approval
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review student travel requests and authorize security gate clearance.
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
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'ALL'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'PENDING' ? 'Pending Applications' : t === 'APPROVED' ? 'Approved Passes' : 'All Requests'}
          </button>
        ))}
      </div>

      {/* Leave Applications Grid */}
      {leaves.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
          No leave applications found under this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaves.map((l) => (
            <div
              key={l.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {l.student?.user?.fullName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({l.student?.rollNumber})
                    </span>
                  </div>
                  <StatusBadge status={l.status} />
                </div>

                <div className="text-xs text-slate-700 font-medium mb-1">
                  Destination: <span className="font-bold text-slate-900">{l.destination}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{l.reason}</p>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                  <div>
                    <span className="font-semibold text-slate-700">Dates:</span>{' '}
                    {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Contact:</span> {l.contactNumber}
                  </div>
                  {l.emergencyContact && (
                    <div>
                      <span className="font-semibold text-slate-700">Parent:</span> {l.emergencyContact}
                    </div>
                  )}
                </div>

                {l.passCode && (
                  <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center mb-3">
                    Active Pass Code: {l.passCode}
                  </div>
                )}
              </div>

              {l.status === 'PENDING' && (
                <div className="flex space-x-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleReview(l.id, 'APPROVED')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Approve & Issue Pass
                  </button>
                  <button
                    onClick={() => handleReview(l.id, 'REJECTED')}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
