import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  FileCheck2,
  Plus,
  QrCode,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [selectedPass, setSelectedPass] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    leaveType: 'HOME_VISIT',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    reason: '',
    destination: '',
    contactNumber: '+91 98765 55001',
    emergencyContact: '+91 98200 12345 (Father)',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/leave');
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/leave/apply', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.success) {
        setIsApplying(false);
        setForm({
          leaveType: 'HOME_VISIT',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          reason: '',
          destination: '',
          contactNumber: '+91 98765 55001',
          emergencyContact: '+91 98200 12345 (Father)',
        });
        fetchLeaves();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Requests & Digital QR Passes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit outstation leave requests and present verified digital passes at the campus security gate.
          </p>
        </div>

        <button
          onClick={() => setIsApplying(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Outstation Leave</span>
        </button>
      </div>

      {/* Leaves Grid */}
      {leaves.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-xs">
          No leave applications submitted yet.
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
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                    {l.leaveType.replace('_', ' ')}
                  </span>
                  <StatusBadge status={l.status} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Destination: {l.destination}
                </h3>
                <p className="text-xs text-slate-600 mb-3">{l.reason}</p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(l.startDate).toLocaleString()} — {new Date(l.endDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: {l.contactNumber}</span>
                  </div>
                </div>

                {l.wardenRemarks && (
                  <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-xs text-brand-900 mb-3">
                    <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                      Warden Remarks
                    </span>
                    <span>{l.wardenRemarks}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {l.status === 'APPROVED' ? `Pass: ${l.passCode}` : 'Awaiting Warden Decision'}
                </span>

                {l.status === 'APPROVED' && (
                  <button
                    onClick={() => setSelectedPass(l)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Gate Pass</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital QR Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>OFFICIAL CAMPUS GATE PASS</span>
            </div>

            <h3 className="text-lg font-black text-slate-900">{selectedPass.passCode}</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedPass.destination}</p>

            {/* Rendered Live QR Code */}
            {selectedPass.qrCodeDataUrl ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mb-4 shadow-inner">
                <img
                  src={selectedPass.qrCodeDataUrl}
                  alt="Security QR Code"
                  className="w-44 h-44 mx-auto"
                />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400 mx-auto mb-4">
                QR Not Generated
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 border border-slate-100 text-left space-y-1 mb-4">
              <div>
                <span className="font-bold text-slate-700">Valid From:</span>{' '}
                {new Date(selectedPass.startDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-bold text-slate-700">Return By:</span>{' '}
                {new Date(selectedPass.endDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-bold text-slate-700">Student:</span> {selectedPass.student?.user?.fullName}
              </div>
            </div>

            <Link
              to={`/verify-pass/${selectedPass.passCode}`}
              target="_blank"
              className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:underline"
            >
              <span>Test Security Guard Verification Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplying && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Apply for Outstation Leave</h3>
              <button
                onClick={() => setIsApplying(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="HOME_VISIT">Home Visit</option>
                    <option value="WEEKEND">Weekend Outing</option>
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="EMERGENCY">Family Emergency</option>
                    <option value="OTHER">Other Academic Travel</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination City/Address *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mysuru / Parent Residence"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure Date & Time *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Return Date & Time *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Self Contact Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent Contact *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Reason for Travel *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Specify the reason (e.g. Attending sibling wedding, festival holidays)..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Warden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
