import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Utensils, Clock, Sparkles, AlertCircle } from 'lucide-react';

export const StudentMessPage: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/mess/menu');
      if (res.success) {
        setMenus(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const dayMenus = menus.filter((m) => m.dayOfWeek.toLowerCase() === selectedDay.toLowerCase());

  const mealOrder = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  const sortedDayMenus = dayMenus.sort((a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Mess Menu</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekly catering schedule, meal timings, and dietary plans.
        </p>
      </div>

      {/* Day Selector Pills */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meals Grid */}
      {sortedDayMenus.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No meal schedule published for {selectedDay}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedDayMenus.map((meal) => {
            let badgeBg = 'bg-amber-100 text-amber-800';
            if (meal.mealType === 'LUNCH') badgeBg = 'bg-emerald-100 text-emerald-800';
            if (meal.mealType === 'SNACKS') badgeBg = 'bg-purple-100 text-purple-800';
            if (meal.mealType === 'DINNER') badgeBg = 'bg-blue-100 text-blue-800';

            return (
              <div
                key={meal.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
                      {meal.mealType}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meal.startTime} - {meal.endTime}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{meal.title}</h3>
                  {meal.description && (
                    <p className="text-xs text-slate-500 mb-3">{meal.description}</p>
                  )}

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                    {meal.items}
                  </div>
                </div>

                {meal.isSpecial && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs font-semibold text-amber-600">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Special Weekend Feast</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
