'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle, AlertTriangle, Clock, X, Send } from 'lucide-react';
import { api } from '../../../lib/api';
import { Complaint, ComplaintStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { Modal } from '@/components/ui/Modal';

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
        <h1 className="text-2xl sm:text-3xl font-black text-navy">Trader Complaints & Dispute Desk</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Mediate retail Forex disputes, investigation of slippage/withdrawal delays, and platform fraud prevention.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : complaints.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Dispute Title</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-surface-tint/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-navy">{c.title}</div>
                    <div className="text-text-muted text-xs line-clamp-1 mt-0.5">{c.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-tint border border-border text-text-body text-xs font-semibold">
                      {c.targetType}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'RESOLVED'
                          ? 'bg-green/10 text-green'
                          : c.status === 'OPEN'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-orange/10 text-orange'
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
                      className="px-4 py-1.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
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
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={
          selectedTicket ? (
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-tint border border-border text-text-muted text-xs font-bold inline-block mb-1">
                Target: {selectedTicket.targetType}
              </span>
              <div className="text-lg sm:text-xl font-bold text-navy">{selectedTicket.title}</div>
            </div>
          ) : undefined
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs sm:text-sm text-text-body leading-relaxed max-h-48 overflow-y-auto">
              {selectedTicket.description}
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                >
                  <option value="OPEN">Open (Under Review)</option>
                  <option value="IN_REVIEW">In Review (Contacting Broker)</option>
                  <option value="RESOLVED">Resolved (Funds Released / Solved)</option>
                  <option value="CLOSED">Closed (Unsubstantiated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1">
                  Official Administrative Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record verification with regulatory registries or broker compliance desk..."
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-full transition shadow-sm"
              >
                {updating ? 'Saving...' : 'Save Resolution'}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
