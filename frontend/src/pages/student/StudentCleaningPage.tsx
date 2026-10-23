import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Sparkles, Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentCleaningPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [missedReason, setMissedReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCleaningSchedule();
  }, []);

  const fetchCleaningSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/cleaning/schedule');
      if (res.success) {
        setTasks(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportMissed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    try {
      const res = await apiRequest('/cleaning/report-missed', {
        method: 'POST',
        body: JSON.stringify({ missedReason }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Report submitted to Warden office.' });
        setMissedReason('');
        fetchCleaningSchedule();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit report.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Housekeeping & Cleaning Schedules
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Daily room sweeping, washroom sanitation timetable, and missed cleaning escalation.
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

      {/* Routine Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  {task.areaType}
                </span>
                <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.scheduledTime}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{task.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{task.description}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Frequency: {task.frequency}</span>
              <span className="font-semibold text-emerald-600">Daily Housekeeping</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Missed Cleaning */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Report Missed Cleaning</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 max-w-xl">
          If housekeeping staff missed sweeping or mopping your allocated room today, report it here. The Warden office will dispatch priority sanitization.
        </p>

        <form onSubmit={handleReportMissed} className="space-y-3">
          <textarea
            required
            rows={2}
            placeholder="Describe the issue (e.g. Room floor was not swept or mopped during morning slot, waste bin full)..."
            value={missedReason}
            onChange={(e) => setMissedReason(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting || !missedReason.trim()}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
          >
            {isSubmitting ? 'Reporting...' : 'Submit Missed Cleaning Report'}
          </button>
        </form>
      </div>
    </div>
  );
};
