import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  MessageSquareWarning,
  Plus,
  Clock,
  Send,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  MessageCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [newMsg, setNewMsg] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [form, setForm] = useState({
    category: 'ELECTRICAL',
    title: '',
    description: '',
    urgency: 'MEDIUM',
  });

  const categories = [
    'PLUMBING',
    'ELECTRICAL',
    'FURNITURE',
    'CLEANLINESS',
    'INTERNET',
    'FOOD',
    'NOISE',
    'OTHER',
  ];

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

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.success) {
        setIsCreating(false);
        setForm({ category: 'ELECTRICAL', title: '', description: '', urgency: 'MEDIUM' });
        fetchComplaints();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit complaint.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeTicket) return;
    setIsSending(true);

    try {
      const res = await apiRequest(`/complaints/${activeTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMsg }),
      });

      if (res.success) {
        setNewMsg('');
        fetchTicketDetails(activeTicket.id);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReopen = async () => {
    if (!activeTicket) return;
    const reason = prompt('Please enter reason for reopening this ticket:');
    if (!reason) return;

    try {
      const res = await apiRequest(`/complaints/${activeTicket.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'REOPENED', notes: reason }),
      });

      if (res.success) {
        fetchComplaints();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to reopen ticket.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complaint Center & SLA Resolution
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Report hostel repairs, facility issues, and communicate directly with your Warden.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Complaint</span>
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List (Left, 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            My Submitted Tickets ({complaints.length})
          </div>

          {complaints.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No complaints submitted yet. Everything in order!
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {complaints.map((c) => {
                const isSelected = activeTicket?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => fetchTicketDetails(c.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-brand-50/70 border-brand-300 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {c.ticketNumber}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mb-1">{c.title}</h4>

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
          )}
        </div>

        {/* Ticket Detail & Chat Drawer (Right, 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col min-h-[500px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {activeTicket.ticketNumber}
                      </span>
                      <StatusBadge status={activeTicket.status} />
                      <span className="text-xs font-semibold text-slate-500">
                        Urgency: {activeTicket.urgency}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{activeTicket.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {activeTicket.description}
                    </p>
                  </div>

                  {(activeTicket.status === 'RESOLVED' || activeTicket.status === 'CLOSED') && (
                    <button
                      onClick={handleReopen}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center space-x-1 shrink-0 border border-amber-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen</span>
                    </button>
                  )}
                </div>

                {/* SLA Deadline Tracker */}
                <div className="py-3 px-4 bg-slate-50 rounded-xl my-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Target Resolution Deadline:</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {new Date(activeTicket.slaDeadline).toLocaleString()}
                  </span>
                </div>

                {/* Conversation Thread */}
                <div className="my-4 space-y-3 max-h-72 overflow-y-auto pr-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Communication Thread with Warden
                  </div>

                  {activeTicket.messages?.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No replies exchanged yet. Warden has been notified.
                    </div>
                  ) : (
                    activeTicket.messages?.map((m: any) => {
                      const isMe = m.sender.role === 'STUDENT';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-brand-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                            }`}
                          >
                            <span className="font-bold block text-[10px] opacity-80 mb-0.5">
                              {m.sender.fullName} ({m.sender.role})
                            </span>
                            {m.message}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message Reply Input */}
              <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a reply to Warden..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMsg.trim()}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400 my-auto">
              Select a ticket from the left to view message history and updates.
            </div>
          )}
        </div>
      </div>

      {/* New Complaint Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Submit Hostel Maintenance Ticket</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency *</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="LOW">LOW (72h SLA)</option>
                    <option value="MEDIUM">MEDIUM (48h SLA)</option>
                    <option value="HIGH">HIGH (24h SLA)</option>
                    <option value="EMERGENCY">EMERGENCY (6h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Subject / Summary *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Geyser in Room 101 not heating water"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify location, exact symptoms, and any preliminary observations..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  Generate Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
