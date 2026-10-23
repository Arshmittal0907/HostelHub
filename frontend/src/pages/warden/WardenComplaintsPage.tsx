import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  MessageSquareWarning,
  Clock,
  Send,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [newMsg, setNewMsg] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/complaints');
      if (res.success) {
        setComplaints(res.data);
        if (activeTicket) {
          fetchTicketDetails(activeTicket.id);
        } else if (res.data.length > 0) {
          fetchTicketDetails(res.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await apiRequest(`/complaints/${id}`);
      if (res.success) {
        setActiveTicket(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeTicket) return;
    setIsSending(true);

    try {
      const res = await apiRequest(`/complaints/${activeTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: newMsg,
          isInternalNote,
        }),
      });

      if (res.success) {
        setNewMsg('');
        setIsInternalNote(false);
        fetchTicketDetails(activeTicket.id);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to post message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicket) return;
    const notes = prompt(`Enter notes for changing status to ${newStatus}:`) || `Status changed to ${newStatus}`;

    try {
      const res = await apiRequest(`/complaints/${activeTicket.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (res.success) {
        fetchComplaints();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hostel Complaint Management & SLA Resolution Desk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Triage repair requests, post internal staff notes or student responses, and track SLAs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hostel Complaint Queue ({complaints.length})
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto">
            {complaints.map((c) => {
              const isSelected = activeTicket?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => fetchTicketDetails(c.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {c.ticketNumber}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate mb-1">{c.title}</h4>

                  <div className="text-[11px] text-slate-600 mb-2">
                    {c.student?.user?.fullName} (Room {c.student?.allocations?.[0]?.room?.roomNumber || '—'})
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{c.category} • Urgency: {c.urgency}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {c.isOverdue && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      ⚠️ Resolution SLA Overdue
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Details & Chat (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col min-h-[550px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {activeTicket.ticketNumber}
                      </span>
                      <StatusBadge status={activeTicket.status} />
                      <span className="text-xs font-bold text-slate-600">
                        Urgency: {activeTicket.urgency}
                      </span>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {activeTicket.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleStatusChange('ACKNOWLEDGED')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(activeTicket.status === 'SUBMITTED' || activeTicket.status === 'ACKNOWLEDGED' || activeTicket.status === 'REOPENED') && (
                        <button
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg border border-blue-200"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {activeTicket.status !== 'RESOLVED' && activeTicket.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleStatusChange('RESOLVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs"
                        >
                          Resolve Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">{activeTicket.title}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeTicket.description}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-400">
                    Raised by: <span className="font-semibold text-slate-700">{activeTicket.student?.user?.fullName}</span>{' '}
                    (Roll: {activeTicket.student?.rollNumber}, Room: {activeTicket.student?.allocations?.[0]?.room?.roomNumber || 'N/A'})
                  </div>
                </div>

                {/* Messages & Internal Notes Thread */}
                <div className="my-4 space-y-3 max-h-72 overflow-y-auto pr-2">
                  {activeTicket.messages?.map((m: any) => {
                    const isInternal = m.isInternalNote;
                    const isWarden = m.sender?.role === 'WARDEN';

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                          isInternal
                            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                            : isWarden
                            ? 'bg-teal-50 border-teal-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px] mb-1 opacity-80">
                          <span className="flex items-center space-x-1">
                            {isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                            <span>
                              {m.sender?.fullName} ({m.sender?.role}) {isInternal ? '— [INTERNAL NOTE]' : ''}
                            </span>
                          </span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {m.message}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Response Form with Internal Note Toggle */}
              <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-1.5 font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span className={isInternalNote ? 'text-amber-800 font-bold' : ''}>
                      Private Internal Note (Hidden from Student)
                    </span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      isInternalNote
                        ? 'Type internal note for staff/records...'
                        : 'Reply to student resident...'
                    }
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMsg.trim()}
                    className={`px-4 py-2.5 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 ${
                      isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Add Note' : 'Send'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400 my-auto">
              Select a ticket from the left to review details and post responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
