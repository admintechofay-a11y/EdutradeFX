'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Edit,
  Check,
  X,
  MessageSquare,
  Search,
} from 'lucide-react';
import { MOCK_COMPLAINTS } from '@/lib/mockData';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Modal fields
  const [newStatus, setNewStatus] = useState('in_mediation');
  const [timelineNote, setTimelineNote] = useState('');
  const [brokerReplyText, setBrokerReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [scamWarning, setScamWarning] = useState(false);

  const openMediateModal = (c: any) => {
    setSelectedCase(c);
    setNewStatus(c.status);
    setTimelineNote('');
    setBrokerReplyText(c.brokerResponse?.text || '');
    setAdminNotes(c.adminNotes || '');
    setResolutionSummary(c.resolutionSummary || '');
    setScamWarning(c.scamWarning || false);
    setStatusModalOpen(true);
  };

  const handleSaveMediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    setComplaints(
      complaints.map((c) => {
        if (c.caseId === selectedCase.caseId) {
          const updatedTimeline = [...(c.timeline || [])];
          if (timelineNote.trim()) {
            updatedTimeline.push({
              stage: newStatus,
              title: `Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
              note: timelineNote,
              date: new Date().toISOString().split('T')[0],
            });
          }

          return {
            ...c,
            status: newStatus,
            scamWarning,
            adminNotes,
            resolutionSummary,
            brokerResponse: brokerReplyText
              ? {
                  text: brokerReplyText,
                  respondedAt: new Date().toISOString().split('T')[0],
                  respondedBy: `${c.brokerName} Compliance`,
                }
              : c.brokerResponse,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    setStatusModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Dispute Mediation Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Complaints & Scam Resolution Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine incoming disputes, demand proof from broker compliance, and update public scam alerts.
          </p>
        </div>
      </div>

      {/* Complaints Management Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/50 text-slate-400 uppercase text-[10px]">
                <th className="p-4 font-bold">Case ID</th>
                <th className="p-4 font-bold">Target Broker</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Dispute Amount</th>
                <th className="p-4 font-bold">Current Status</th>
                <th className="p-4 font-bold">Complainant</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {complaints.map((c) => (
                <tr key={c.caseId} className="hover:bg-slate-800/30">
                  <td className="p-4 font-mono font-bold text-amber-400">{c.caseId}</td>
                  <td className="p-4 font-bold text-white">{c.brokerName}</td>
                  <td className="p-4 text-slate-300">{c.category.replace(/_/g, ' ')}</td>
                  <td className="p-4 font-black text-rose-400">
                    ${c.disputeAmount?.toLocaleString()} {c.currency}
                  </td>
                  <td className="p-4">
                    {c.scamWarning ? (
                      <span className="badge-red text-[10px]">Scam Warning</span>
                    ) : c.status === 'resolved' ? (
                      <span className="badge-green text-[10px]">Resolved</span>
                    ) : (
                      <span className="badge-gold text-[10px]">{c.status.replace(/_/g, ' ')}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{c.complainant?.name}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openMediateModal(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-surface border border-slate-700 hover:border-amber-400 text-slate-200 transition-colors"
                    >
                      Mediate Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mediation Action Modal */}
      {statusModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-card border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="badge-gold text-[10px]">{selectedCase.caseId}</span>
                <h3 className="text-base font-bold text-white mt-1">
                  Mediation: {selectedCase.brokerName}
                </h3>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMediation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Case Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="under_review">Under Review</option>
                  <option value="broker_contacted">Notice Sent to Broker</option>
                  <option value="in_mediation">In Mediation</option>
                  <option value="resolved">Dispute Resolved</option>
                  <option value="scam_warning">Public Scam Warning Issued</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Append Timeline Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Compliance team confirmed refund wire transfer."
                  value={timelineNote}
                  onChange={(e) => setTimelineNote(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Official Broker Response Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste response received from broker compliance..."
                  value={brokerReplyText}
                  onChange={(e) => setBrokerReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Mediation Desk Internal Findings
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal audit notes, tick comparison results..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Final Resolution Verdict (Public)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Funds fully recovered via mediation intervention."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="scamCheck"
                  checked={scamWarning}
                  onChange={(e) => setScamWarning(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <label htmlFor="scamCheck" className="font-bold text-rose-400 cursor-pointer">
                  Publish Critical Scam Warning on Radar
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
                >
                  Update Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
