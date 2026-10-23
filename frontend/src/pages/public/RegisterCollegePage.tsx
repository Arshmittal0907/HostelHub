import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Building2, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export const RegisterCollegePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    officialEmail: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    representativeName: '',
    representativeRole: '',
    representativeContact: '',
    hostels: 'Main Boys Hostel, Main Girls Hostel',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const hostelNames = formData.hostels.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await apiRequest('/auth/register-college', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          hostelNames,
        }),
      });

      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration application.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-brand-700 font-bold text-xl">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Hostel<span className="text-teal-600">Hub</span></span>
        </Link>

        <Link
          to="/colleges"
          className="text-xs font-semibold text-slate-600 hover:text-brand-700 transition"
        >
          View Approved Colleges
        </Link>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {success ? (
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-emerald-200 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
              Your institutional registration request has been created under status{' '}
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                PENDING_VERIFICATION
              </span>
              . Platform Administrators have received your file and will review recognition documents.
            </p>

            <div className="flex justify-center space-x-3">
              <Link
                to="/colleges"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Browse Directory
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900">Register University or College</h1>
              <p className="text-xs text-slate-500 mt-1">
                Centralize your boys' and girls' hostel operations under one enterprise SaaS platform.
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Institution Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official College Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. St. Xavier Institute of Engineering"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College Code (Acronym) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. SXIE-MUMBAI"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Institutional Email *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. hostels@sxie.edu"
                      value={formData.officialEmail}
                      onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://sxie.edu"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Phone *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="+91 22 2845 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Address *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Street, Landmark, Area"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                      <input
                        required
                        type="text"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIN *</label>
                      <input
                        required
                        type="text"
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Representative */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Authorized Representative Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Representative Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Prof. Ramesh Nair"
                      value={formData.representativeName}
                      onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Designation *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Dean of Hostels / Registrar"
                      value={formData.representativeRole}
                      onChange={(e) => setFormData({ ...formData, representativeRole: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="+91 98765 00000"
                      value={formData.representativeContact}
                      onChange={(e) => setFormData({ ...formData, representativeContact: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Hostels */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Hostels to Provision (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tagore Boys Hostel, Sarojini Girls Hostel"
                  value={formData.hostels}
                  onChange={(e) => setFormData({ ...formData, hostels: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  You can configure additional blocks, floors, and rooms after approval.
                </span>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Submitting Registration...' : 'Submit Institutional Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
