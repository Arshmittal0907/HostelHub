import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { History, Shield, Clock } from 'lucide-react';

export const WardenAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAudit();
  }, []);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('/audit');
      if (res.success) {
        setLogs(res.data);
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
          Hostel Administrative Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event ledger recording approvals, bed allocations, financial charges, and status updates.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{log.entityType}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.actor?.fullName}</div>
                      <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {log.details || '—'}
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
