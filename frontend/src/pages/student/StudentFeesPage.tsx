import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { CreditCard, CheckCircle2, AlertCircle, FileText, Send, X, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentFeesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [payingCharge, setPayingCharge] = useState<any | null>(null);
  const [appealingFine, setAppealingFine] = useState<any | null>(null);
  const [appealReason, setAppealReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/finance/my-fees');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!payingCharge) return;
    setIsProcessing(true);
    setMsg(null);

    try {
      const res = await apiRequest('/finance/pay', {
        method: 'POST',
        body: JSON.stringify({
          chargeId: payingCharge.id,
          amount: payingCharge.amount,
          paymentMethod: 'ONLINE',
          transactionReference: `TXN-DEMO-${Date.now()}`,
        }),
      });

      if (res.success) {
        setMsg({
          type: 'success',
          text: `Payment of ₹${payingCharge.amount.toLocaleString()} successful! Receipt: ${res.data.receiptNumber}`,
        });
        setPayingCharge(null);
        fetchFees();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Payment failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAppealFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealingFine) return;
    setIsProcessing(true);
    setMsg(null);

    try {
      const res = await apiRequest('/finance/fines/appeal', {
        method: 'POST',
        body: JSON.stringify({
          fineId: appealingFine.id,
          reason: appealReason,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Fine appeal submitted to Warden for review.' });
        setAppealingFine(null);
        setAppealReason('');
        fetchFees();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit appeal.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fees & Payments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Hostel rent, mess catering charges, payment receipts, and disciplinary fines.
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

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Billed Dues
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(data?.summary?.totalCharges ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Current semester charges</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Total Paid & Verified
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{(data?.summary?.totalPaid ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Settled with official receipts</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
            Outstanding Balance
          </span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            ₹{(data?.summary?.totalPending ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pending payment</span>
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Hostel Fee Schedule</h2>

        {data?.charges?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No charges billed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action / Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.charges?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.category.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(c.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{c.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.status === 'PAID' ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {c.payments?.[0]?.receiptNumber || 'REC-VERIFIED'}
                        </span>
                      ) : (
                        <button
                          onClick={() => setPayingCharge(c)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition"
                        >
                          Pay Online
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disciplinary Fines */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Hostel Fines & Disciplinary Levies</h2>
        </div>

        {data?.fines?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No disciplinary fines issued on your record. Clean conduct!
          </div>
        ) : (
          <div className="space-y-3">
            {data?.fines?.map((fine: any) => (
              <div
                key={fine.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-slate-900 text-xs">₹{fine.amount}</span>
                    <StatusBadge status={fine.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{fine.reason}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Issued by {fine.issuedBy.fullName} • Due:{' '}
                    {new Date(fine.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  {fine.status === 'ISSUED' && (
                    <button
                      onClick={() => setAppealingFine(fine)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition"
                    >
                      Submit Appeal
                    </button>
                  )}
                  {fine.status === 'APPEALED' && (
                    <span className="text-xs text-amber-700 font-medium">Appeal under review</span>
                  )}
                  {fine.status === 'WAIVED' && (
                    <span className="text-xs text-emerald-700 font-semibold">Fine Waived</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {payingCharge && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Make Fee Payment</h3>
              <button
                onClick={() => setPayingCharge(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Category:</span>
                <span className="font-bold text-slate-800">{payingCharge.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Amount:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{payingCharge.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-medium text-emerald-600">Simulated Campus Secure Gateway</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setPayingCharge(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
              >
                {isProcessing ? 'Processing Payment...' : 'Confirm & Generate Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {appealingFine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Appeal Disciplinary Fine</h3>
              <button
                onClick={() => setAppealingFine(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppealFine} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">Fine of ₹{appealingFine.amount}</span>
                <span>{appealingFine.reason}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Appeal & Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the extenuating circumstances or lab permissions..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAppealingFine(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !appealReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isProcessing ? 'Submitting...' : 'Submit Appeal to Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
