import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Utensils, Save, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const WardenMessPage: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<string>('BREAKFAST');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('09:30');
  const [title, setTitle] = useState<string>('');
  const [items, setItems] = useState<string>('');
  const [isSpecial, setIsSpecial] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    // Populate form when day or meal changes
    const existing = menus.find(
      (m) => m.dayOfWeek.toLowerCase() === selectedDay.toLowerCase() && m.mealType === selectedMeal
    );
    if (existing) {
      setTitle(existing.title);
      setItems(existing.items);
      setStartTime(existing.startTime);
      setEndTime(existing.endTime);
      setIsSpecial(existing.isSpecial);
    } else {
      setTitle(`${selectedDay} ${selectedMeal.toLowerCase()}`);
      setItems('');
      setIsSpecial(false);
    }
  }, [selectedDay, selectedMeal, menus]);

  const fetchMenus = async () => {
    try {
      const res = await apiRequest('/mess/menu');
      if (res.success) {
        setMenus(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');

    try {
      const res = await apiRequest('/mess/menu', {
        method: 'POST',
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          mealType: selectedMeal,
          startTime,
          endTime,
          title,
          items,
          isSpecial,
        }),
      });

      if (res.success) {
        setMsg(`Saved ${selectedDay} ${selectedMeal} menu successfully.`);
        fetchMenus();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to save menu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Mess Menu Publisher & Catering Manager
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure daily breakfast, lunch, high-tea, and dinner menus for the assigned hostel.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Day & Meal Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Day *</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Meal Type *</label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {meals.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serving Start Time *</label>
              <input
                required
                type="text"
                placeholder="07:30"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serving End Time *</label>
              <input
                required
                type="text"
                placeholder="09:30"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Title / Theme *</label>
            <input
              required
              type="text"
              placeholder="e.g. South Indian Combo with Filter Coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food Items (comma separated or description) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Idli, Medu Vada, Coconut Chutney, Sambar, Boiled Eggs / Banana, Tea & Coffee"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSpecial"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isSpecial" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as Special Feast / Festival Meal
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Menu'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
