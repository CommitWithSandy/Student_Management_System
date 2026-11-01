import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, Search, Calendar, User, Activity } from 'lucide-react';

interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  entityName: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', { params: { page: 0, size: 50 } });
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      l.entityName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="text-indigo-600" size={28} />
            Institutional Audit & Security Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Immutable audit trail of authentication events, CRUD operations, grading, and security transactions.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by action, user email, or entity name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading audit trail...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-800">No Audit Events Logged</h3>
            <p className="text-slate-500 text-sm mt-1">Security and operational activities will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Action Performed</th>
                  <th className="py-4 px-6">Target Entity</th>
                  <th className="py-4 px-6">Entity ID</th>
                  <th className="py-4 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {log.userEmail || 'System / Anonymous'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 font-semibold">{log.entityName}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-500">{log.entityId || '-'}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
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
