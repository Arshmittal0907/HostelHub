import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Megaphone, Plus, Save, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenNoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [priority, setPriority] = useState<string>('NORMAL');
  const [targetAudience, setTargetAudience] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/notices');
      if (res.success) {
        setNotices(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          priority,
          targetAudience,
        }),
      });

      if (res.success) {
        setMsg('Notice published successfully.');
        setIsCreating(false);
        setTitle('');
        setContent('');
        fetchNotices();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to publish notice.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notices & Official Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast emergency alerts, maintenance schedules, and holiday announcements.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target: {n.targetAudience}
                </span>
                <StatusBadge status={n.priority} />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{n.content}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Published by {n.publishedBy?.fullName || 'Warden'}</span>
              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Publish Hostel Announcement</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH (Alert)</option>
                    <option value="URGENT">URGENT (Critical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="ALL">All Residents</option>
                    <option value="STUDENTS_ONLY">Students Only</option>
                    <option value="SPECIFIC_HOSTEL">Current Hostel Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mandatory Fire Drill Scheduled for Tuesday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="State details, procedures, instructions, and dates..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
