'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Server,
  CreditCard,
  Handshake,
  DollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Calendar,
  Award,
  ChevronLeft,
  X,
  Check,
  ShieldAlert,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Broker, ApprovalStatus, BrokerOnboardingStatus } from '@/types';

export default function AdminBrokerAuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brokerId = params?.id as string;

  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Status Modals
  const [showStatusModal, setShowStatusModal] = useState<ApprovalStatus | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Revealed Credential State
  const [revealedCreds, setRevealedCreds] = useState<{ [groupId: string]: string }>({});
  const [revealingGroup, setRevealingGroup] = useState<string | null>(null);

  const fetchBrokerDetails = async () => {
    if (!brokerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/brokers/${brokerId}`);
      if (res.data?.success && res.data?.data) {
        setBroker(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load broker audit details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerDetails();
  }, [brokerId]);

  // Handle License Verification
  const toggleLicenseVerification = async (licenseId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/admin/brokers/${brokerId}/license/${licenseId}/verify`, {
        verified: !currentStatus,
      });
      if (res.data?.success) {
        toast.success(`License ${!currentStatus ? 'marked Verified' : 'unverified'}`);
        // Update local state
        if (broker && broker.licenses) {
          setBroker({
            ...broker,
            licenses: broker.licenses.map((l) =>
              l.id === licenseId ? { ...l, verifiedByAdmin: !currentStatus } : l
            ),
          });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update license verification status');
    }
  };

  // Reveal Test Account Credentials
  const handleRevealCredentials = async (groupId: string) => {
    setRevealingGroup(groupId);
    try {
      const res = await api.post(`/admin/brokers/${brokerId}/account-group/${groupId}/reveal-credentials`);
      if (res.data?.success && res.data?.data?.testPassword) {
        setRevealedCreds({
          ...revealedCreds,
          [groupId]: res.data.data.testPassword,
        });
        toast.success('Decrypted test password revealed and recorded in Audit Log.');
      } else {
        toast.error('No password stored or decryption failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not decrypt credentials');
    } finally {
      setRevealingGroup(null);
    }
  };

  // Handle Status Update (Approve / Reject / Request Changes)
  const handleUpdateStatus = async (targetStatus: ApprovalStatus) => {
    setActionLoading(true);
    try {
      const payload: any = { status: targetStatus };
      if (targetStatus === 'APPROVED') {
        payload.onboardingStatus = 'VERIFIED';
      } else if (targetStatus === 'PENDING' && reviewNote) {
        payload.onboardingStatus = 'CHANGES_REQUESTED';
        payload.reviewNote = reviewNote;
      } else if (targetStatus === 'REJECTED') {
        payload.onboardingStatus = 'CHANGES_REQUESTED';
        payload.rejectionReason = rejectionReason;
      }

      const res = await api.patch(`/admin/brokers/${brokerId}/status`, payload);
      if (res.data?.success) {
        toast.success(`Broker status successfully updated to ${targetStatus}`);
        setShowStatusModal(null);
        fetchBrokerDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-text-muted">Loading broker compliance dossier...</p>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-navy">Broker Profile Not Found</h2>
        <Link
          href="/admin/brokers"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue text-white text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Brokers Table
        </Link>
      </div>
    );
  }

  const licenses = broker.licenses || [];
  const servers = broker.servers || [];
  const boardMembers = broker.boardMembers || [];
  const accountGroups = broker.accountGroups || [];
  const depositMethods = broker.depositMethodItems || [];
  const withdrawalMethods = broker.withdrawalMethodItems || [];
  const symbolSpecs = broker.symbolSpecs || [];
  const ibPlans = broker.ibPlans || [];
  const fundingYears = broker.fundingYears || [];
  const awards = broker.awards || [];
  const documents = broker.documents || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── BREADCRUMB & TOP ACTIONS ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/brokers"
            className="p-2 rounded-full border border-border text-navy hover:bg-surface-tint transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue">Compliance Audit Portal</div>
            <h1 className="text-2xl font-black text-navy">{broker.companyName}</h1>
          </div>
        </div>

        {/* Audit Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowStatusModal('APPROVED')}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Verify Broker
          </button>

          <button
            onClick={() => setShowStatusModal('PENDING')}
            className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Clock className="w-4 h-4" />
            Request Changes
          </button>

          <button
            onClick={() => setShowStatusModal('REJECTED')}
            className="px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <X className="w-4 h-4" />
            Reject Application
          </button>

          <a
            href={`/brokers/${broker.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-full border border-border text-navy hover:bg-surface-tint transition"
            title="Preview public profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── DOSSIER STATUS RIBBON ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Approval Status</div>
          <div className="mt-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                broker.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : broker.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {broker.status}
            </span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Onboarding State</div>
          <div className="mt-1">
            <span className="px-3 py-1 rounded-full bg-surface-tint border border-border text-xs font-bold text-navy uppercase">
              {broker.onboardingStatus}
            </span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Completeness Score</div>
          <div className="text-base font-black text-blue mt-0.5">{broker.completenessPct ?? 0}%</div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Registered Owner</div>
          <div className="text-xs font-bold text-navy mt-0.5 truncate">{broker.user?.name || 'Broker User'}</div>
          <div className="text-[10px] text-text-muted truncate">{broker.user?.email}</div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Submitted On</div>
          <div className="text-xs font-bold text-navy mt-0.5">
            {broker.submittedAt ? new Date(broker.submittedAt).toLocaleDateString() : 'Not yet submitted'}
          </div>
        </div>
      </div>

      {/* ── REGULATORY LICENSES & ADMIN VERIFICATION ─────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue" />
            <h3 className="text-base font-black text-navy uppercase tracking-wider">
              Regulatory Licenses ({licenses.length})
            </h3>
          </div>
          <span className="text-xs text-text-muted">
            Toggle &quot;Verify&quot; to award official compliance verification badges on public profiles.
          </span>
        </div>

        {licenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {licenses.map((lic) => (
              <div key={lic.id} className="p-5 rounded-2xl border border-border bg-surface-tint/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-navy">{lic.regulatoryBody}</span>
                  <button
                    onClick={() => toggleLicenseVerification(lic.id, lic.verifiedByAdmin)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      lic.verifiedByAdmin
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-border text-navy hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lic.verifiedByAdmin ? 'Verified ✓' : 'Mark Verified'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">License / Reg Number:</span>
                    <span className="font-bold text-navy">{lic.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status:</span>
                    <span className="font-bold text-emerald-600">{lic.licenseStatus || 'Active'}</span>
                  </div>
                  {lic.companyAddress && (
                    <div className="text-[11px] text-text-muted pt-1 border-t border-border">
                      {lic.companyAddress}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {lic.proofLink && (
                    <a
                      href={lic.proofLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Regulator Registry Check
                    </a>
                  )}
                  {lic.licensePdfUrl && (
                    <a
                      href={lic.licensePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-navy hover:underline"
                    >
                      <FileText className="w-3 h-3 text-blue" />
                      View Official PDF
                    </a>
                  )}
                  {lic.proofUrl && (
                    <a
                      href={lic.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      View Proof Image
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-text-muted bg-surface-tint rounded-2xl">
            No regulatory licenses filed for this brokerage.
          </div>
        )}
      </div>

      {/* ── COMPLIANCE TEST ACCOUNTS (AES-256 REVEAL) ─────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-navy uppercase tracking-wider">
              Compliance Test Demo Accounts & Decryption
            </h3>
          </div>
          <span className="text-xs text-text-muted">Audited credentials for server & spread testing.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accountGroups.map((group) => {
            const revealedPass = revealedCreds[group.id];
            return (
              <div key={group.id} className="p-5 rounded-2xl border border-border bg-surface-tint/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-navy">{group.name}</span>
                  <span className="text-[10px] font-bold uppercase text-blue">{group.spreadType}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Test Login / Account:</span>
                    <span className="font-mono font-bold text-navy">{group.testLogin || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Test Server:</span>
                    <span className="font-mono text-navy">{group.testServer || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-text-muted">Test Password:</span>
                    {revealedPass ? (
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {revealedPass}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevealCredentials(group.id)}
                        disabled={revealingGroup === group.id}
                        className="px-3 py-1 rounded-full bg-white border border-border text-navy text-xs font-bold hover:bg-surface-tint flex items-center gap-1 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {revealingGroup === group.id ? 'Decrypting...' : 'Reveal Password'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONFIDENTIAL FINANCIAL AUDIT DATA ────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue" />
          <h3 className="text-base font-black text-navy uppercase tracking-wider">
            Confidential Turnover & Financials (Strictly Private)
          </h3>
        </div>

        {fundingYears.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-tint text-navy font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Net Deposits (USD)</th>
                  <th className="p-3">Net Withdrawals (USD)</th>
                  <th className="p-3">Total Volume (Lots)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {fundingYears.map((fy) => (
                  <tr key={fy.id} className="hover:bg-surface-tint/50">
                    <td className="p-3 font-bold">{fy.year}</td>
                    <td className="p-3 text-emerald-600 font-mono">
                      {fy.netDepositUsd ? `$${Number(fy.netDepositUsd).toLocaleString()}` : '$0'}
                    </td>
                    <td className="p-3 text-rose-600 font-mono">
                      {fy.netWithdrawUsd ? `$${Number(fy.netWithdrawUsd).toLocaleString()}` : '$0'}
                    </td>
                    <td className="p-3 font-mono">
                      {fy.netLots ? Number(fy.netLots).toLocaleString() : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-text-muted">No annual turnover data submitted.</div>
        )}

        {/* Client Activity */}
        {broker.clientActivity && (
          <div className="pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-surface-tint">
              <div className="text-[10px] text-text-muted uppercase">Avg New Client Deposit</div>
              <div className="font-bold text-navy mt-1">
                ${Number(broker.clientActivity.avgNewClientDeposit || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-tint">
              <div className="text-[10px] text-text-muted uppercase">Avg Existing Client Deposit</div>
              <div className="font-bold text-navy mt-1">
                ${Number(broker.clientActivity.avgExistingClientDeposit || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-tint">
              <div className="text-[10px] text-text-muted uppercase">Avg New Client Withdrawal</div>
              <div className="font-bold text-navy mt-1">
                ${Number(broker.clientActivity.avgNewClientWithdrawal || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-tint">
              <div className="text-[10px] text-text-muted uppercase">Avg Existing Client Withdrawal</div>
              <div className="font-bold text-navy mt-1">
                ${Number(broker.clientActivity.avgExistingClientWithdrawal || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MANDATORY POLICY DOCUMENTS ───────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="text-base font-black text-navy uppercase tracking-wider">
          Compliance Policy Documents ({documents.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex justify-between items-center"
            >
              <div className="truncate mr-2">
                <div className="text-xs font-bold text-navy truncate">{doc.docType.replace(/_/g, ' ')}</div>
                <div className="text-[10px] text-text-muted truncate">{doc.fileName || 'PDF Document'}</div>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-white border border-border text-[11px] font-bold text-blue hover:bg-blue hover:text-white transition shrink-0"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATUS UPDATE MODAL ───────────────────────────── */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-navy">
                {showStatusModal === 'APPROVED'
                  ? 'Approve & Publish Broker'
                  : showStatusModal === 'PENDING'
                  ? 'Request Compliance Modifications'
                  : 'Reject Broker Application'}
              </h3>
              <button onClick={() => setShowStatusModal(null)} className="text-text-muted hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              {showStatusModal === 'APPROVED'
                ? 'This action marks the broker as VERIFIED, publishes their profile to the live directory, and dispatches an approval notification to the firm.'
                : showStatusModal === 'PENDING'
                ? 'Specify the modifications required. The broker will be notified in their dashboard and by email.'
                : 'State the formal grounds for rejection. An administrative notice will be dispatched.'}
            </p>

            {showStatusModal === 'PENDING' && (
              <textarea
                rows={4}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Detail the required changes (e.g. upload certified ASIC license certificate, update client loss disclaimer)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
              />
            )}

            {showStatusModal === 'REJECTED' && (
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (e.g. Unverifiable offshore entity, non-compliant regulatory filing)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(null)}
                className="px-4 py-2 rounded-full border border-border text-xs font-bold text-navy hover:bg-surface-tint"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(showStatusModal)}
                className={`px-5 py-2 rounded-full text-white text-xs font-bold transition ${
                  showStatusModal === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : showStatusModal === 'PENDING'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
