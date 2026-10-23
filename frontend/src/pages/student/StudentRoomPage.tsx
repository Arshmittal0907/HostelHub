import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Bed, Users, Building, ShieldCheck, Mail, Phone, Calendar, Info } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentRoomPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/rooms/my-room');
      if (res.success && res.allocated) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading room allocation...</div>;
  }

  if (!data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
        <Bed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">No Active Room Allocation</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your student registration has been registered, but a room and bed number have not yet been assigned by your assigned Hostel Warden. Please contact your Warden office.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Hostel & Allocated Room
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official residential accommodation details and permitted roommates.
        </p>
      </div>

      {/* Main Room Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-black text-xl border border-brand-200/60 shadow-xs">
              {data.roomNumber}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">Room {data.roomNumber}</h2>
                <StatusBadge status="ACTIVE" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {data.blockName} • Floor {data.floor} • {data.roomType} Room
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center space-x-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Bed
              </span>
              <span className="text-sm font-black text-brand-700 font-mono">
                Bed {data.bedNumber}
              </span>
            </div>
            <Bed className="w-5 h-5 text-brand-600" />
          </div>
        </div>

        {/* Hostel Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Educational Institution
            </span>
            <span className="text-xs font-bold text-slate-800">{data.collegeName}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Hostel Facility
            </span>
            <span className="text-xs font-bold text-slate-800">
              {data.hostelName} ({data.hostelType} Hostel)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Allocation Date
            </span>
            <span className="text-xs font-bold text-slate-800">
              {new Date(data.allocatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Roommates Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">
            Permitted Roommates in Room {data.roomNumber} ({data.roommates?.length || 0})
          </h2>
        </div>

        {data.roommates?.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            No other roommates are currently allocated to Room {data.roomNumber}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.roommates.map((mate: any, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
                      {mate.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{mate.fullName}</h3>
                      <p className="text-[11px] text-slate-500">
                        {mate.course} • Year {mate.year}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    Bed {mate.bedNumber}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mate.email}</span>
                  </div>
                  {mate.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
