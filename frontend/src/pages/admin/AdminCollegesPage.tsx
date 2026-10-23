import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Building2, Search, CheckCircle2, XCircle, FileText, Check, X, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminCollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [tab, setTab] = useState<'PENDING_VERIFICATION' | 'APPROVED' | 'ALL'>('PENDING_VERIFICATION');
  const [selectedCollege, setSelectedCollege] = useState<any | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REQUEST_INFO'>('APPROVED');
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchColleges();
  }, [tab]);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const url = tab === 'ALL' ? '/colleges/admin/all' : `/colleges/admin/all?status=${tab}`;
      const res = await apiRequest(url);
      if (res.success) {
        setColleges(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege) return;
    setIsSubmitting(true);
    setMsg(null);

    try {
      const res = await apiRequest(`/colleges/admin/${selectedCollege.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          reason: decisionReason,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Action completed successfully.' });
        setSelectedCollege(null);
        setDecisionReason('');
        fetchColleges();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Verification failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          College Verification Workstation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review institutional applications, verify documents, and grant platform operational authority.
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
        {['PENDING_VERIFICATION', 'APPROVED', 'ALL'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'PENDING_VERIFICATION' ? 'Pending Applications' : t === 'APPROVED' ? 'Approved Directory' : 'All Colleges'}
          </button>
        ))}
      </div>

      {/* Colleges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colleges.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {col.code}
                </span>
                <StatusBadge status={col.status} />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{col.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{col.address}, {col.city}, {col.state} - {col.pincode}</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5 mb-4">
                <div>
                  <span className="text-slate-400 font-semibold">Official Email:</span>{' '}
                  <span className="font-medium text-slate-800">{col.officialEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Representative:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {col.representativeName} ({col.representativeRole})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Phone:</span>{' '}
                  <span className="font-medium text-slate-800">{col.phone}</span>
                </div>
                {col.verificationNotes && (
                  <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Review Notes:</span>
                    <span>{col.verificationNotes}</span>
                  </div>
                )}
              </div>

              {/* Documents */}
              {col.documents?.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Uploaded Verification Files
                  </span>
                  <div className="space-y-1">
                    {col.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-medium truncate">{doc.fileName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-700">{doc.documentType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Applied: {new Date(col.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => {
                  setSelectedCollege(col);
                  setDecision(col.status === 'PENDING_VERIFICATION' ? 'APPROVED' : 'APPROVED');
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition"
              >
                Inspect & Verify
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Institutional Verification</h3>
                <p className="text-xs text-slate-500">{selectedCollege.name} ({selectedCollege.code})</p>
              </div>
              <button
                onClick={() => setSelectedCollege(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      decision === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REQUEST_INFO')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      decision === 'REQUEST_INFO'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Request Info
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recorded Reason & Audit Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the justification, land registry verification, UGC/AICTE recognition checks..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCollege(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !decisionReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Verification Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
