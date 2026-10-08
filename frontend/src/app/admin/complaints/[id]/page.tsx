'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const res = await api.get('/complaints');
        const found = (res.data?.data || []).find((c: any) => c.id === id);
        if (found) {
          setComplaint(found);
        } else {
          const singleRes = await api.get(`/complaints/${id}`).catch(() => null);
          if (singleRes?.data?.data) {
            setComplaint(singleRes.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load complaint', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/complaints/${id}`, {
        status,
        resolution: resolution || undefined,
      });
      setComplaint((prev: any) => ({ ...prev, status, resolution }));
      alert(`Dispute status updated to ${status}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl bg-border/40" />
        <Skeleton className="h-64 rounded-3xl bg-border/40" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 bg-white border border-border rounded-3xl p-8 shadow-soft">
        <MessageSquare className="w-12 h-12 text-border mx-auto" />
        <h2 className="text-xl font-bold text-navy">Dispute Case Not Found</h2>
        <p className="text-xs text-text-muted">
          The requested dispute record could not be found or has been archived.
        </p>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Portal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Portal</span>
        </Link>
      </div>

      {/* Main Dispute Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-border space-y-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                {complaint.targetType} DISPUTE
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  complaint.status === 'RESOLVED'
                    ? 'bg-green/10 text-green border border-green/20'
                    : complaint.status === 'IN_REVIEW'
                    ? 'bg-orange/10 text-orange border border-orange/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-navy">{complaint.subject}</h1>
            <p className="text-xs text-text-muted">
              Target Entity: <span className="text-navy font-bold font-mono">{complaint.targetName || complaint.targetId}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {complaint.status !== 'RESOLVED' && (
              <button
                onClick={() => handleUpdateStatus('RESOLVED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green hover:bg-green-hover text-white rounded-full text-xs font-bold transition shadow-sm w-full sm:w-auto min-h-[40px] flex items-center justify-center"
              >
                Mark Resolved
              </button>
            )}
            {complaint.status === 'OPEN' && (
              <button
                onClick={() => handleUpdateStatus('IN_REVIEW')}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange/10 hover:bg-orange/20 text-orange border border-orange/20 rounded-full text-xs font-bold transition w-full sm:w-auto min-h-[40px] flex items-center justify-center"
              >
                Set Under Review
              </button>
            )}
          </div>
        </div>

        {/* Dispute metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Complainant</div>
            <div className="text-sm font-bold text-navy flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue" />
              <span>{complaint.user?.name || complaint.userName || 'Verified Trader'}</span>
            </div>
            <div className="text-xs text-text-muted">{complaint.user?.email || complaint.userEmail}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Dispute Type</div>
            <div className="text-sm font-black text-red-500 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{complaint.complaintType || 'Regulatory / Non-Execution'}</span>
            </div>
            <div className="text-xs text-text-muted">Target: {complaint.targetType}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Filed On</div>
            <div className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-text-muted" />
              <span>
                {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                  dateStyle: 'medium',
                })}
              </span>
            </div>
            <div className="text-xs text-text-muted">ID: {complaint.id.slice(0, 8)}...</div>
          </div>
        </div>

        {/* Description body */}
        <div className="pt-6 border-t border-border space-y-2">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
            Complainant Statement & Evidence
          </h3>
          <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-body leading-relaxed whitespace-pre-line">
            {complaint.description}
          </div>
        </div>

        {/* Resolution note */}
        {complaint.status !== 'RESOLVED' && (
          <div className="pt-6 border-t border-border space-y-3">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Official Resolution Note
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Document the resolution steps, mediation outcome, or refund confirmation..."
              className="w-full p-3 rounded-xl bg-white border border-border text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue resize-none h-24"
            />
          </div>
        )}
      </div>
    </div>
  );
}
