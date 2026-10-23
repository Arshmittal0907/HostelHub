import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Shirt, Sparkles, Check, AlertTriangle, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenServicesPage: React.FC = () => {
  const [laundryBookings, setLaundryBookings] = useState<any[]>([]);
  const [cleaningSchedule, setCleaningSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    setIsLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([
        apiRequest('/laundry/all-bookings'),
        apiRequest('/cleaning/schedule'),
      ]);

      if (lRes.success) setLaundryBookings(lRes.data);
      if (cRes.success) setCleaningSchedule(cRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLaundry = async (id: string, status: string) => {
    try {
      const res = await apiRequest(`/laundry/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.success) fetchServicesData();
    } catch (e: any) {
      alert(e.message || 'Failed to update laundry status.');
    }
  };

  const handleCompleteCleaning = async (assignmentId: string) => {
    try {
      const res = await apiRequest(`/cleaning/assignments/${assignmentId}/complete`, {
        method: 'PUT',
      });
      if (res.success) fetchServicesData();
    } catch (e: any) {
      alert(e.message || 'Failed to update cleaning task.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Laundry & Housekeeping Operations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor washing reservations and resolve missed room cleaning reports.
        </p>
      </div>

      {/* Laundry Bookings Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Shirt className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">
            Student Laundry Drop-Offs & Pickups ({laundryBookings.length})
          </h2>
        </div>

        {laundryBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No laundry reservations booked for this week.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Booking Date & Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {laundryBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {b.student?.user?.fullName} ({b.student?.rollNumber})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(b.bookingDate).toLocaleDateString()} • {b.slot?.dayOfWeek} ({b.slot?.startTime} - {b.slot?.endTime})
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {b.status === 'BOOKED' && (
                        <button
                          onClick={() => handleUpdateLaundry(b.id, 'COLLECTED')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] border border-blue-200 transition"
                        >
                          Mark Collected
                        </button>
                      )}
                      {b.status === 'COLLECTED' && (
                        <button
                          onClick={() => handleUpdateLaundry(b.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200 transition"
                        >
                          Ready / Completed
                        </button>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="text-[11px] text-slate-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Housekeeping Tasks & Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">
            Housekeeping Tasks & Student Missed Cleaning Logs
          </h2>
        </div>

        <div className="space-y-4">
          {cleaningSchedule.map((task) => (
            <div key={task.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-xs">{task.title}</span>
                <span className="text-[11px] text-slate-500 font-medium">{task.scheduledTime}</span>
              </div>

              {/* Assignments / Reports */}
              <div className="space-y-2 mt-3">
                {task.assignments?.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">
                          {a.room ? `Room ${a.room.roomNumber}` : 'Common Area'}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.missedReason && (
                        <p className="text-rose-600 text-[11px] font-medium mt-1">
                          Student Reported: "{a.missedReason}"
                        </p>
                      )}
                    </div>

                    {a.status === 'MISSED' && (
                      <button
                        onClick={() => handleCompleteCleaning(a.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                      >
                        Dispatch & Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
