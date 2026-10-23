import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('student.aarav@apextech.edu');
  const [password, setPassword] = useState<string>('Password@123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);

        if (res.user.role === 'PLATFORM_ADMIN') {
          navigate('/admin');
        } else if (res.user.role === 'WARDEN') {
          navigate('/warden');
        } else {
          navigate('/student');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 text-brand-700 font-bold text-2xl tracking-tight mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span>Hostel<span className="text-teal-600">Hub</span></span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900">Sign in to your portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">Multi-College Hostel Management System</p>
        </div>

        {isExpired && (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              One-Click Demo Switcher (Instant Evaluation)
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoRole('student.aarav@apextech.edu')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 text-left text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-bold text-slate-900 block">👨‍🎓 Aarav Patel (Student)</span>
                  <span className="text-[10px] text-slate-500">Apex Tech • Cauvery Boys Hostel</span>
                </div>
                <span className="text-[10px] font-bold text-brand-600 bg-white px-2 py-0.5 rounded border border-slate-200">Select</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('warden.boys@apextech.edu')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-bold text-slate-900 block">🛡️ Suresh Kumar (Warden)</span>
                  <span className="text-[10px] text-slate-500">Apex Tech • Boys Hostel Operations</span>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">Select</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('warden.girls@apextech.edu')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 text-left text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-bold text-slate-900 block">👩‍🏫 Sunita Verma (Warden)</span>
                  <span className="text-[10px] text-slate-500">Apex Tech • Ganga Girls Hostel</span>
                </div>
                <span className="text-[10px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded border border-slate-200">Select</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('admin@hostelhub.com')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-left text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div>
                  <span className="font-bold text-slate-900 block">🏛️ Dr. Rajesh Sharma (Admin)</span>
                  <span className="text-[10px] text-slate-500">Platform-Wide University Verification</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-slate-200">Select</span>
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-xs text-slate-500">
            New student?{' '}
            <Link to="/register-student" className="font-semibold text-brand-600 hover:underline">
              Register for Hostel Accommodation
            </Link>
          </div>
          <div className="text-xs text-slate-500">
            University official?{' '}
            <Link to="/register-college" className="font-semibold text-brand-600 hover:underline">
              Register Institution
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
