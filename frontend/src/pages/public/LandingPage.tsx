import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Bed,
  QrCode,
  Utensils,
  Receipt,
  MessageSquareWarning,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 text-brand-700 font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span>Hostel<span className="text-teal-600">Hub</span></span>
        </Link>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/colleges"
            className="text-xs font-semibold text-slate-600 hover:text-brand-700 transition hidden sm:inline-block"
          >
            Approved Colleges
          </Link>
          <Link
            to="/register-college"
            className="text-xs font-semibold text-slate-600 hover:text-brand-700 transition hidden md:inline-block"
          >
            Register Institution
          </Link>
          <Link
            to="/verify-pass"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            Gate Pass Scanner
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition"
          >
            Sign In Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Centralized Multi-College Residential SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Smart Hostel Management for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-teal-600 to-emerald-600">
            Modern Universities & Colleges
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          A production-grade platform uniting institutions, wardens, students, and security staff.
          Featuring atomic room allocation, digital QR leave passes, automated mess planners,
          housekeeping dispatch, disciplinary fine appeals, and live SLA complaint resolution.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition"
          >
            <span>Explore Live Portals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/colleges"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm shadow-xs transition"
          >
            Search Approved Colleges
          </Link>

          <Link
            to="/register-college"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-sm transition"
          >
            Register College
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Strict Data Boundary</h4>
            <p className="text-[11px] text-slate-500 mt-1">Cross-college and cross-hostel access is isolated at the database level.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <Bed className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Atomic Allocations</h4>
            <p className="text-[11px] text-slate-500 mt-1">Database transactions ensure zero double-booking or bed collisions.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <QrCode className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Digital QR Passes</h4>
            <p className="text-[11px] text-slate-500 mt-1">Time-locked cryptographic QR codes verified at campus security gates.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <MessageSquareWarning className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">SLA Complaint Engine</h4>
            <p className="text-[11px] text-slate-500 mt-1">Emergency-to-low priority SLAs with 2-way Warden message threads.</p>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="bg-white py-16 px-6 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              One Unified System. Four Dedicated Portals.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Engineered with clean separation of concerns for platform administrators, wardens, students, and public visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-4">
                👨‍🎓
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-2">Student Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Interactive room & roommate view, live mess timetable, online laundry slot booking, digital outstation leave passes with QR tokens, fee receipts, and ticketed complaint threads.
              </p>
              <Link to="/login" className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center space-x-1">
                <span>View Student Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-2">Warden Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Hostel occupancy charts, student registration approvals, block/floor/bed management, daily attendance roll call, laundry schedules, housekeeping tracking, and fine issuance.
              </p>
              <Link to="/login" className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center space-x-1">
                <span>View Warden Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                🏛️
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-2">Platform Admin Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                College registration verification, accreditation document review, approval/rejection notes, platform-wide multi-college metrics, and security audit log monitor.
              </p>
              <Link to="/login" className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                <span>View Admin Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>HostelHub Systems</span>
          </div>
          <div>
            Built with React 18, TypeScript, Tailwind CSS, Express, and PostgreSQL.
          </div>
          <div className="flex space-x-4">
            <Link to="/colleges" className="hover:text-white transition">Colleges Directory</Link>
            <Link to="/verify-pass" className="hover:text-white transition">Gate Scanner</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
