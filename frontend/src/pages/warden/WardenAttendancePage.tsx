import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { CalendarCheck, Plus, CheckCircle2, AlertCircle, Edit2, X, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenAttendancePage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [allocatedStudents, setAllocatedStudents] = useState<any[]>([]);
  const [isConducting, setIsConducting] = useState<boolean>(false);
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionType, setSessionType] = useState<string>('NIGHT');
  const [studentMarks, setStudentMarks] = useState<Record<string, string>>({});

  // Correction state
  const [correctingRecord, setCorrectingRecord] = useState<any | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<string>('PRESENT');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchAllocatedStudents();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/attendance/sessions');
      if (res.success) {
        setSessions(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllocatedStudents = async () => {
    try {
      const res = await apiRequest('/students?status=APPROVED');
      if (res.success) {
        // Students with active bed allocation
        const withBed = res.data.filter((s: any) => s.allocation);
        setAllocatedStudents(withBed);

        // Pre-mark all as PRESENT by default
        const initialMarks: Record<string, string> = {};
        withBed.forEach((s: any) => {
          initialMarks[s.id] = 'PRESENT';
        });
        setStudentMarks(initialMarks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    try {
      const records = Object.entries(studentMarks).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await apiRequest('/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify({
          hostelId: allocatedStudents[0]?.hostelId, // backend auto-injects if missing
          date: sessionDate,
          sessionType,
          records,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Attendance session recorded successfully.' });
        setIsConducting(false);
        fetchSessions();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit session.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrectRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingRecord) return;
    setIsSubmitting(true);

    try {
      const res = await apiRequest(`/attendance/records/${correctingRecord.id}/correct`, {
        method: 'PUT',
        body: JSON.stringify({
          status: correctionStatus,
          correctionReason,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Attendance record corrected successfully.' });
        setCorrectingRecord(null);
        setCorrectionReason('');
        fetchSessions();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Correction failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Sessions & Roll Call
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct nightly roll call, monitor unexcused absences, and audit corrections.
          </p>
        </div>

        <button
          onClick={() => setIsConducting(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct Attendance Session</span>
        </button>
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

      {/* Past Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Session: {new Date(session.date).toLocaleDateString()} ({session.sessionType})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Conducted by {session.conductedBy?.fullName || 'Warden'} •{' '}
                    {session.records?.length || 0} Students Tracked
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                {session.records?.filter((r: any) => r.status === 'PRESENT').length} Present •{' '}
                {session.records?.filter((r: any) => r.status === 'ABSENT').length} Absent
              </span>
            </div>

            {/* Students mini table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Remarks / Correction</th>
                    <th className="py-2 px-3 text-right">Correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {session.records?.map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {rec.student?.user?.fullName} ({rec.student?.rollNumber})
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {rec.remarks || '—'}
                        {rec.correctionReason && (
                          <span className="block text-[10px] text-purple-600 font-medium">
                            Corrected: {rec.correctionReason}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setCorrectingRecord(rec);
                            setCorrectionStatus(rec.status);
                          }}
                          className="p-1 text-slate-400 hover:text-brand-600 rounded transition"
                          title="Correct Attendance Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Conduct Session Modal */}
      {isConducting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-xl border border-slate-200 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-base">Conduct Roll Call Session</h3>
                <button
                  onClick={() => setIsConducting(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date *</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type *</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="MORNING">Morning Session</option>
                    <option value="EVENING">Evening Session</option>
                    <option value="NIGHT">Night Curfew Roll Call</option>
                  </select>
                </div>
              </div>

              {/* Student marking list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-2 border-y border-slate-100">
                {allocatedStudents.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{s.fullName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Room {s.allocation?.roomNumber} ({s.allocation?.bedNumber}) • {s.rollNumber}
                      </span>
                    </div>

                    <div className="flex space-x-1.5">
                      {['PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStudentMarks({ ...studentMarks, [s.id]: st })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            studentMarks[s.id] === st
                              ? st === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : st === 'LATE'
                                ? 'bg-amber-600 text-white'
                                : st === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsConducting(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitSession}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
              >
                {isSubmitting ? 'Recording Roll Call...' : 'Save Attendance Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correct Record Modal */}
      {correctingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Correct Attendance Record</h3>
              <button
                onClick={() => setCorrectingRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCorrectRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Status *
                </label>
                <select
                  value={correctionStatus}
                  onChange={(e) => setCorrectionStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reason for Correction *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Student provided valid library log or medical slip"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectingRecord(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !correctionReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
