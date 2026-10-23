import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { BookOpen, ShieldAlert, AlertCircle, Info } from 'lucide-react';

export const StudentRulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/facilities/rules');
      if (res.success) {
        setRules(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hostel Code of Conduct & Bylaws
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official hostel regulations, curfew gate timings, and standard penalty schedules.
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {rule.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Version {rule.version}.0</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{rule.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{rule.description}</p>
            </div>

            {rule.penaltyDetails && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700">
                    Disciplinary Penalty & Fines
                  </span>
                  <span>{rule.penaltyDetails}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
