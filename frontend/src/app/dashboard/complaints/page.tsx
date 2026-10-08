'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Building2,
  Radio,
  Users,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [targetType, setTargetType] = useState<'BROKER' | 'ACCOUNT_MANAGER' | 'SIGNAL_PROVIDER'>('BROKER');
  const [targetName, setTargetName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [lossAmount, setLossAmount] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/my');
      if (res.data?.success) {
        setComplaints(res.data.data?.complaints || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        targetType,
        targetName,
        subject,
        description,
        lossAmount: lossAmount ? parseFloat(lossAmount) : undefined,
        desiredResolution: desiredResolution || undefined,
      };

      const res = await api.post('/complaints', payload);
      if (res.data?.success) {
        setSuccessMsg('Your dispute has been logged with the Scam Radar & Compliance Council.');
        setTargetName('');
        setSubject('');
        setDescription('');
        setLossAmount('');
        setDesiredResolution('');
        setShowForm(false);
        fetchComplaints();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to submit dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green/10 text-green border-green/20';
      case 'IN_REVIEW':
        return 'bg-blue/10 text-blue border-blue/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'OPEN':
      default:
        return 'bg-orange/10 text-orange border-orange/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Trader Protection & Dispute Desk
          </h1>
          <p className="text-xs text-text-muted mt-1">
            File verified disputes against brokers, account managers, or signal providers with our compliance panel.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'File a New Dispute'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-green/10 border border-green/20 text-green text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Complaint Submission Form */}
      {showForm && (
        <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <h2 className="text-base font-bold text-navy mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Submit Formal Complaint
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Provide detailed evidence and timestamps. Our dispute officers investigate all claims with licensed regulatory authorities.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5">
                  Entity Category
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading focus:outline-none focus:border-rose-500 transition"
                >
                  <option value="BROKER">Forex Broker</option>
                  <option value="ACCOUNT_MANAGER">Fund / Account Manager</option>
                  <option value="SIGNAL_PROVIDER">Signal Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5">
                  Firm / Provider Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Capital Markets Ltd."
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5">
                  Dispute Subject / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized withdrawal refusal / account freeze"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5">
                  Financial Loss (USD, Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 2500"
                    value={lossAmount}
                    onChange={(e) => setLossAmount(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Detailed Incident Description & Chronology
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what occurred, dates, account numbers, and attempts to resolve with the firm directly..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-border rounded-xl p-3 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Desired Resolution
              </label>
              <input
                type="text"
                placeholder="e.g. Full refund of $2,500 deposit and closure of account"
                value={desiredResolution}
                onChange={(e) => setDesiredResolution(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-surface-tint hover:bg-border/60 text-navy rounded-full text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Lodging Dispute...' : 'Submit to Compliance Council'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints History */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-soft">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" />
          Your Dispute Log
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl">
            <ShieldAlert className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <div className="text-xs font-bold text-navy">No Active Disputes Filed</div>
            <p className="text-[11px] text-text-muted mt-1 max-w-sm mx-auto">
              You haven't submitted any complaints against brokers or providers. All trading activity is in good standing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-surface-tint/60 border border-border hover:border-border/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] font-bold ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">
                      Ref: #{c.id.substring(0, 8)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      • Against <strong className="text-text-heading">{c.targetName || c.targetType}</strong>
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-text-heading mt-1">{c.subject}</h3>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{c.description}</p>
                </div>

                <div className="text-right shrink-0">
                  {c.lossAmount && (
                    <div className="text-xs font-mono font-bold text-rose-500">
                      Claim: ${c.lossAmount.toLocaleString()}
                    </div>
                  )}
                  <div className="text-[10px] text-text-muted font-mono mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
