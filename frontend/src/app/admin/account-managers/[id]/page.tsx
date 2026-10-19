'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
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
  Building2,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AccountManager, ApprovalStatus } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminAMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [am, setAM] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'regulatory' | 'documents' | 'strategy_risk' | 'sharing' | 'agreements'>('profile');

  // Modals for actions
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesNote, setChangesNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAM = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/account-managers/${id}`);
      setAM(res.data?.data || null);
    } catch (err: any) {
      console.error('Failed to load AM details', err);
      toast.error(err.response?.data?.message || 'Failed to load manager details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAM();
  }, [id]);

  // Status updates
  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to APPROVE ${am?.fullName}?`)) return;
    try {
      setActionLoading(true);
      await api.patch(`/admin/account-managers/${id}/status`, { status: 'APPROVED' });
      toast.success('Account Manager APPROVED successfully');
      fetchAM();
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
      await api.patch(`/admin/account-managers/${id}/status`, {
        status: 'REJECTED',
        reason: rejectionReason,
      });
      toast.success('Account Manager marked as REJECTED');
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchAM();
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
      await api.post(`/admin/account-managers/${id}/request-changes`, {
        note: changesNote,
      });
      toast.success('Changes requested. Manager notified.');
      setChangesModalOpen(false);
      setChangesNote('');
      fetchAM();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request changes');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleRegulatoryVerified = async () => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/account-managers/${id}/regulatory-verify`);
      toast.success(res.data?.message || 'Regulatory verified status updated');
      fetchAM();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Document signed URL view
  const openSignedDocUrl = async (docId: string) => {
    try {
      const res = await api.get(`/admin/account-managers/${id}/documents/${docId}/url`);
      const url = res.data?.data?.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Failed to generate document signed URL');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Document access error');
    }
  };

  // Document review update
  const updateDocumentReview = async (docId: string, reviewStatus: ApprovalStatus, isPublic: boolean) => {
    try {
      await api.patch(`/admin/account-managers/${id}/documents/${docId}`, {
        reviewStatus,
        isPublic,
      });
      toast.success('Document review updated');
      fetchAM();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update document status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!am) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-heading">Account Manager Record Not Found</h2>
        <Link href="/admin/account-managers" className="mt-4 inline-block text-xs font-bold text-blue underline">
          Return to List
        </Link>
      </div>
    );
  }

  const documents = am.documents || [];
  const agreementsList = am.agreements || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link
            href="/admin/account-managers"
            className="text-xs font-bold text-blue hover:underline flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Account Managers
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-navy">{am.fullName}</h1>
            {am.regulatoryVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Regulated
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Slug: <span className="font-mono text-text-heading">{am.slug}</span> • ID:{' '}
            <span className="font-mono">{am.id}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleRegulatoryVerified}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              am.regulatoryVerified
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{am.regulatoryVerified ? 'Revoke Regulated Badge' : 'Verify Regulated Badge'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChangesModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition"
          >
            Request Changes
          </button>

          <button
            type="button"
            onClick={() => setRejectModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
          >
            Reject
          </button>

          <button
            type="button"
            disabled={actionLoading || am.status === 'APPROVED'}
            onClick={handleApprove}
            className="px-5 py-2 bg-green hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Approve Manager</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-tint border border-border overflow-hidden flex items-center justify-center shrink-0">
            {am.photo ? (
              <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold font-mono text-blue">{am.fullName[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-heading">{am.user?.email}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-tint border border-border uppercase">
                {am.entityType || 'INDIVIDUAL'}
              </span>
            </div>
            <div className="text-xs text-text-muted mt-1">
              Onboarding Status: <span className="font-bold text-navy">{am.onboardingStatus || 'DRAFT'}</span> •
              Approval: <span className="font-bold text-navy">{am.status}</span> • Completion:{' '}
              <span className="font-bold text-blue">{am.completionPercent || 0}%</span>
            </div>
          </div>
        </div>

        {am.submittedAt && (
          <div className="text-xs text-text-muted">
            Submitted for review: <span className="font-bold">{new Date(am.submittedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        {[
          { key: 'profile', label: 'Profile & Contact' },
          { key: 'regulatory', label: 'Regulatory' },
          { key: 'documents', label: `Documents (${documents.length})` },
          { key: 'strategy_risk', label: 'Strategy & Risk Profile' },
          { key: 'sharing', label: 'Settlements & Sharing' },
          { key: 'agreements', label: `Agreements (${agreementsList.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue text-white shadow-soft'
                : 'text-text-muted hover:text-text-heading hover:bg-surface-tint'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Contact */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Contact & Location (Private)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
                <span className="text-text-muted block text-[11px]">Private Contact Email:</span>
                <span className="font-bold text-text-heading">{am.contactEmail || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
                <span className="text-text-muted block text-[11px]">Private Phone (E.164):</span>
                <span className="font-bold text-text-heading">{am.contactPhone || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
                <span className="text-text-muted block text-[11px]">Location:</span>
                <span className="font-bold text-text-heading">
                  {[am.city, am.stateRegion, am.country].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-tint border border-border sm:col-span-2">
                <span className="text-text-muted block text-[11px]">Physical Street Address:</span>
                <span className="font-bold text-text-heading">{am.address || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
                <span className="text-text-muted block text-[11px]">Zip / Postal Code:</span>
                <span className="font-bold text-text-heading">{am.zipCode || '—'}</span>
              </div>
            </div>

            {am.entityType === 'CORPORATE' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-blue uppercase tracking-wider mb-2">Corporate Entity Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Legal Name: </span>
                    <span className="font-bold">{am.companyLegalName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Registration Number: </span>
                    <span className="font-bold">{am.companyRegistrationNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Incorporation Country: </span>
                    <span className="font-bold">{am.incorporationCountry || '—'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Company Website: </span>
                    <span className="font-bold">{am.companyWebsite || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">About & Speciality</h3>
            <div>
              <div className="text-xs font-bold text-text-muted mb-1">Speciality:</div>
              <p className="text-xs font-semibold text-text-heading leading-relaxed bg-surface-tint p-3 rounded-xl border border-border">
                {am.speciality || 'None stated'}
              </p>
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted mb-1">Biography / About Trader:</div>
              <p className="text-xs text-text-heading leading-relaxed whitespace-pre-wrap">
                {am.bio || 'None provided'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Regulatory */}
      {activeTab === 'regulatory' && (
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Regulatory Information</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                am.regulatoryVerified
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {am.regulatoryVerified ? 'Status: VERIFIED' : 'Status: UNVERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
              <span className="text-text-muted block text-[11px]">Self-Declared Regulated:</span>
              <span className="font-bold text-text-heading">{am.isRegulated ? 'Yes' : 'No'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
              <span className="text-text-muted block text-[11px]">Regulator Name:</span>
              <span className="font-bold text-text-heading">{am.regulatorName || '—'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
              <span className="text-text-muted block text-[11px]">Registration / License Number:</span>
              <span className="font-bold text-text-heading">{am.regulatorRegistrationNumber || '—'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-tint border border-border">
              <span className="text-text-muted block text-[11px]">Regulator Country:</span>
              <span className="font-bold text-text-heading">{am.regulatorCountry || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documents (with Signed URL Access) */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <span className="font-bold">Security & Cloudinary Signed URLs: </span>
            Private manager documents (CV, performance records, strategy docs, and unapproved screenshots) are served
            via time-limited signed URLs expiring in 5 minutes with full audit-logging.
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Uploaded Documents</h3>

            {documents.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center">No documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-surface-tint border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-heading">{doc.fileName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-border">
                            {doc.docType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.reviewStatus === 'APPROVED'
                                ? 'bg-green-50 text-green-700'
                                : doc.reviewStatus === 'REJECTED'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {doc.reviewStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Size: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Public Display:{' '}
                          <span className="font-bold">{doc.isPublic ? 'YES' : 'NO'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Signed URL & Status Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openSignedDocUrl(doc.id)}
                        className="px-3 py-1.5 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateDocumentReview(doc.id, 'APPROVED', !doc.isPublic)}
                        className="px-3 py-1.5 bg-surface-tint border border-border hover:bg-white rounded-xl text-xs font-bold text-text-heading transition"
                      >
                        {doc.isPublic ? 'Make Private' : 'Make Public'}
                      </button>

                      {doc.reviewStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => updateDocumentReview(doc.id, 'APPROVED', doc.isPublic)}
                          className="p-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200"
                          title="Approve Document"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}

                      {doc.reviewStatus !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => updateDocumentReview(doc.id, 'REJECTED', false)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200"
                          title="Reject Document"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Strategy & Risk Profile */}
      {activeTab === 'strategy_risk' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Trading Strategy & Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted font-bold block mb-1">Indicators:</span>
                <p className="bg-surface-tint p-3 rounded-xl border border-border leading-relaxed">
                  {am.indicators || 'None stated'}
                </p>
              </div>
              <div>
                <span className="text-text-muted font-bold block mb-1">Technical Setup:</span>
                <p className="bg-surface-tint p-3 rounded-xl border border-border leading-relaxed">
                  {am.technical || 'None stated'}
                </p>
              </div>
              <div>
                <span className="text-text-muted font-bold block mb-1">Signals:</span>
                <p className="bg-surface-tint p-3 rounded-xl border border-border leading-relaxed">
                  {am.signals || 'None stated'}
                </p>
              </div>
              <div>
                <span className="text-text-muted font-bold block mb-1">Fundamentals & Macro:</span>
                <p className="bg-surface-tint p-3 rounded-xl border border-border leading-relaxed">
                  {am.fundamentals || 'None stated'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Risk Appetite & Loss Recovery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-surface-tint rounded-xl border border-border">
                <span className="text-text-muted block text-[11px]">Risk Tolerance:</span>
                <span className="font-bold">{am.riskTolerance || '—'}</span>
              </div>
              <div className="p-3 bg-surface-tint rounded-xl border border-border">
                <span className="text-text-muted block text-[11px]">Risk/Reward:</span>
                <span className="font-bold">{am.riskRewardRatio || '—'}</span>
              </div>
              <div className="p-3 bg-surface-tint rounded-xl border border-border">
                <span className="text-text-muted block text-[11px]">Loss Per Trade:</span>
                <span className="font-bold">{am.lossPerTradePercent != null ? `${am.lossPerTradePercent}%` : '—'}</span>
              </div>
              <div className="p-3 bg-surface-tint rounded-xl border border-border">
                <span className="text-text-muted block text-[11px]">Daily Trades (1000 USD):</span>
                <span className="font-bold">{am.dailyTrades != null ? am.dailyTrades : '—'}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-red-800 block mb-1">
                Loss Recovery Strategy (Confidential Admin Audit):
              </span>
              <p className="text-xs bg-red-50/40 p-4 rounded-xl border border-red-200 leading-relaxed text-red-950">
                {am.lossRecoveryStrategy || 'No loss recovery strategy recorded.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Settlements & Sharing */}
      {activeTab === 'sharing' && (
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Sharing & Settlements</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-surface-tint rounded-2xl border border-border">
              <span className="text-text-muted block text-[11px]">Settlement Cycle:</span>
              <span className="text-base font-bold text-text-heading mt-1">{am.settlementCycle || '—'}</span>
            </div>
            <div className="p-4 bg-surface-tint rounded-2xl border border-border">
              <span className="text-text-muted block text-[11px]">Manager Profit Share:</span>
              <span className="text-base font-bold text-green-700 mt-1">
                {am.profitSharingPercent != null ? `${am.profitSharingPercent}%` : '—'}
              </span>
            </div>
            <div className="p-4 bg-surface-tint rounded-2xl border border-border">
              <span className="text-text-muted block text-[11px]">Manager Loss Share:</span>
              <span className="text-base font-bold text-text-heading mt-1">
                {am.lossSharingPercent != null ? `${am.lossSharingPercent}%` : '0%'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-text-muted block mb-1">Security of Client Funds:</span>
            <p className="text-xs bg-surface-tint p-4 rounded-xl border border-border leading-relaxed">
              {am.clientFundSecurity || '—'}
            </p>
          </div>

          {am.recommendsBroker && (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-1">Recommended Broker Configuration:</span>
              <div>Broker: {am.recommendedBrokerName || 'Specified Broker'}</div>
              <div>Platform: {am.recommendedBrokerPlatform || 'MT5'}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Agreements */}
      {activeTab === 'agreements' && (
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">
            Legal Agreement Acceptances Log
          </h3>

          {agreementsList.length === 0 ? (
            <p className="text-xs text-text-muted py-8 text-center">No agreements accepted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                    <th className="p-3">Agreement Key</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Accepted At</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {agreementsList.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-surface-tint/50">
                      <td className="p-3 font-bold text-text-heading">{acc.agreementKey}</td>
                      <td className="p-3 font-mono">{acc.version}</td>
                      <td className="p-3">{new Date(acc.acceptedAt).toLocaleString()}</td>
                      <td className="p-3 font-mono">{acc.ipAddress || '—'}</td>
                      <td className="p-3 truncate max-w-xs" title={acc.userAgent || ''}>
                        {acc.userAgent || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Account Manager">
        <form onSubmit={handleReject} className="space-y-4 p-2 text-xs">
          <p className="text-text-muted">
            Provide a clear, detailed reason for rejecting this manager profile. This note will be sent directly to the
            account manager.
          </p>
          <textarea
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Unverified performance statement exports; invalid licensing proof..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Changes Modal */}
      <Modal isOpen={changesModalOpen} onClose={() => setChangesModalOpen(false)} title="Request Profile Changes">
        <form onSubmit={handleRequestChanges} className="space-y-4 p-2 text-xs">
          <p className="text-text-muted">
            Detail the specific fields and adjustments required before approval. The manager's status will be set to
            CHANGES_REQUESTED.
          </p>
          <textarea
            required
            rows={4}
            value={changesNote}
            onChange={(e) => setChangesNote(e.target.value)}
            placeholder="e.g. Please re-upload clearer screenshots showing trade tickets and date ranges..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setChangesModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-orange text-white rounded-xl text-xs font-bold hover:bg-orange-hover transition"
            >
              Send Change Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
