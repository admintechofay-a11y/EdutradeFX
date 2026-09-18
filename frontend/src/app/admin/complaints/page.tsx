'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle, AlertTriangle, Clock, X, Send } from 'lucide-react';
import { api } from '../../../lib/api';
import { Complaint, ComplaintStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function AdminComplaintsDeskPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('RESOLVED');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await api.patch(`/complaints/${selectedTicket.id}/status`, {
        status: newStatus,
        adminNotes: resolutionNote,
      });
      setSelectedTicket(null);
      setResolutionNote('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update dispute ticket.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Trader Complaints & Dispute Desk</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Mediate retail Forex disputes, investigation of slippage/withdrawal delays, and platform fraud prevention.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : complaints.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Dispute Title</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="font-bold text-white">{c.title}</div>
                    <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">{c.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                      {c.targetType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : c.status === 'OPEN'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-amber-500/15 text-brand-amber'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTicket(c);
                        setNewStatus(c.status);
                        setResolutionNote(c.adminNotes || '');
                      }}
                      className="px-3.5 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Review & Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Active Trader Disputes"
          description="All broker and signal complaints have been resolved or investigated."
        />
      )}

      {/* Review Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-bold">
                Target: {selectedTicket.targetType}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedTicket.title}</h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              {selectedTicket.description}
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="OPEN">Open (Under Review)</option>
                  <option value="IN_REVIEW">In Review (Contacting Broker)</option>
                  <option value="RESOLVED">Resolved (Funds Released / Solved)</option>
                  <option value="CLOSED">Closed (Unsubstantiated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Administrative Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record verification with regulatory registries or broker compliance desk..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
              >
                {updating ? 'Saving...' : 'Save Resolution'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
