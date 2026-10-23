import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { ShieldCheck, CheckCircle2, XCircle, Search, Clock, MapPin, Building, ArrowLeft } from 'lucide-react';

export const VerifyPassPage: React.FC = () => {
  const { code } = useParams();
  const [passInput, setPassInput] = useState<string>(code || '');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (code) {
      verifyPass(code);
    }
  }, [code]);

  const verifyPass = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await apiRequest(`/leave/verify/${encodeURIComponent(codeToVerify.trim())}`);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Pass record not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPass(passInput);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-brand-700 font-bold text-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Security<span className="text-emerald-700">GatePass</span></span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Campus Gate Verification Workstation
        </span>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Site</span>
        </Link>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Campus Security Pass Validator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter Pass Code (e.g. PASS-AIT-99014) or scan the student digital QR pass.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Pass Code (e.g. PASS-AIT-99014)..."
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !passInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Pass'}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Quick Evaluator Test:</span>
            <button
              type="button"
              onClick={() => {
                setPassInput('PASS-AIT-99014');
                verifyPass('PASS-AIT-99014');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Test with 'PASS-AIT-99014' (Aarav Patel)
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block">Gate Pass Invalid / Not Found</span>
                <span className="text-[11px] opacity-90">{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-6 rounded-2xl border ${
                result.valid
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-200/50 mb-4">
                <div className="flex items-center space-x-2">
                  {result.valid ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {result.valid ? 'AUTHORIZED FOR EXIT / ENTRY' : 'GATE PASS INVALID'}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {result.statusMessage}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {result.data.passCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                  <span className="font-bold text-slate-800 text-sm">{result.data.studentName}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Roll Number</span>
                  <span className="font-bold text-slate-800 font-mono">{result.data.rollNumber}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">College & Hostel</span>
                  <span className="text-slate-700">{result.data.college} • {result.data.hostel}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Allocated Room</span>
                  <span className="text-slate-700 font-semibold">Room {result.data.roomNumber}</span>
                </div>

                <div className="col-span-2 bg-white/80 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Approved Travel Dates</span>
                  <div className="flex items-center space-x-2 text-slate-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(result.data.startDate).toLocaleString()} — {new Date(result.data.endDate).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Authorized Destination</span>
                  <span className="text-slate-800 font-medium">{result.data.destination}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Authorized By</span>
                  <span className="text-slate-700">{result.data.approvedBy || 'Hostel Warden'}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Approved At</span>
                  <span className="text-slate-700">{new Date(result.data.approvedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
