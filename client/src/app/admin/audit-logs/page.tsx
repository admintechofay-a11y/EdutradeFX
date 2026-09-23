'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getAuditLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-primary">
            Compliance Audit & Activity Ledger
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Immutable chronological record of all administrative approvals, suspensions, listing modifications, and payout authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-text-primary font-medium focus:outline-none focus:border-gold-primary"
          >
            <option value="all">All Actions</option>
            <option value="approve">Approvals Only</option>
            <option value="reject">Rejections Only</option>
            <option value="suspend">Suspensions Only</option>
            <option value="activate">Activations Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Recorded Audit Trail ({filteredLogs.length} Entries)
          </span>
          <span className="text-[11px] text-text-secondary font-mono">
            Audit Level: SEC/FCA Institutional Standards
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary text-sm">
            Querying cryptographic audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-text-secondary text-xs">
            No audit records match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredLogs.map((log, index) => {
              const action = log.action || 'edit';
              return (
                <div key={log._id || index} className="p-4 hover:bg-slate-50/80 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                          action === 'approve'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : action === 'reject'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : action === 'suspend'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {action === 'approve' && <CheckCircle2 className="w-3 h-3" />}
                        {action === 'reject' && <XCircle className="w-3 h-3" />}
                        {action === 'suspend' && <AlertCircle className="w-3 h-3" />}
                        {action.toUpperCase()}
                      </span>

                      <span className="text-xs font-bold text-text-primary">
                        [{log.module?.toUpperCase()}] {log.targetName || log.targetId}
                      </span>
                    </div>

                    <div className="text-[11px] text-text-secondary flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gold-primary" />
                        {log.adminName || log.adminEmail || 'Platform Administrator'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {log.details && (
                    <div className="text-xs text-text-secondary bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] font-sans">
                      {log.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
