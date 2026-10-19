'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Radio,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  ExternalLink,
  ChevronLeft,
  Check,
  X,
  Eye,
  FileCheck,
  Lock,
  Globe,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SignalProvider, ApprovalStatus } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminSPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [sp, setSP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'performance_risk' | 'documents' | 'verification' | 'agreements' | 'signals' | 'flags'
  >('profile');

  // Modals for actions
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesNote, setChangesNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Document review modal
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docReviewStatus, setDocReviewStatus] = useState<string>('APPROVED');
  const [docReviewNote, setDocReviewNote] = useState<string>('');

  const fetchSP = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/signal-providers/${id}`);
      setSP(res.data?.data || null);
    } catch (err: any) {
      console.error('Failed to load SP details', err);
      toast.error(err.response?.data?.message || 'Failed to load signal provider dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSP();
  }, [id]);

  // Status Actions
  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to APPROVE ${sp?.displayName}?`)) return;
    try {
      setActionLoading(true);
      await api.patch(`/admin/signal-providers/${id}/status`, { status: 'APPROVED' });
      toast.success('Signal Provider APPROVED successfully');
      fetchSP();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/admin/signal-providers/${id}/status`, {
        status: 'REJECTED',
        reason: rejectionReason,
      });
      toast.success('Signal Provider marked as REJECTED');
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchSP();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changesNote.trim()) {
      toast.error('Note explaining requested changes is required');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/admin/signal-providers/${id}/request-changes`, {
        note: changesNote,
      });
      toast.success('Changes requested. Provider notified.');
      setChangesModalOpen(false);
      setChangesNote('');
      fetchSP();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request changes');
    } finally {
      setActionLoading(false);
    }
  };

  // Verification Toggles
  const handleToggleVerification = async (key: 'idVerified' | 'statementVerified' | 'performanceLinkVerified') => {
    if (!sp) return;
    try {
      setActionLoading(true);
      const payload = {
        idVerified: key === 'idVerified' ? !sp.idVerified : sp.idVerified,
        statementVerified: key === 'statementVerified' ? !sp.statementVerified : sp.statementVerified,
        performanceLinkVerified:
          key === 'performanceLinkVerified' ? !sp.performanceLinkVerified : sp.performanceLinkVerified,
      };
      await api.patch(`/admin/signal-providers/${id}/verification`, payload);
      toast.success('Verification status updated');
      fetchSP();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update verification');
    } finally {
      setActionLoading(false);
    }
  };

  // View Document Signed URL
  const viewDocument = async (docId: string) => {
    try {
      const res = await api.get(`/admin/signal-providers/${id}/documents/${docId}/url`);
      if (res.data?.data?.url) {
        window.open(res.data.data.url, '_blank');
      } else {
        toast.error('No signed URL returned for this document');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate signed document URL');
    }
  };

  // Update Document Review Status
  const handleUpdateDocReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      setActionLoading(true);
      await api.patch(`/admin/signal-providers/${id}/documents/${selectedDoc.id}`, {
        reviewStatus: docReviewStatus,
        reviewNote: docReviewNote || undefined,
      });
      toast.success('Document review status updated');
      setSelectedDoc(null);
      fetchSP();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!sp) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-heading mb-1">Signal Provider Not Found</h2>
        <Link href="/admin/signal-providers" className="text-xs text-blue font-bold hover:underline">
          &larr; Back to Signal Providers
        </Link>
      </div>
    );
  }

  const reviewFlags = Array.isArray(sp.reviewFlags) ? sp.reviewFlags : [];
  const documents = sp.documents || [];
  const acceptances = sp.acceptances || [];
  const plans = sp.plans || [];
  const signals = sp.signals || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/signal-providers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-navy transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Signal Providers</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-tint border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {sp.photo ? (
                <img src={sp.photo} alt={sp.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black font-mono text-blue">
                  {sp.displayName?.[0]?.toUpperCase() || 'S'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-navy">{sp.displayName}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sp.status === 'APPROVED'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : sp.status === 'REJECTED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {sp.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-tint text-text-heading border border-border">
                  Flow: {sp.onboardingStatus || 'DRAFT'}
                </span>
                {sp.verificationStatus && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                )}
                {sp.usesMartingale && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-700" /> Martingale
                  </span>
                )}
              </div>

              {sp.legalFullName && (
                <div className="text-xs text-text-heading font-semibold">
                  Legal Full Name: <span className="font-mono text-navy font-bold">{sp.legalFullName}</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-text-muted mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3 h-3" /> {sp.user?.email || '—'}
                </span>
                {sp.contactPhone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" /> {sp.contactPhone}
                  </span>
                )}
                {sp.residenceCountry && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {sp.residenceCountry} ({sp.residenceCountryCode})
                  </span>
                )}
                <span className="font-bold text-blue">Completion: {sp.completionPercent || 0}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {sp.status !== 'APPROVED' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green hover:bg-green-hover text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
            )}

            <button
              onClick={() => setChangesModalOpen(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Request Changes
            </button>

            {sp.status !== 'REJECTED' && (
              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            )}
          </div>
        </div>

        {/* Auto Red Flags Banner if any */}
        {reviewFlags.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Compliance Red-Flags Computed at Submission ({reviewFlags.length}):</span>
            </div>
            <ul className="list-disc list-inside text-xs text-rose-900 space-y-1 pl-2">
              {reviewFlags.map((flag: string, idx: number) => (
                <li key={idx} className="font-mono text-[11px]">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dossier Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'profile', label: 'Identity & Strategy' },
          { key: 'performance_risk', label: 'Performance & Risk' },
          { key: 'documents', label: `Documents (${documents.length})` },
          { key: 'verification', label: 'Verification Toggles' },
          { key: 'agreements', label: `Agreements (${acceptances.length})` },
          { key: 'signals', label: `Signals (${signals.length})` },
          { key: 'flags', label: `Audit Flags (${reviewFlags.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-blue text-white shadow-sm'
                : 'text-text-muted hover:text-text-heading hover:bg-surface-tint'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Strategy */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy border-b border-border pb-2">
              Personal &amp; Contact Disclosures (Private)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Legal Full Name:</span>
                <span className="font-bold text-text-heading">{sp.legalFullName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Public Display Name:</span>
                <span className="font-bold text-text-heading">{sp.displayName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Login Email:</span>
                <span className="font-mono text-text-heading">{sp.user?.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Contact Phone (E.164):</span>
                <span className="font-mono text-text-heading">{sp.contactPhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Country of Residence:</span>
                <span className="text-text-heading">
                  {sp.residenceCountry || '—'} ({sp.residenceCountryCode || '—'})
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-navy border-b border-border pb-2 pt-2">
              Trading Experience
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Years Trading:</span>
                <span className="font-bold text-text-heading">{sp.yearsTrading ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Previously Acted as SP:</span>
                <span className="font-bold text-text-heading">
                  {sp.previouslySignalProvider ? 'Yes' : 'No'}
                </span>
              </div>
              {sp.previousProviderDetails && (
                <div className="py-1">
                  <span className="text-text-muted block mb-1">Previous Service Details:</span>
                  <p className="p-3 rounded-xl bg-surface-tint border border-border text-text-body">
                    {sp.previousProviderDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy border-b border-border pb-2">
              Strategy &amp; Methodology
            </h3>
            <div className="text-xs space-y-3">
              <div>
                <span className="text-text-muted font-bold block mb-1">Strategy Headline:</span>
                <p className="font-bold text-text-heading">{sp.strategy || '—'}</p>
              </div>

              {sp.strategyDetail && (
                <div>
                  <span className="text-text-muted font-bold block mb-1">Detailed Strategy Logic:</span>
                  <p className="p-3 rounded-xl bg-surface-tint border border-border text-text-body whitespace-pre-line leading-relaxed">
                    {sp.strategyDetail}
                  </p>
                </div>
              )}

              {sp.specializedExpertise && (
                <div>
                  <span className="text-text-muted font-bold block mb-1">Specialized Expertise:</span>
                  <p className="p-3 rounded-xl bg-surface-tint border border-border text-text-body leading-relaxed">
                    {sp.specializedExpertise}
                  </p>
                </div>
              )}

              {sp.marketAdaptation && (
                <div>
                  <span className="text-text-muted font-bold block mb-1">Market Adaptation:</span>
                  <p className="p-3 rounded-xl bg-surface-tint border border-border text-text-body leading-relaxed">
                    {sp.marketAdaptation}
                  </p>
                </div>
              )}

              {sp.uniqueValue && (
                <div>
                  <span className="text-text-muted font-bold block mb-1">Unique Value Proposition:</span>
                  <p className="p-3 rounded-xl bg-surface-tint border border-border text-text-body leading-relaxed">
                    {sp.uniqueValue}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Performance & Risk */}
      {activeTab === 'performance_risk' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy border-b border-border pb-2 flex items-center justify-between">
              <span>Self-Declared Performance Metrics</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                Self-Declared
              </span>
            </h3>

            {sp.performancePeriodNote && (
              <p className="text-xs text-text-muted italic">
                Reported coverage period: &ldquo;{sp.performancePeriodNote}&rdquo;
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Avg Monthly Return</div>
                <div className="text-lg font-black font-mono text-navy mt-1">
                  {sp.declaredAvgMonthlyReturn !== undefined && sp.declaredAvgMonthlyReturn !== null
                    ? `${sp.declaredAvgMonthlyReturn}%`
                    : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Max Drawdown</div>
                <div className="text-lg font-black font-mono text-red-600 mt-1">
                  {sp.declaredMaxDrawdown !== undefined && sp.declaredMaxDrawdown !== null
                    ? `${sp.declaredMaxDrawdown}%`
                    : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Declared Win Rate</div>
                <div className="text-lg font-black font-mono text-green mt-1">
                  {sp.declaredWinRate !== undefined && sp.declaredWinRate !== null
                    ? `${sp.declaredWinRate}%`
                    : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Max Consec. Losses</div>
                <div className="text-lg font-black font-mono text-text-heading mt-1">
                  {sp.maxConsecutiveLosses ?? '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-text-muted">Timeframes</div>
                <div className="text-xs font-bold text-text-heading mt-2 truncate">
                  {sp.preferredTimeframes?.join(', ') || '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy border-b border-border pb-2">
              Risk Management Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Max Leverage Used</div>
                <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                  {sp.maxLeverageUsed ? `1 : ${sp.maxLeverageUsed}` : '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Risk-Reward Preference</div>
                <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                  {sp.riskRewardPreference || '—'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Risk Level Category</div>
                <div className="text-sm font-bold text-text-heading mt-0.5">
                  {sp.riskCategory || '—'}
                </div>
              </div>
            </div>

            {sp.riskPhilosophy && (
              <div className="text-xs">
                <span className="text-text-muted font-bold block mb-1">Risk Philosophy:</span>
                <p className="p-3.5 rounded-2xl bg-surface-tint border border-border text-text-body leading-relaxed whitespace-pre-line">
                  {sp.riskPhilosophy}
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-heading">Hedging &amp; Martingale:</span>
                {sp.usesHedging && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue font-bold text-[10px] border border-blue-200">
                    Hedging
                  </span>
                )}
                {sp.usesMartingale && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300">
                    Martingale
                  </span>
                )}
              </div>
              {sp.hedgingMartingaleNotes && (
                <p className="text-text-body text-[11px] leading-relaxed">{sp.hedgingMartingaleNotes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'documents' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue" />
              <span>KYC &amp; Account Statement Verification Vault</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Secure Cloudinary assets served via authenticated signed URLs (5-minute expiration, audit-logged).
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">No documents uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-tint text-text-muted uppercase text-[10px] font-bold">
                    <th className="p-3">Doc Type</th>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Period / Account Type</th>
                    <th className="p-3">Review Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-surface-tint/60">
                      <td className="p-3 font-bold text-navy">{doc.docType}</td>
                      <td className="p-3 font-mono text-text-heading">{doc.fileName}</td>
                      <td className="p-3 text-text-muted">
                        {doc.periodFrom && doc.periodTo ? (
                          <span>
                            {new Date(doc.periodFrom).toLocaleDateString()} &ndash;{' '}
                            {new Date(doc.periodTo).toLocaleDateString()}
                          </span>
                        ) : sp.statementAccountType ? (
                          <span className="font-semibold text-text-heading">
                            {sp.statementAccountType} Account
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.reviewStatus === 'APPROVED'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : doc.reviewStatus === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {doc.reviewStatus}
                        </span>
                        {doc.reviewNote && (
                          <div className="text-[10px] text-text-muted italic mt-0.5">{doc.reviewNote}</div>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => viewDocument(doc.id)}
                          className="px-3 py-1 bg-surface-tint hover:bg-border text-navy rounded-lg font-bold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View (Signed)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setDocReviewStatus(doc.reviewStatus || 'APPROVED');
                            setDocReviewNote(doc.reviewNote || '');
                          }}
                          className="px-3 py-1 bg-blue text-white rounded-lg font-bold transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Verification Toggles */}
      {activeTab === 'verification' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green" />
              <span>Independent Verification Toggles</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              The overall &quot;Verified Provider&quot; badge is granted ONLY when Identity is verified, LIVE Account Statement is verified, and statements are genuine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ID Verified */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-navy flex items-center justify-between mb-1">
                  <span>Identity Document (KYC)</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sp.idVerified ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sp.idVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Passport, National ID, or Driver&apos;s Licence matching the provider&apos;s legal name.
                </p>
              </div>
              <button
                onClick={() => handleToggleVerification('idVerified')}
                disabled={actionLoading}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition ${
                  sp.idVerified ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue text-white'
                }`}
              >
                {sp.idVerified ? 'Revoke ID Verification' : 'Verify Identity'}
              </button>
            </div>

            {/* Statement Verified */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-navy flex items-center justify-between mb-1">
                  <span>Account Statement</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sp.statementVerified ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sp.statementVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Last 3 months (&ge; 85 days) trading statement.
                  {sp.statementAccountType === 'DEMO' && (
                    <span className="text-amber-800 font-bold block mt-1">
                      Note: Demo statement uploaded. Demo statements cannot earn the verified badge.
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleToggleVerification('statementVerified')}
                disabled={actionLoading}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition ${
                  sp.statementVerified
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-blue text-white'
                }`}
              >
                {sp.statementVerified ? 'Revoke Statement' : 'Verify Statement'}
              </button>
            </div>

            {/* Performance Link Verified */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-navy flex items-center justify-between mb-1">
                  <span>Track Record URL</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sp.performanceLinkVerified ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sp.performanceLinkVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">
                  {sp.performanceLink ? (
                    <a
                      href={sp.performanceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue underline font-mono text-[10px]"
                    >
                      {sp.performanceLink}
                    </a>
                  ) : (
                    'No link submitted'
                  )}
                </p>
              </div>
              <button
                onClick={() => handleToggleVerification('performanceLinkVerified')}
                disabled={actionLoading || !sp.performanceLink}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition ${
                  sp.performanceLinkVerified
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-blue text-white'
                }`}
              >
                {sp.performanceLinkVerified ? 'Revoke Link' : 'Verify Track Record Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Agreements Log */}
      {activeTab === 'agreements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-bold text-navy">Legal Agreements &amp; Commitments Acceptance Log</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cryptographically timestamped acceptances recorded with version, client IP, and browser user-agent.
            </p>
          </div>

          {acceptances.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">No agreements accepted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-tint text-text-muted uppercase text-[10px] font-bold">
                    <th className="p-3">Agreement Key</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Accepted At</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Client User-Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  {acceptances.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-surface-tint/60">
                      <td className="p-3 font-bold text-navy font-sans">{acc.agreementKey}</td>
                      <td className="p-3">v{acc.version}</td>
                      <td className="p-3">{new Date(acc.acceptedAt).toLocaleString()}</td>
                      <td className="p-3">{acc.ipAddress || '—'}</td>
                      <td className="p-3 truncate max-w-xs">{acc.userAgent || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Signals */}
      {activeTab === 'signals' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-navy border-b border-border pb-2">
            Broadcasted Signals ({signals.length})
          </h3>
          {signals.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">No signals published yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-tint text-text-muted uppercase text-[10px] font-bold">
                    <th className="p-3">Instrument / Type</th>
                    <th className="p-3">Entry</th>
                    <th className="p-3">Stop Loss</th>
                    <th className="p-3">Take Profit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Pips Gained</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {signals.map((sig: any) => (
                    <tr key={sig.id} className="hover:bg-surface-tint/60">
                      <td className="p-3 font-bold text-navy">
                        {sig.instrument} ({sig.direction})
                      </td>
                      <td className="p-3 font-mono">{sig.entryPrice || 'Market'}</td>
                      <td className="p-3 font-mono text-rose-500">{sig.stopLoss || '—'}</td>
                      <td className="p-3 font-mono text-green">{sig.takeProfit || '—'}</td>
                      <td className="p-3 font-semibold">{sig.status}</td>
                      <td className="p-3 font-bold font-mono">
                        {sig.pipsGained !== null ? `${sig.pipsGained} pips` : 'Live'}
                      </td>
                      <td className="p-3 text-text-muted text-[11px]">
                        {new Date(sig.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Flags */}
      {activeTab === 'flags' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-navy border-b border-border pb-2">
            Compliance Review Flags
          </h3>
          {reviewFlags.length === 0 ? (
            <div className="p-8 text-center text-green font-semibold text-xs">
              No automated red flags found. Profile is clean.
            </div>
          ) : (
            <div className="space-y-2">
              {reviewFlags.map((flag: string, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-900 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="md"
        title="Reject Signal Provider Application"
        subtitle="Specify the clear compliance rationale for rejection."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Identity documents unreadable or statement period insufficient..."
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
          >
            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </form>
      </Modal>

      {/* Request Changes Modal */}
      <Modal
        isOpen={changesModalOpen}
        onClose={() => setChangesModalOpen(false)}
        maxWidth="md"
        title="Request Profile Revisions"
        subtitle="The provider will receive these notes and be permitted to re-edit."
      >
        <form onSubmit={handleRequestChanges} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1">
              Requested Modifications <span className="text-amber-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              placeholder="e.g. Please provide a clear 3-month MT4/MT5 PDF statement..."
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
          >
            {actionLoading ? 'Sending...' : 'Request Revisions'}
          </button>
        </form>
      </Modal>

      {/* Document Review Modal */}
      <Modal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        maxWidth="md"
        title={selectedDoc ? `Review: ${selectedDoc.docType}` : undefined}
        subtitle={selectedDoc?.fileName}
      >
        {selectedDoc && (
          <form onSubmit={handleUpdateDocReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Review Decision
              </label>
              <select
                value={docReviewStatus}
                onChange={(e) => setDocReviewStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-border rounded-xl text-xs text-text-heading"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Review Note (Optional)
              </label>
              <textarea
                rows={3}
                value={docReviewNote}
                onChange={(e) => setDocReviewNote(e.target.value)}
                placeholder="Audit notes or reasons for document rejection..."
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
            >
              {actionLoading ? 'Saving...' : 'Save Document Status'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
