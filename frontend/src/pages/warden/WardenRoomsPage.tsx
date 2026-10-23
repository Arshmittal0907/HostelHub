import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Bed,
  Plus,
  ArrowRightLeft,
  LogOut,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const WardenRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [unallocatedStudents, setUnallocatedStudents] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [availableFilter, setAvailableFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [allocatingBed, setAllocatingBed] = useState<any | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [transferringAlloc, setTransferringAlloc] = useState<any | null>(null);
  const [targetBedId, setTargetBedId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchUnallocatedStudents();
  }, [availableFilter]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const url = availableFilter ? '/rooms?availableOnly=true' : '/rooms';
      const res = await apiRequest(url);
      if (res.success) {
        setRooms(res.data);

        // Collect all available beds for transfer target
        const av: any[] = [];
        res.data.forEach((r: any) => {
          r.beds.forEach((b: any) => {
            if (b.status === 'AVAILABLE') {
              av.push({ ...b, roomNumber: r.roomNumber });
            }
          });
        });
        setAvailableBeds(av);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnallocatedStudents = async () => {
    try {
      const res = await apiRequest('/students?status=APPROVED');
      if (res.success) {
        const unalloc = res.data.filter((s: any) => !s.allocation);
        setUnallocatedStudents(unalloc);
        if (unalloc.length > 0) setSelectedStudentId(unalloc[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingBed || !selectedStudentId) return;
    setIsProcessing(true);
    setMsg(null);

    try {
      const res = await apiRequest('/rooms/allocate', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          bedId: allocatingBed.id,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Bed allocated successfully.' });
        setAllocatingBed(null);
        fetchRooms();
        fetchUnallocatedStudents();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Allocation failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringAlloc || !targetBedId) return;
    setIsProcessing(true);
    setMsg(null);

    try {
      const res = await apiRequest('/rooms/transfer', {
        method: 'POST',
        body: JSON.stringify({
          studentId: transferringAlloc.studentId,
          targetBedId,
        }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Room transferred successfully.' });
        setTransferringAlloc(null);
        fetchRooms();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Transfer failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async (studentId: string, bedNumber: string) => {
    if (!confirm(`Are you sure you want to check out student from Bed ${bedNumber}?`)) return;

    try {
      const res = await apiRequest('/rooms/checkout', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Checkout recorded successfully.' });
        fetchRooms();
        fetchUnallocatedStudents();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Checkout failed.' });
    }
  };

  const handleToggleMaintenance = async (bedId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';

    try {
      const res = await apiRequest(`/rooms/beds/${bedId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Status update succeeded.' });
        fetchRooms();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Status update failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Rooms & Bed Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage rooms, beds, occupancy, atomic allocations, transfers, and maintenance.
          </p>
        </div>

        <button
          onClick={() => setAvailableFilter(!availableFilter)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
            availableFilter
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{availableFilter ? 'Showing Available Beds Only' : 'Show All Rooms'}</span>
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

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Room {room.roomNumber}</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {room.block?.name} • Floor {room.floor}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                  {room.roomType}
                </span>
              </div>

              {/* Beds list */}
              <div className="space-y-3">
                {room.beds.map((bed: any) => {
                  const activeAlloc = bed.allocations?.[0];
                  return (
                    <div
                      key={bed.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          Bed {bed.bedNumber}
                        </span>
                        <StatusBadge status={bed.status} />
                      </div>

                      {bed.status === 'OCCUPIED' && activeAlloc && (
                        <div className="text-xs text-slate-700">
                          <span className="font-bold block text-brand-900">
                            {activeAlloc.student?.user?.fullName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Roll: {activeAlloc.student?.rollNumber}
                          </span>

                          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => setTransferringAlloc(activeAlloc)}
                              className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => handleCheckout(activeAlloc.studentId, bed.bedNumber)}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Checkout</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {bed.status === 'AVAILABLE' && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Vacant Bed
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setAllocatingBed({ ...bed, roomNumber: room.roomNumber })}
                              className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] shadow-xs"
                            >
                              Allocate
                            </button>
                            <button
                              onClick={() => handleToggleMaintenance(bed.id, bed.status)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded"
                              title="Set Maintenance"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {bed.status === 'MAINTENANCE' && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-amber-700 font-medium">Under repair</span>
                          <button
                            onClick={() => handleToggleMaintenance(bed.id, bed.status)}
                            className="text-[11px] font-bold text-brand-600 hover:underline"
                          >
                            Mark Available
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocate Bed Modal */}
      {allocatingBed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Allocate Bed {allocatingBed.bedNumber} (Room {allocatingBed.roomNumber})
              </h3>
              <button
                onClick={() => setAllocatingBed(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unallocatedStudents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No unallocated students found. Approve pending student applications first.
              </div>
            ) : (
              <form onSubmit={handleAllocate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Approved Student *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {unallocatedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.rollNumber}) — {s.course}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAllocatingBed(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
                  >
                    {isProcessing ? 'Allocating...' : 'Confirm Allocation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Transfer Bed Modal */}
      {transferringAlloc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Transfer Student Bed</h3>
              <button
                onClick={() => setTransferringAlloc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                <span className="font-bold block">Current Allocation:</span>
                <span>
                  {transferringAlloc.student?.user?.fullName} ({transferringAlloc.student?.rollNumber})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Target Vacant Bed *
                </label>
                <select
                  required
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Vacant Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Room {b.roomNumber} — Bed {b.bedNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferringAlloc(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !targetBedId}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isProcessing ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
