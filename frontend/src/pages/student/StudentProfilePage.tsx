import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { User, Phone, Mail, Award, BookOpen, AlertCircle, CheckCircle2, Save } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState<string>(
    user?.studentProfile?.emergencyContact || ''
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const res = await apiRequest('/students/profile', {
        method: 'PUT',
        body: JSON.stringify({ phone, emergencyContact }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Contact information updated successfully.' });
        refreshUser();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Student Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View official institutional records and update permitted contact details.
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

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-black text-2xl flex items-center justify-center border-2 border-brand-200 shadow-xs">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Approved Residential Student
            </span>
          </div>
        </div>

        {/* Read-Only Academic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Roll / Enrollment Number
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {user?.studentProfile?.rollNumber || 'AIT-2023-CS-042'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Degree & Major
            </span>
            <span className="text-xs font-bold text-slate-800">
              {user?.studentProfile?.course || 'B.Tech CSE'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Hostel Facility
            </span>
            <span className="text-xs font-bold text-slate-800">
              {user?.hostel?.name || 'Cauvery Boys Hostel'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Academic Institution
            </span>
            <span className="text-xs font-bold text-slate-800">
              {user?.college?.name || 'Apex Institute of Technology'}
            </span>
          </div>
        </div>

        {/* Editable Contact Form */}
        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Update Permitted Contact Fields
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Mobile Number *
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent / Guardian Emergency Contact Details *
            </label>
            <input
              required
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Contact Details'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
