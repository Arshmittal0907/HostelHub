import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { History, Shield, Filter, Search, Building2, User, RefreshCw, Eye } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

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
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = Array.from(new Set(logs.map((l) => l.action)));
  const entities = Array.from(new Set(logs.map((l) => l.entityType)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search === '' ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      log.college?.name?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Audit & Compliance Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global immutable audit registry tracking tenant governance, approvals, room reallocations, and security events.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Events</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{logs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distinct Action Types</div>
          <div className="text-2xl font-extrabold text-brand-600 mt-1">{actions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monitored Entities</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{entities.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform Status</div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Tamper-Proof
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor name, college, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Actions</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Entities</option>
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading platform audit registry...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No audit records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC/IST)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Tenant College</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{log.entityType}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.actor?.fullName || 'System Event'}</div>
                      <div className="text-[10px] text-slate-400">{log.actorRole || 'SYSTEM'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.college?.name ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.college.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Platform Level</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {log.details || 'â€”'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Raw Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit Record Inspector</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                âœ•
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Action</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Entity Type / ID</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.entityType} ({selectedLog.entityId || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Actor</span>
                <span className="text-slate-800 font-medium">
                  {selectedLog.actor?.fullName} ({selectedLog.actorRole})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">College Scope</span>
                <span className="text-slate-800 font-medium">{selectedLog.college?.name || 'Platform'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="font-mono text-slate-700">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">IP Address</span>
                <span className="font-mono text-slate-700">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Details / Payload</span>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                {selectedLog.details || 'No additional details captured.'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
