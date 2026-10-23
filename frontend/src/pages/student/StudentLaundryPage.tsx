import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Shirt, Calendar, Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentLaundryPage: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadLaundryData();
  }, []);

  const loadLaundryData = async () => {
    setIsLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        apiRequest('/laundry/slots'),
        apiRequest('/laundry/my-bookings'),
      ]);

      if (sRes.success) {
        setSlots(sRes.data);
        if (sRes.data.length > 0) setSelectedSlotId(sRes.data[0].id);
      }
      if (bRes.success) setMyBookings(bRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setMsg(null);

    try {
      const res = await apiRequest('/laundry/book', {
        method: 'POST',
        body: JSON.stringify({ slotId: selectedSlotId, bookingDate }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Laundry slot booked successfully!' });
        loadLaundryData();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to book slot.' });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Laundry Scheduling & Bookings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reserve washing slots and track laundry collection & return status.
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

      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Book a Laundry Slot</h2>

        <form onSubmit={handleBookSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Weekly Slot *
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.dayOfWeek} ({s.startTime} - {s.endTime}) [Max: {s.maxCapacity} students]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Booking Date *
            </label>
            <input
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isBooking || !selectedSlotId}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isBooking ? 'Reserving...' : 'Confirm Slot Reservation'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Booking History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">My Laundry History</h2>

        {myBookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            You have no active or previous laundry bookings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day & Slot Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Booked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {b.slot.dayOfWeek} ({b.slot.startTime} - {b.slot.endTime})
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
