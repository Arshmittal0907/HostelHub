import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Coffee, Dumbbell, Trophy, Clock, User, Phone, MapPin } from 'lucide-react';

export const StudentFacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CAFETERIA' | 'GYM' | 'SPORTS_COMPLEX'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/facilities');
      if (res.success) {
        setFacilities(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = activeTab === 'ALL' ? facilities : facilities.filter((f) => f.type === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Facilities</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cafeteria menu, Fitness & Gym center trainers, and Indoor/Outdoor sports arenas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'ALL', label: 'All Facilities' },
          { key: 'CAFETERIA', label: 'Cafeteria & Snacks' },
          { key: 'GYM', label: 'Gym & Fitness' },
          { key: 'SPORTS_COMPLEX', label: 'Sports Arenas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Facility Grid */}
      <div className="space-y-6">
        {filtered.map((fac) => (
          <div key={fac.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  {fac.type === 'CAFETERIA' && <Coffee className="w-5 h-5 text-amber-600" />}
                  {fac.type === 'GYM' && <Dumbbell className="w-5 h-5 text-blue-600" />}
                  {fac.type === 'SPORTS_COMPLEX' && <Trophy className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{fac.name}</h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fac.location} • Capacity: {fac.capacity} people</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {fac.hours?.map((h: any) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{h.dayOfWeek}: {h.openTime} - {h.closeTime}</span>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">{fac.description}</p>

            {/* Cafeteria Menu Items */}
            {fac.type === 'CAFETERIA' && fac.menuItems?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Food & Beverage Menu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {fac.menuItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>
                      <span className="font-bold text-brand-700 text-xs">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gym Staff Bio */}
            {fac.type === 'GYM' && fac.staff?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Certified Trainers & Instructors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fac.staff.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                        <p className="text-[11px] text-slate-500">{s.role} • {s.specialization}</p>
                        <span className="text-[10px] text-brand-600 font-medium block mt-0.5">
                          Timing: {s.timing}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
