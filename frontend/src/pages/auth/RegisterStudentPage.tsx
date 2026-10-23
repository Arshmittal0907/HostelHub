import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Building2, UserPlus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegisterStudentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCollegeId = searchParams.get('collegeId') || '';

  const [colleges, setColleges] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'Password@123',
    phone: '',
    collegeId: preselectedCollegeId,
    hostelId: '',
    rollNumber: '',
    course: 'B.Tech Computer Science & Engineering',
    year: 1,
    emergencyContact: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchApprovedColleges();
  }, []);

  useEffect(() => {
    if (formData.collegeId) {
      fetchHostelsForCollege(formData.collegeId);
    } else {
      setHostels([]);
    }
  }, [formData.collegeId]);

  const fetchApprovedColleges = async () => {
    try {
      const res = await apiRequest('/colleges');
      if (res.success) {
        setColleges(res.data);
        if (preselectedCollegeId && !formData.collegeId) {
          setFormData((prev) => ({ ...prev, collegeId: preselectedCollegeId }));
        } else if (res.data.length > 0 && !formData.collegeId) {
          setFormData((prev) => ({ ...prev, collegeId: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHostelsForCollege = async (collegeId: string) => {
    try {
      const res = await apiRequest(`/hostels?collegeId=${collegeId}`);
      if (res.success && res.data.length > 0) {
        setHostels(res.data);
        setFormData((prev) => ({ ...prev, hostelId: res.data[0].id }));
      } else {
        setHostels([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await apiRequest('/auth/register-student', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          year: parseInt(String(formData.year), 10),
        }),
      });

      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-xl w-full">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        {success ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your registration application for hostel accommodation has been placed in the queue for{' '}
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Warden Verification & Approval
              </span>
              . Once the Warden approves your profile, your credentials will become active.
            </p>

            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition inline-block"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900">Student Hostel Registration</h1>
              <p className="text-xs text-slate-500 mt-1">
                Select your approved college and submit your room application.
              </p>
            </div>

            {error && (
              <div className="p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Approved College *
                  </label>
                  <select
                    required
                    value={formData.collegeId}
                    onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Choose College --</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) — {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Hostel *
                  </label>
                  <select
                    required
                    value={formData.hostelId}
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {hostels.length === 0 ? (
                      <option value="">No hostels available for selected college</option>
                    ) : (
                      hostels.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.type} Hostel)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Siddharth Verma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="siddharth.v@apextech.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student / Roll Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AIT-2024-CS-199"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Course *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="B.Tech Computer Science"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Emergency Contact & Relation *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98200 11223 (Mr. Rajesh Verma - Father)"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Portal Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Student Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
