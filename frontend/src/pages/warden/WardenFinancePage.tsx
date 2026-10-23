import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { CreditCard, Plus, ShieldAlert, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenFinancePage: React.FC = () => {
  const [financeData, setFinanceData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isIssuingFine, setIsIssuingFine] = useState<boolean>(false);
  const [fineForm, setFineForm] = useState({
    studentId: '',
    reason: '',
    amount: 250,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFinance();
    fetchStudents();
  }, []);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/finance/hostel-overview');
      if (res.success) {
        setFinanceData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiRequest('/students?status=APPROVED');
      if (res.success) {
        setStudents(res.data);
        if (res.data.length > 0) setFineForm((prev) => ({ ...prev, studentId: res.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueFine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    try {
      const res = await apiRequest('/finance/fines/issue', {
        method: 'POST',
        body: JSON.stringify({
          ...fineForm,
          amount: parseFloat(String(fineForm.amount)),
          hostelId: students[0]?.hostelId,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Disciplinary fine issued to student.' });
        setIsIssuingFine(false);
        setFineForm({
          studentId: students[0]?.id || '',
          reason: '',
          amount: 250,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchFinance();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to issue fine.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewAppeal = async (appealId: string, decision: 'APPROVED' | 'REJECTED') => {
    const comments = prompt(`Enter comments for ${decision} decision:`) || 'Reviewed by Warden';

    try {
      const res = await apiRequest(`/finance/fines/appeals/${appealId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ decision, comments }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: `Fine appeal marked as ${decision}.` });
        fetchFinance();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fees, Charges & Disciplinary Fines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student payments, issue conduct levies, and review student fine appeals.
          </p>
        </div>

        <button
          onClick={() => setIsIssuingFine(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Disciplinary Fine</span>
        </button>
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

      {/* Disciplinary Fines & Appeals Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Issued Fines & Student Appeals Queue
        </h2>

        {financeData?.fines?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No disciplinary fines recorded for this hostel.
          </div>
        ) : (
          <div className="space-y-3">
            {financeData?.fines?.map((f: any) => {
              const pendingAppeal = f.appeals?.find((a: any) => a.status === 'PENDING');
              return (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-slate-900">
                        {f.student?.user?.fullName} ({f.student?.rollNumber})
                      </span>
                      <span className="font-black text-rose-700">₹{f.amount}</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <p className="text-slate-600 font-medium">{f.reason}</p>

                    {pendingAppeal && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700">
                          Pending Student Appeal
                        </span>
                        <span>"{pendingAppeal.reason}"</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {pendingAppeal && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReviewAppeal(pendingAppeal.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                        >
                          Approve & Waive Fine
                        </button>
                        <button
                          onClick={() => handleReviewAppeal(pendingAppeal.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                        >
                          Reject Appeal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Fine Modal */}
      {isIssuingFine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Issue Disciplinary Fine</h3>
              <button
                onClick={() => setIsIssuingFine(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueFine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Student Resident *
                </label>
                <select
                  required
                  value={fineForm.studentId}
                  onChange={(e) => setFineForm({ ...fineForm, studentId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fine Amount (INR) *
                </label>
                <input
                  required
                  type="number"
                  min="50"
                  step="50"
                  value={fineForm.amount}
                  onChange={(e) => setFineForm({ ...fineForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Infraction / Reason *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Late entry after curfew / Unauthorized visitor in room"
                  value={fineForm.reason}
                  onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Due Date *
                </label>
                <input
                  required
                  type="date"
                  value={fineForm.dueDate}
                  onChange={(e) => setFineForm({ ...fineForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssuingFine(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isSubmitting ? 'Issuing...' : 'Issue Disciplinary Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
