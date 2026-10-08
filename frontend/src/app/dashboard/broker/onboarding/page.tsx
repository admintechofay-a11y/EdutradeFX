'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Server,
  ShieldCheck,
  Users,
  Headphones,
  Lock,
  CreditCard,
  Handshake,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Network,
  Globe,
  TrendingUp,
  Activity,
  Sparkles,
  Trophy,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  ShieldAlert,
  Eye,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import {
  WIZARD_STEPS,
  REGULATORY_BODIES,
  BUSINESS_TYPES,
  TRADING_PLATFORMS,
  SUPPORTED_DEVICES,
  SPREAD_TYPES,
  ORDER_EXECUTIONS,
  GTC_MODES,
  IB_SETTLEMENTS,
  ORDER_TYPES_LIST,
  COMMON_CURRENCIES,
  DEPOSIT_PAYMENT_METHODS,
  WITHDRAWAL_PAYMENT_METHODS,
  POLICY_DOC_TYPES,
} from '@/lib/brokerOptions';
import { Broker, BrokerDocType } from '@/types';
import { OptionSelect } from '@/components/common/OptionSelect';

export default function BrokerOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [broker, setBroker] = useState<Broker | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Load broker onboarding data
  const loadDraft = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brokers/my/onboarding');
      if (res.data?.success && res.data?.data) {
        setBroker(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load onboarding draft');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  // Generic File Uploader helper
  const handleFileUpload = async (endpoint: string, file: File, fieldKey: string): Promise<string | null> => {
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.data?.url) {
        toast.success('File uploaded successfully');
        return res.data.data.url;
      }
      throw new Error('Upload returned invalid response');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'File upload failed');
      return null;
    } finally {
      setUploadingField(null);
    }
  };

  // Section Save handler
  const saveSection = async (sectionKey: string, payload: any, silent = false) => {
    setSaving(true);
    try {
      const res = await api.put(`/brokers/my/onboarding/${sectionKey}`, payload);
      if (res.data?.success && res.data?.data) {
        setBroker(res.data.data);
        if (!silent) toast.success('Section saved successfully');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save section');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Final Submit Handler
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/brokers/my/onboarding/submit');
      if (res.data?.success && res.data?.data) {
        setBroker(res.data.data);
        toast.success('Application successfully submitted for compliance audit!');
        setActiveStepIndex(WIZARD_STEPS.length - 1);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Compliance validation failed. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-text-muted">Loading broker onboarding file...</p>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-navy">Unable to load broker onboarding file</h2>
        <p className="text-sm text-text-muted mb-4">Please make sure your broker user account is authenticated.</p>
        <button
          onClick={loadDraft}
          className="px-5 py-2.5 rounded-full bg-blue text-white font-semibold text-sm hover:bg-blue-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentStep = WIZARD_STEPS[activeStepIndex];
  const isReadOnly = broker.onboardingStatus === 'SUBMITTED' && broker.status === 'PENDING';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── TOP HEADER & STATUS BAR ──────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-navy">{broker.companyName || 'Broker Registration'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                broker.onboardingStatus === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : broker.onboardingStatus === 'SUBMITTED'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : broker.onboardingStatus === 'CHANGES_REQUESTED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                  : 'bg-surface-tint text-navy border border-border'
              }`}
            >
              {broker.onboardingStatus}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Official Broker Registration & Onboarding Dossier • Exact Specification Form
          </p>
        </div>

        {/* Progress Bar & Jump */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-navy">
              <span>Completeness</span>
              <span className="text-blue">{broker.completenessPct ?? 0}%</span>
            </div>
            <div className="h-2.5 w-full bg-surface-tint rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-blue to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(broker.completenessPct || 0, 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setActiveStepIndex(WIZARD_STEPS.length - 1)}
            className="px-4 py-2 rounded-full border border-border text-navy text-xs font-bold hover:bg-surface-tint transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
            Checklist ({broker.completenessPct || 0}%)
          </button>
        </div>
      </div>

      {/* ── COMPLIANCE ALERTS ────────────────────────────── */}
      {broker.onboardingStatus === 'CHANGES_REQUESTED' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-rose-900 tracking-wider">
              Compliance Modification Requested by Audit Team
            </h4>
            <p className="text-xs text-rose-700">
              {broker.reviewNote ||
                'The compliance team has requested updates to your submitted details. Please modify the highlighted sections and re-submit for approval.'}
            </p>
          </div>
        </div>
      )}

      {isReadOnly && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
              Application Under Compliance Review
            </h4>
            <p className="text-xs text-amber-700">
              Your onboarding file was submitted on{' '}
              {broker.submittedAt ? new Date(broker.submittedAt).toLocaleDateString() : 'recently'}. Field editing is
              locked while our compliance officer verifies your regulatory records.
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE: STEPPER + STEP VIEW ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Wizard Navigation List */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-3 border border-border shadow-sm space-y-1 max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-text-muted">
            Onboarding Sections (18)
          </div>
          {WIZARD_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = idx < 19; // Visual indication
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-left text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue text-white shadow-sm'
                    : 'text-text-muted hover:text-navy hover:bg-surface-tint'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive ? 'bg-white text-blue' : 'bg-surface-tint text-text-muted border border-border'
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="truncate">{step.shortTitle}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </aside>

        {/* Right: Active Step Form Workspace */}
        <main className="lg:col-span-9 bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
          {/* Step Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-blue">
                Step {currentStep.number} of {WIZARD_STEPS.length}
              </div>
              <h2 className="text-xl font-black text-navy">{currentStep.title}</h2>
              <p className="text-xs text-text-muted mt-0.5">{currentStep.description}</p>
            </div>

            {/* Quick Next/Prev */}
            <div className="flex items-center gap-2">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-full border border-border text-navy hover:bg-surface-tint disabled:opacity-40 transition"
                title="Previous section"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeStepIndex === WIZARD_STEPS.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(WIZARD_STEPS.length - 1, prev + 1))}
                className="p-2 rounded-full border border-border text-navy hover:bg-surface-tint disabled:opacity-40 transition"
                title="Next section"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Step Content Component */}
          {activeStepIndex === 0 && (
            <StepGeneralInfo
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('general', data)}
              onNext={() => setActiveStepIndex(1)}
              onLogoUpload={(file) => handleFileUpload('/brokers/my/upload/logo', file, 'logo')}
              uploading={uploadingField === 'logo'}
            />
          )}

          {activeStepIndex === 1 && (
            <StepDevicesServers
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('devices-servers', data)}
              onNext={() => setActiveStepIndex(2)}
            />
          )}

          {activeStepIndex === 2 && (
            <StepRegulatory
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('regulatory', data)}
              onNext={() => setActiveStepIndex(3)}
              onUploadPdf={(file, idx) =>
                handleFileUpload('/brokers/my/upload/license-pdf', file, `license-pdf-${idx}`)
              }
              onUploadProof={(file, idx) =>
                handleFileUpload('/brokers/my/upload/license-proof', file, `license-proof-${idx}`)
              }
              uploadingField={uploadingField}
            />
          )}

          {activeStepIndex === 3 && (
            <StepBoardHeadOffice
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('board', data)}
              onNext={() => setActiveStepIndex(4)}
              onUploadBoardPhoto={(file, idx) =>
                handleFileUpload('/brokers/my/upload/board-photo', file, `board-photo-${idx}`)
              }
              uploadingField={uploadingField}
            />
          )}

          {activeStepIndex === 4 && (
            <StepSupportRestrictions
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('support', data)}
              onNext={() => setActiveStepIndex(5)}
            />
          )}

          {activeStepIndex === 5 && (
            <StepFundsSecurityLoss
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('funds-loss', data)}
              onNext={() => setActiveStepIndex(6)}
            />
          )}

          {activeStepIndex === 6 && (
            <StepAccountGroups
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('account-groups', data)}
              onNext={() => setActiveStepIndex(7)}
              onUploadSchedule={(file, key) =>
                handleFileUpload('/brokers/my/upload/structure-doc', file, key)
              }
              uploadingField={uploadingField}
            />
          )}

          {activeStepIndex === 7 && (
            <StepIbProgram
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('ib-program', data)}
              onNext={() => setActiveStepIndex(8)}
            />
          )}

          {activeStepIndex === 8 && (
            <StepDepositMethods
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('deposit-methods', data)}
              onNext={() => setActiveStepIndex(9)}
            />
          )}

          {activeStepIndex === 9 && (
            <StepWithdrawalMethods
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('withdrawal-methods', data)}
              onNext={() => setActiveStepIndex(10)}
            />
          )}

          {activeStepIndex === 10 && (
            <StepSymbolSpecs
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('symbol-specs', data)}
              onNext={() => setActiveStepIndex(11)}
            />
          )}

          {activeStepIndex === 11 && (
            <StepDealingLiquidity
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('dealing', data)}
              onNext={() => setActiveStepIndex(12)}
            />
          )}

          {activeStepIndex === 12 && (
            <StepBusinessAreas
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('business-areas', data)}
              onNext={() => setActiveStepIndex(13)}
            />
          )}

          {activeStepIndex === 13 && (
            <StepFundingVolume
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('funding', data)}
              onNext={() => setActiveStepIndex(14)}
            />
          )}

          {activeStepIndex === 14 && (
            <StepClientActivity
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('activity', data)}
              onNext={() => setActiveStepIndex(15)}
            />
          )}

          {activeStepIndex === 15 && (
            <StepProsCons
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('pros-cons', data)}
              onNext={() => setActiveStepIndex(16)}
            />
          )}

          {activeStepIndex === 16 && (
            <StepAwards
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('awards', data)}
              onNext={() => setActiveStepIndex(17)}
            />
          )}

          {activeStepIndex === 17 && (
            <StepSocialVideo
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('social', data)}
              onNext={() => setActiveStepIndex(18)}
              onUploadVideo={(file) =>
                handleFileUpload('/brokers/my/upload/promo-video', file, 'promo-video')
              }
              uploading={uploadingField === 'promo-video'}
            />
          )}

          {activeStepIndex === 18 && (
            <StepPoliciesLegal
              broker={broker}
              isReadOnly={isReadOnly}
              saving={saving}
              onSave={(data) => saveSection('policies', data)}
              onNext={() => setActiveStepIndex(19)}
              onUploadPolicyPdf={(file, key) =>
                handleFileUpload('/brokers/my/upload/policy-pdf', file, key)
              }
              uploadingField={uploadingField}
            />
          )}

          {activeStepIndex === 19 && (
            <StepReviewSubmit
              broker={broker}
              submitting={submitting}
              onSubmit={handleSubmitApplication}
              onJumpToStep={(stepIdx) => setActiveStepIndex(stepIdx)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// SUB-COMPONENTS: ALL 18 SECTIONS + REVIEW STEP
// ──────────────────────────────────────────────────────────

/* 1. GENERAL INFORMATION */
function StepGeneralInfo({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onLogoUpload,
  uploading,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onLogoUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
}) {
  const [formData, setFormData] = useState({
    companyName: broker.companyName || '',
    registeredName: broker.registeredName || '',
    businessType: broker.businessType || 'STP',
    address: broker.address || '',
    city: broker.city || '',
    state: broker.state || '',
    postalCode: broker.postalCode || '',
    country: broker.country || '',
    website: broker.website || '',
    phone: broker.phone || '',
    email: broker.email || '',
    yearFounded: broker.yearFounded || new Date().getFullYear(),
    mtRegisteredCountryRegion: broker.mtRegisteredCountryRegion || '',
    isRegulated: broker.isRegulated ?? true,
    totalTradableSymbols: broker.totalTradableSymbols || 500,
    accountCurrencies: broker.accountCurrencies || ['USD', 'EUR', 'GBP'],
    negativeBalanceProtection: broker.negativeBalanceProtection ?? true,
    logo: broker.logo || '',
  });

  const toggleCurrency = (cur: string) => {
    if (formData.accountCurrencies.includes(cur)) {
      setFormData({ ...formData, accountCurrencies: formData.accountCurrencies.filter((c) => c !== cur) });
    } else {
      setFormData({ ...formData, accountCurrencies: [...formData.accountCurrencies, cur] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            disabled={isReadOnly}
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Pepperstone"
          />
        </div>

        {/* Registered Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Registered Entity Legal Name</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.registeredName}
            onChange={(e) => setFormData({ ...formData, registeredName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Pepperstone Group Limited"
          />
        </div>

        {/* Business Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Business Model</label>
          <select
            disabled={isReadOnly}
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue bg-white"
          >
            {BUSINESS_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>
                {bt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Founded */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Year Founded</label>
          <input
            disabled={isReadOnly}
            type="number"
            min={1950}
            max={2030}
            value={formData.yearFounded}
            onChange={(e) => setFormData({ ...formData, yearFounded: parseInt(e.target.value) || 2010 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          />
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">
            Operating Country <span className="text-rose-500">*</span>
          </label>
          <input
            disabled={isReadOnly}
            type="text"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Australia"
          />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            disabled={isReadOnly}
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Melbourne"
          />
        </div>

        {/* Address */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-navy">Headquarters Physical Street Address</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Level 16, Tower One, 727 Collins Street"
          />
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">
            Official Broker Website <span className="text-rose-500">*</span>
          </label>
          <input
            disabled={isReadOnly}
            type="url"
            required
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="https://example.com"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">
            Official Contact Email <span className="text-rose-500">*</span>
          </label>
          <input
            disabled={isReadOnly}
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="compliance@broker.com"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Corporate Phone Number</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="+61 3 9020 0155"
          />
        </div>

        {/* Total Tradable Symbols */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Total Tradable Instruments</label>
          <input
            disabled={isReadOnly}
            type="number"
            value={formData.totalTradableSymbols}
            onChange={(e) => setFormData({ ...formData, totalTradableSymbols: parseInt(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. 1200"
          />
        </div>

        {/* MT Registered Country Region */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">MetaQuotes / Tech Server Jurisdiction</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.mtRegisteredCountryRegion}
            onChange={(e) => setFormData({ ...formData, mtRegisteredCountryRegion: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. London LD4 / New York NY4"
          />
        </div>

        {/* Negative Balance Protection */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="text-xs font-bold text-navy">Negative Balance Protection</label>
          <div className="flex items-center gap-4 py-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
              <input
                disabled={isReadOnly}
                type="radio"
                name="nbp"
                checked={formData.negativeBalanceProtection === true}
                onChange={() => setFormData({ ...formData, negativeBalanceProtection: true })}
                className="text-blue"
              />
              Yes, Active
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
              <input
                disabled={isReadOnly}
                type="radio"
                name="nbp"
                checked={formData.negativeBalanceProtection === false}
                onChange={() => setFormData({ ...formData, negativeBalanceProtection: false })}
                className="text-blue"
              />
              No
            </label>
          </div>
        </div>
      </div>

      {/* Account Base Currencies */}
      <div className="space-y-2 pt-2 border-t border-border">
        <OptionSelect
          group="CURRENCY"
          mode="multiple"
          label="Supported Base Account Currencies"
          disabled={isReadOnly}
          value={formData.accountCurrencies}
          onChange={(val) => setFormData({ ...formData, accountCurrencies: val })}
          placeholder="Select or search account base currencies..."
          helperText="Select all native account balance currencies offered to clients."
        />
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 2. DEVICES & TRADING SERVERS */
function StepDevicesServers({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [formData, setFormData] = useState({
    platformDescription: broker.platformDescription || '',
    availablePlatforms: broker.availablePlatforms || ['MetaTrader 4 (MT4)', 'MetaTrader 5 (MT5)'],
    deviceSupport: broker.deviceSupport || ['Windows PC', 'macOS Apple Silicon / Intel', 'iOS (iPhone / iPad)', 'Android'],
    platformLinks: broker.platformLinks || {},
    servers: (broker.servers && broker.servers.length > 0
      ? broker.servers
      : [{ name: 'Live-Server-1', ip: '', location: 'London (LD4)', sortOrder: 0 }]) as any[],
  });

  const togglePlatform = (p: string) => {
    if (formData.availablePlatforms.includes(p)) {
      setFormData({ ...formData, availablePlatforms: formData.availablePlatforms.filter((item) => item !== p) });
    } else {
      setFormData({ ...formData, availablePlatforms: [...formData.availablePlatforms, p] });
    }
  };

  const toggleDevice = (d: string) => {
    if (formData.deviceSupport.includes(d)) {
      setFormData({ ...formData, deviceSupport: formData.deviceSupport.filter((item) => item !== d) });
    } else {
      setFormData({ ...formData, deviceSupport: [...formData.deviceSupport, d] });
    }
  };

  const addServer = () => {
    setFormData({
      ...formData,
      servers: [
        ...formData.servers,
        { name: `Live-Server-${formData.servers.length + 1}`, ip: '', location: '', sortOrder: formData.servers.length },
      ],
    });
  };

  const removeServer = (idx: number) => {
    setFormData({
      ...formData,
      servers: formData.servers.filter((_, i) => i !== idx),
    });
  };

  const updateServer = (idx: number, field: string, val: any) => {
    const updated = [...formData.servers];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, servers: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Available Platforms */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-navy">Supported Trading Software Platforms</label>
        <div className="flex flex-wrap gap-2">
          {TRADING_PLATFORMS.map((platform) => {
            const selected = formData.availablePlatforms.includes(platform);
            return (
              <button
                type="button"
                key={platform}
                disabled={isReadOnly}
                onClick={() => togglePlatform(platform)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  selected
                    ? 'bg-blue text-white border-blue shadow-sm'
                    : 'bg-surface-tint text-navy border-border hover:border-blue'
                }`}
              >
                {platform} {selected ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Support */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-navy">Supported Hardware & Devices</label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_DEVICES.map((device) => {
            const selected = formData.deviceSupport.includes(device);
            return (
              <button
                type="button"
                key={device}
                disabled={isReadOnly}
                onClick={() => toggleDevice(device)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  selected
                    ? 'bg-blue text-white border-blue shadow-sm'
                    : 'bg-surface-tint text-navy border-border hover:border-blue'
                }`}
              >
                {device} {selected ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Overview Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-navy">Platform & Execution Infrastructure Overview</label>
        <textarea
          disabled={isReadOnly}
          rows={3}
          value={formData.platformDescription}
          onChange={(e) => setFormData({ ...formData, platformDescription: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          placeholder="Describe your Equinix fiber cross-connects, VPS hosting capabilities, and proprietary web tools..."
        />
      </div>

      {/* Trading Servers Repeater */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-navy tracking-wider">Trading Server Endpoints</h3>
            <p className="text-[11px] text-text-muted">Live and demo cluster server names and datacenter locations.</p>
          </div>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={addServer}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Server
          </button>
        </div>

        <div className="space-y-2.5">
          {formData.servers.map((srv, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex flex-col md:flex-row items-center gap-3"
            >
              <div className="w-full md:w-1/3">
                <input
                  disabled={isReadOnly}
                  type="text"
                  required
                  value={srv.name}
                  onChange={(e) => updateServer(idx, 'name', e.target.value)}
                  placeholder="Server Name (e.g. Pepperstone-Live01)"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
              </div>
              <div className="w-full md:w-1/3">
                <input
                  disabled={isReadOnly}
                  type="text"
                  value={srv.location || ''}
                  onChange={(e) => updateServer(idx, 'location', e.target.value)}
                  placeholder="Location / Datacenter (e.g. LD4 London)"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
              </div>
              <div className="w-full md:w-1/3 flex items-center gap-2">
                <input
                  disabled={isReadOnly}
                  type="text"
                  value={srv.ip || ''}
                  onChange={(e) => updateServer(idx, 'ip', e.target.value)}
                  placeholder="IP / Hostname (Private)"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
                {formData.servers.length > 1 && (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => removeServer(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Remove server"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 3. REGULATORY INFORMATION */
function StepRegulatory({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onUploadPdf,
  onUploadProof,
  uploadingField,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onUploadPdf: (file: File, idx: number) => Promise<string | null>;
  onUploadProof: (file: File, idx: number) => Promise<string | null>;
  uploadingField: string | null;
}) {
  const [formData, setFormData] = useState({
    isRegulated: broker.isRegulated ?? true,
    licenses: (broker.licenses && broker.licenses.length > 0
      ? broker.licenses
      : [
          {
            regulatoryBody: 'FCA (United Kingdom)',
            licenseNumber: '',
            licenseStatus: 'Active',
            companyAddress: '',
            licensePdfUrl: '',
            proofUrl: '',
            proofLink: '',
            sortOrder: 0,
          },
        ]) as any[],
  });

  const addLicense = () => {
    setFormData({
      ...formData,
      licenses: [
        ...formData.licenses,
        {
          regulatoryBody: 'ASIC (Australia)',
          licenseNumber: '',
          licenseStatus: 'Active',
          companyAddress: '',
          licensePdfUrl: '',
          proofUrl: '',
          proofLink: '',
          sortOrder: formData.licenses.length,
        },
      ],
    });
  };

  const removeLicense = (idx: number) => {
    setFormData({
      ...formData,
      licenses: formData.licenses.filter((_, i) => i !== idx),
    });
  };

  const updateLicense = (idx: number, field: string, val: any) => {
    const updated = [...formData.licenses];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, licenses: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Is Regulated Radio */}
      <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Is Your Brokerage Regulated?</h3>
          <p className="text-[11px] text-text-muted">
            Regulated brokers must provide at least one active license with official PDF proof.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-navy cursor-pointer">
            <input
              disabled={isReadOnly}
              type="radio"
              name="isReg"
              checked={formData.isRegulated === true}
              onChange={() => setFormData({ ...formData, isRegulated: true })}
            />
            Yes, Regulated
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-navy cursor-pointer">
            <input
              disabled={isReadOnly}
              type="radio"
              name="isReg"
              checked={formData.isRegulated === false}
              onChange={() => setFormData({ ...formData, isRegulated: false })}
            />
            Unregulated
          </label>
        </div>
      </div>

      {/* Licenses Repeater */}
      {formData.isRegulated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase text-navy tracking-wider">
                Financial Regulatory Licenses
              </h3>
              <p className="text-[11px] text-text-muted">
                Each license will be verified by EdutradeFX compliance officers.
              </p>
            </div>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={addLicense}
              className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another License
            </button>
          </div>

          <div className="space-y-4">
            {formData.licenses.map((lic, idx) => (
              <div key={idx} className="p-5 rounded-3xl border border-border bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue" />
                    <span className="text-xs font-bold text-navy">License #{idx + 1}</span>
                    {lic.verifiedByAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified by Admin ✓
                      </span>
                    )}
                  </div>
                  {formData.licenses.length > 1 && (
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => removeLicense(idx)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <OptionSelect
                      group="REGULATOR"
                      label="Regulatory Body"
                      disabled={isReadOnly}
                      value={lic.regulatorCode || lic.regulatoryBody}
                      otherValue={lic.regulatorOther || ''}
                      onOtherChange={(txt) => updateLicense(idx, 'regulatorOther', txt)}
                      onChange={(val) => {
                        updateLicense(idx, 'regulatorCode', val);
                        updateLicense(idx, 'regulatoryBody', val);
                      }}
                      placeholder="Select regulator..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-navy">
                      License / Authorisation Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      required
                      value={lic.licenseNumber}
                      onChange={(e) => updateLicense(idx, 'licenseNumber', e.target.value)}
                      placeholder="e.g. 684307 / AFSL 414530"
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
                    />
                  </div>

                  <div className="space-y-1">
                    <OptionSelect
                      group="LICENSE_STATUS"
                      label="License Status"
                      disabled={isReadOnly}
                      value={lic.licenseStatus || 'ACTIVE'}
                      onChange={(val) => updateLicense(idx, 'licenseStatus', val)}
                      placeholder="Select license status..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-navy">Official Registry Verification Link</label>
                    <input
                      disabled={isReadOnly}
                      type="url"
                      value={lic.proofLink || ''}
                      onChange={(e) => updateLicense(idx, 'proofLink', e.target.value)}
                      placeholder="https://register.fca.org.uk/..."
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-navy">Entity Address under License</label>
                    <input
                      disabled={isReadOnly}
                      type="text"
                      value={lic.companyAddress || ''}
                      onChange={(e) => updateLicense(idx, 'companyAddress', e.target.value)}
                      placeholder="Registered legal corporate address with regulator"
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
                    />
                  </div>
                </div>

                {/* Document Uploads for License */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                  {/* License PDF */}
                  <div className="p-3 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="text-[11px] font-bold text-navy flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue" />
                        Official License PDF
                      </div>
                      <div className="text-[10px] text-text-muted truncate">
                        {lic.licensePdfUrl ? (
                          <a
                            href={lic.licensePdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue underline font-bold"
                          >
                            View Document
                          </a>
                        ) : (
                          'No document uploaded'
                        )}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <label className="px-3 py-1.5 rounded-full bg-white border border-border text-navy text-[11px] font-bold hover:bg-surface-tint cursor-pointer transition shrink-0">
                        {uploadingField === `license-pdf-${idx}` ? 'Uploading...' : 'Upload PDF'}
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await onUploadPdf(file, idx);
                              if (url) updateLicense(idx, 'licensePdfUrl', url);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Proof Screenshot */}
                  <div className="p-3 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="text-[11px] font-bold text-navy flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Registry Certificate Proof
                      </div>
                      <div className="text-[10px] text-text-muted truncate">
                        {lic.proofUrl ? (
                          <a
                            href={lic.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue underline font-bold"
                          >
                            View Image
                          </a>
                        ) : (
                          'No image uploaded'
                        )}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <label className="px-3 py-1.5 rounded-full bg-white border border-border text-navy text-[11px] font-bold hover:bg-surface-tint cursor-pointer transition shrink-0">
                        {uploadingField === `license-proof-${idx}` ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await onUploadProof(file, idx);
                              if (url) updateLicense(idx, 'proofUrl', url);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 4. BOARD MEMBERS & HEAD OFFICE */
function StepBoardHeadOffice({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onUploadBoardPhoto,
  uploadingField,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onUploadBoardPhoto: (file: File, idx: number) => Promise<string | null>;
  uploadingField: string | null;
}) {
  const [formData, setFormData] = useState({
    headquarters: broker.headquarters || '',
    officeContactNumber: broker.officeContactNumber || '',
    officeContactEmail: broker.officeContactEmail || '',
    boardMembers: (broker.boardMembers && broker.boardMembers.length > 0
      ? broker.boardMembers
      : [
          { fullName: 'Tamás Szabó', position: 'Group CEO', photoUrl: '', sortOrder: 0 },
          { fullName: 'Campbell MacPherson', position: 'Chief Operating Officer', photoUrl: '', sortOrder: 1 },
        ]) as any[],
  });

  const addMember = () => {
    setFormData({
      ...formData,
      boardMembers: [
        ...formData.boardMembers,
        { fullName: '', position: 'Director', photoUrl: '', sortOrder: formData.boardMembers.length },
      ],
    });
  };

  const removeMember = (idx: number) => {
    setFormData({
      ...formData,
      boardMembers: formData.boardMembers.filter((_, i) => i !== idx),
    });
  };

  const updateMember = (idx: number, field: string, val: any) => {
    const updated = [...formData.boardMembers];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, boardMembers: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Headquarters City & Country</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.headquarters}
            onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="e.g. Melbourne, Australia"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Office Desk Direct Phone</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.officeContactNumber}
            onChange={(e) => setFormData({ ...formData, officeContactNumber: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="+61 3 9020 0155"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Executive Office Desk Email</label>
          <input
            disabled={isReadOnly}
            type="email"
            value={formData.officeContactEmail}
            onChange={(e) => setFormData({ ...formData, officeContactEmail: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="exec@broker.com"
          />
        </div>
      </div>

      {/* Board Members Repeater */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-navy tracking-wider">
              Board of Directors & Key Executives
            </h3>
            <p className="text-[11px] text-text-muted">Display executive leadership team for trust and transparency.</p>
          </div>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={addMember}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Executive
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.boardMembers.map((member, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-border bg-surface-tint/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-navy">Executive #{idx + 1}</span>
                {formData.boardMembers.length > 1 && (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => removeMember(idx)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  disabled={isReadOnly}
                  type="text"
                  required
                  value={member.fullName}
                  onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
                <input
                  disabled={isReadOnly}
                  type="text"
                  required
                  value={member.position}
                  onChange={(e) => updateMember(idx, 'position', e.target.value)}
                  placeholder="Position (e.g. Managing Director)"
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-text-muted truncate">
                    {member.photoUrl ? 'Photo Uploaded ✓' : 'No photo uploaded'}
                  </span>
                  {!isReadOnly && (
                    <label className="px-2.5 py-1 rounded-full bg-white border border-border text-navy text-[10px] font-bold hover:bg-surface-tint cursor-pointer transition">
                      {uploadingField === `board-photo-${idx}` ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await onUploadBoardPhoto(file, idx);
                            if (url) updateMember(idx, 'photoUrl', url);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 5. CUSTOMER SUPPORT & RESTRICTIONS */
function StepSupportRestrictions({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [formData, setFormData] = useState({
    countryRestrictions: broker.countryRestrictions || ['United States', 'Canada', 'Iran', 'North Korea'],
    supportPhone: broker.supportPhone || '+61 3 9020 0155',
    supportWhatsapp: broker.supportWhatsapp || '+61 400 000 000',
    supportEmail: broker.supportEmail || 'support@broker.com',
    supportAvailability: broker.supportAvailability || '24/7 (Live Chat & Phone)',
    languagesSupported: broker.languagesSupported || ['English', 'Spanish', 'Chinese', 'Arabic', 'German'],
    availableTimeframes: broker.availableTimeframes || ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W', '1MN'],
  });

  const [newRestriction, setNewRestriction] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const addRestriction = () => {
    if (newRestriction.trim() && !formData.countryRestrictions.includes(newRestriction.trim())) {
      setFormData({
        ...formData,
        countryRestrictions: [...formData.countryRestrictions, newRestriction.trim()],
      });
      setNewRestriction('');
    }
  };

  const removeRestriction = (item: string) => {
    setFormData({
      ...formData,
      countryRestrictions: formData.countryRestrictions.filter((r) => r !== item),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languagesSupported.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languagesSupported: [...formData.languagesSupported, newLanguage.trim()],
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (item: string) => {
    setFormData({
      ...formData,
      languagesSupported: formData.languagesSupported.filter((l) => l !== item),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Customer Support Helpline</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.supportPhone}
            onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="+1 800 ..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Official Support WhatsApp</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.supportWhatsapp}
            onChange={(e) => setFormData({ ...formData, supportWhatsapp: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="+44 7 ..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Helpdesk Email Address</label>
          <input
            disabled={isReadOnly}
            type="email"
            value={formData.supportEmail}
            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="support@broker.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Support Hours / SLA</label>
          <input
            disabled={isReadOnly}
            type="text"
            value={formData.supportAvailability}
            onChange={(e) => setFormData({ ...formData, supportAvailability: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
            placeholder="24/5 or 24/7"
          />
        </div>
      </div>

      {/* Languages Supported */}
      <div className="space-y-2 pt-2 border-t border-border">
        <OptionSelect
          group="LANGUAGE"
          mode="multiple"
          label="Customer Support Languages"
          disabled={isReadOnly}
          value={formData.languagesSupported}
          onChange={(val) => setFormData({ ...formData, languagesSupported: val })}
          placeholder="Select or search supported languages (133 languages)..."
          helperText="Select all languages supported across live chat, phone, and ticketing."
        />
      </div>

      {/* Available Timeframes */}
      <div className="space-y-2 pt-2 border-t border-border">
        <OptionSelect
          group="TIMEFRAME"
          mode="multiple"
          label="Supported Charting Timeframes"
          disabled={isReadOnly}
          value={formData.availableTimeframes}
          onChange={(val) => setFormData({ ...formData, availableTimeframes: val })}
          placeholder="Select supported chart timeframes (e.g. 1M, 5M, 1H, 1D)..."
          helperText="Standard charting intervals available in your trading platforms."
        />
      </div>

      {/* Country Restrictions */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-bold text-navy">Restricted Countries / Jurisdictions (Non-Serviced)</label>
        <div className="flex flex-wrap gap-2 items-center">
          {formData.countryRestrictions.map((c) => (
            <span
              key={c}
              className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
            >
              {c}
              {!isReadOnly && (
                <button type="button" onClick={() => removeRestriction(c)} className="hover:text-rose-900">
                  ×
                </button>
              )}
            </span>
          ))}
          {!isReadOnly && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="Add country..."
                className="px-3 py-1 rounded-full border border-border text-xs text-navy focus:outline-none focus:border-blue w-28"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRestriction();
                  }
                }}
              />
              <button
                type="button"
                onClick={addRestriction}
                className="p-1 rounded-full bg-surface-tint border border-border text-navy text-xs hover:bg-border"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 6. FUNDS SECURITY & RETAIL RISK METRICS */
function StepFundsSecurityLoss({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [formData, setFormData] = useState({
    clientLossPercentage: broker.clientLossPercentage ?? 72.8,
    fundsSecurity:
      broker.fundsSecurity ||
      'All retail client funds are held in segregated trust accounts with Tier-1 banks (e.g. Barclays, National Australia Bank). Independent audits conducted by Ernst & Young.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Retail Client Loss % */}
      <div className="space-y-2 p-5 rounded-3xl bg-surface-tint border border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase text-navy tracking-wider">
            Statutory Retail Investor Loss Percentage (%)
          </label>
          <span className="text-base font-black text-rose-600">{formData.clientLossPercentage}%</span>
        </div>
        <p className="text-[11px] text-text-muted">
          Mandatory regulatory disclosure metric showing the percentage of retail investor accounts that lose money
          when trading CFDs with your provider. (Private compliance audit metric).
        </p>
        <div className="flex items-center gap-4 pt-2">
          <input
            disabled={isReadOnly}
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={formData.clientLossPercentage}
            onChange={(e) => setFormData({ ...formData, clientLossPercentage: parseFloat(e.target.value) || 0 })}
            className="w-full accent-blue"
          />
          <input
            disabled={isReadOnly}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={formData.clientLossPercentage}
            onChange={(e) => setFormData({ ...formData, clientLossPercentage: parseFloat(e.target.value) || 0 })}
            className="w-20 px-2 py-1.5 rounded-xl border border-border text-xs font-bold text-navy text-center"
          />
        </div>
      </div>

      {/* Funds Security Policy */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-navy">Client Funds Segregation & Custodian Trust Security</label>
        <textarea
          disabled={isReadOnly}
          rows={5}
          value={formData.fundsSecurity}
          onChange={(e) => setFormData({ ...formData, fundsSecurity: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          placeholder="Specify custodian banks, statutory compensation schemes (e.g. FSCS up to £85,000 / ICF up to €20,000), and segregation arrangements."
        />
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 7. ACCOUNT GROUPS & TRADING CONDITIONS */
function StepAccountGroups({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onUploadSchedule,
  uploadingField,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onUploadSchedule: (file: File, key: string) => Promise<string | null>;
  uploadingField: string | null;
}) {
  const [accountGroups, setAccountGroups] = useState<any[]>(
    broker.accountGroups && broker.accountGroups.length > 0
      ? broker.accountGroups
      : [
          {
            name: 'Standard Account',
            demoAvailable: true,
            currency: 'USD',
            spreadTypesLabel: 'Variable from 1.0 pips',
            spreadFrom: '1.0 pips',
            minDeposit: 0,
            depositBonusPctUpTo: 0,
            leverageUpTo: '1:500',
            leverageNum: 500,
            minTradeVolume: 0.01,
            hasCommissionPerLot: false,
            feesPerLot: '$0',
            spreadType: 'VARIABLE',
            orderTypes: ['Market Order', 'Limit Order', 'Stop Order'],
            swapFree: false,
            orderExecution: 'MARKET',
            gtcMode: 'HOLD_WEEKEND',
            eaAllowed: true,
            hedgingAllowed: true,
            nettingAllowed: false,
            scalpingAllowed: true,
            hasSwapCharges: true,
            slippage: true,
            forexCommission: '$0',
            cryptoCommission: '0.1%',
            testLogin: '',
            testPassword: '',
            testServer: '',
            sortOrder: 0,
          },
        ]
  );

  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  const addGroup = () => {
    const newIdx = accountGroups.length;
    setAccountGroups([
      ...accountGroups,
      {
        name: `Razor / ECN Account ${newIdx + 1}`,
        demoAvailable: true,
        currency: 'USD',
        spreadTypesLabel: 'Raw spread from 0.0 pips',
        spreadFrom: '0.0 pips',
        minDeposit: 200,
        depositBonusPctUpTo: 0,
        leverageUpTo: '1:500',
        leverageNum: 500,
        minTradeVolume: 0.01,
        hasCommissionPerLot: true,
        feesPerLot: '$3.50 per side',
        spreadType: 'RAW',
        orderTypes: ['Market Order', 'Limit Order', 'Stop Order'],
        swapFree: false,
        orderExecution: 'MARKET',
        gtcMode: 'HOLD_WEEKEND',
        eaAllowed: true,
        hedgingAllowed: true,
        nettingAllowed: false,
        scalpingAllowed: true,
        hasSwapCharges: true,
        slippage: true,
        forexCommission: '$7.00 round turn',
        testLogin: '',
        testPassword: '',
        testServer: '',
        sortOrder: newIdx,
      },
    ]);
    setActiveGroupIdx(newIdx);
  };

  const removeGroup = (idx: number) => {
    if (accountGroups.length <= 1) return;
    setAccountGroups(accountGroups.filter((_, i) => i !== idx));
    setActiveGroupIdx((prev) => Math.max(0, prev - 1));
  };

  const updateCurrent = (field: string, val: any) => {
    const updated = [...accountGroups];
    updated[activeGroupIdx] = { ...updated[activeGroupIdx], [field]: val };
    setAccountGroups(updated);
  };

  const currentGroup = accountGroups[activeGroupIdx] || accountGroups[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ accountGroups });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[80%]">
          {accountGroups.map((g, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setActiveGroupIdx(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                activeGroupIdx === idx
                  ? 'bg-blue text-white shadow-sm'
                  : 'bg-surface-tint text-navy border border-border hover:border-blue'
              }`}
            >
              {g.name || `Account #${idx + 1}`}
            </button>
          ))}
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addGroup}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        )}
      </div>

      {/* Active Account Group Details */}
      <div className="p-5 rounded-3xl border border-border bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-navy">{currentGroup.name || 'Account Type'}</h3>
          {accountGroups.length > 1 && !isReadOnly && (
            <button
              type="button"
              onClick={() => removeGroup(activeGroupIdx)}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Group
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Account Group Name</label>
            <input
              disabled={isReadOnly}
              type="text"
              required
              value={currentGroup.name || ''}
              onChange={(e) => updateCurrent('name', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="space-y-1">
            <OptionSelect
              group="CURRENCY"
              label="Base Currency"
              disabled={isReadOnly}
              value={currentGroup.currencyCode || currentGroup.currency || 'USD'}
              otherValue={currentGroup.currencyOther || ''}
              onOtherChange={(txt) => updateCurrent('currencyOther', txt)}
              onChange={(val) => {
                updateCurrent('currencyCode', val);
                updateCurrent('currency', val);
              }}
              placeholder="Select currency..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Spread Model</label>
            <select
              disabled={isReadOnly}
              value={currentGroup.spreadType || 'VARIABLE'}
              onChange={(e) => updateCurrent('spreadType', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            >
              {SPREAD_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Spreads From</label>
            <input
              disabled={isReadOnly}
              type="text"
              value={currentGroup.spreadFrom || '0.0 pips'}
              onChange={(e) => updateCurrent('spreadFrom', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Minimum Initial Deposit (USD)</label>
            <input
              disabled={isReadOnly}
              type="number"
              value={currentGroup.minDeposit ?? 0}
              onChange={(e) => updateCurrent('minDeposit', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="space-y-1">
            <OptionSelect
              group="LEVERAGE"
              label="Max Leverage Ratio"
              disabled={isReadOnly}
              value={currentGroup.leverageCode || currentGroup.leverageUpTo || '1:500'}
              onChange={(val) => {
                updateCurrent('leverageCode', val);
                updateCurrent('leverageUpTo', val);
              }}
              placeholder="Select leverage ratio..."
            />
          </div>

          <div className="space-y-1">
            <OptionSelect
              group="DEPOSIT_BONUS"
              label="Deposit Bonus Promotion"
              disabled={isReadOnly}
              value={currentGroup.depositBonusCode || ''}
              onChange={(val) => {
                updateCurrent('depositBonusCode', val);
              }}
              placeholder="Select bonus tier..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Commission Per Lot</label>
            <input
              disabled={isReadOnly}
              type="text"
              value={currentGroup.feesPerLot || '$0'}
              onChange={(e) => updateCurrent('feesPerLot', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">Order Execution Model</label>
            <select
              disabled={isReadOnly}
              value={currentGroup.orderExecution || 'MARKET'}
              onChange={(e) => updateCurrent('orderExecution', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            >
              {ORDER_EXECUTIONS.map((oe) => (
                <option key={oe.value} value={oe.value}>
                  {oe.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-navy">GTC (Good Till Cancelled) Mode</label>
            <select
              disabled={isReadOnly}
              value={currentGroup.gtcMode || 'HOLD_WEEKEND'}
              onChange={(e) => updateCurrent('gtcMode', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            >
              {GTC_MODES.map((gtc) => (
                <option key={gtc.value} value={gtc.value}>
                  {gtc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Strategy Permissions Toggles */}
        <div className="pt-2 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'eaAllowed', label: 'EAs / Algos Allowed' },
            { key: 'hedgingAllowed', label: 'Hedging Allowed' },
            { key: 'scalpingAllowed', label: 'Scalping Allowed' },
            { key: 'swapFree', label: 'Islamic / Swap-Free Option' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-tint border border-border text-xs font-semibold text-navy cursor-pointer"
            >
              <input
                disabled={isReadOnly}
                type="checkbox"
                checked={currentGroup[item.key] === true}
                onChange={(e) => updateCurrent(item.key, e.target.checked)}
                className="text-blue rounded"
              />
              {item.label}
            </label>
          ))}
        </div>

        {/* Compliance Test Account Credentials (Strictly Private) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
              Compliance Test Demo Account (Strictly Private • AES-256 Encrypted)
            </h4>
          </div>
          <p className="text-[11px] text-amber-800">
            Provide a working read-only demo or live test login for EdutradeFX verification officers to check spreads,
            execution speed, and server conditions. Passwords are never published publicly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <input
              disabled={isReadOnly}
              type="text"
              value={currentGroup.testLogin || ''}
              onChange={(e) => updateCurrent('testLogin', e.target.value)}
              placeholder="Test Login / Account Number"
              className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="text"
              value={currentGroup.testPassword || ''}
              onChange={(e) => updateCurrent('testPassword', e.target.value)}
              placeholder="Test Password (Read-Only / Investor)"
              className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="text"
              value={currentGroup.testServer || ''}
              onChange={(e) => updateCurrent('testServer', e.target.value)}
              placeholder="Server (e.g. Pepperstone-Demo01)"
              className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ accountGroups })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 8. INTRODUCING BROKER (IB) PROGRAM */
function StepIbProgram({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [ibPlans, setIbPlans] = useState<any[]>(
    broker.ibPlans && broker.ibPlans.length > 0
      ? broker.ibPlans
      : [
          {
            planName: 'Standard Partner IB',
            commissionPerLot: '$3.00 per lot',
            rebatePercentage: 50,
            subIbCommission: '10% on 2nd Tier',
            settlementCycle: 'DAILY',
            notes: 'Automated real-time multi-tier rebate portal with dynamic tracking links.',
            sortOrder: 0,
          },
        ]
  );

  const addPlan = () => {
    setIbPlans([
      ...ibPlans,
      {
        planName: 'VIP Affiliate Partner',
        commissionPerLot: '$5.00 per lot',
        rebatePercentage: 65,
        subIbCommission: '15%',
        settlementCycle: 'WEEKLY',
        notes: '',
        sortOrder: ibPlans.length,
      },
    ]);
  };

  const removePlan = (idx: number) => {
    setIbPlans(ibPlans.filter((_, i) => i !== idx));
  };

  const updatePlan = (idx: number, field: string, val: any) => {
    const updated = [...ibPlans];
    updated[idx] = { ...updated[idx], [field]: val };
    setIbPlans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ ibPlans });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">
            Introducing Broker & Affiliate Reward Plans
          </h3>
          <p className="text-[11px] text-text-muted">Itemize compensation schemes for educators, signal channels, and IBs.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addPlan}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Plan
          </button>
        )}
      </div>

      <div className="space-y-4">
        {ibPlans.map((plan, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-border bg-surface-tint/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-navy">Plan #{idx + 1}</span>
              {ibPlans.length > 1 && !isReadOnly && (
                <button type="button" onClick={() => removePlan(idx)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy">Plan Name</label>
                <input
                  disabled={isReadOnly}
                  type="text"
                  required
                  value={plan.planName}
                  onChange={(e) => updatePlan(idx, 'planName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy">Commission Per Lot</label>
                <input
                  disabled={isReadOnly}
                  type="text"
                  value={plan.commissionPerLot || ''}
                  onChange={(e) => updatePlan(idx, 'commissionPerLot', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy">Settlement Cycle</label>
                <select
                  disabled={isReadOnly}
                  value={plan.settlementCycle || 'DAILY'}
                  onChange={(e) => updatePlan(idx, 'settlementCycle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                >
                  {IB_SETTLEMENTS.map((ib) => (
                    <option key={ib.value} value={ib.value}>
                      {ib.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-3">
                <label className="text-[11px] font-bold text-navy">Notes & Tier Structure</label>
                <input
                  disabled={isReadOnly}
                  type="text"
                  value={plan.notes || ''}
                  onChange={(e) => updatePlan(idx, 'notes', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ ibPlans })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 9. DEPOSIT PAYMENT METHODS */
function StepDepositMethods({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [depositMethods, setDepositMethods] = useState<any[]>(
    broker.depositMethodItems && broker.depositMethodItems.length > 0
      ? broker.depositMethodItems
      : [
          { name: 'Bank Wire Transfer', currency: 'USD', feePct: 0, minDeposit: 50, processingTime: '1-3 Business Days' },
          { name: 'Visa / MasterCard', currency: 'USD', feePct: 0, minDeposit: 10, processingTime: 'Instant' },
          { name: 'Cryptocurrency (USDT)', currency: 'USDT', feePct: 0, minDeposit: 20, processingTime: 'Instant (1-3 min)' },
        ]
  );

  const addMethod = () => {
    setDepositMethods([
      ...depositMethods,
      { name: 'Skrill', currency: 'USD', feePct: 0, minDeposit: 10, processingTime: 'Instant', sortOrder: depositMethods.length },
    ]);
  };

  const removeMethod = (idx: number) => {
    setDepositMethods(depositMethods.filter((_, i) => i !== idx));
  };

  const updateMethod = (idx: number, field: string, val: any) => {
    const updated = [...depositMethods];
    updated[idx] = { ...updated[idx], [field]: val };
    setDepositMethods(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ depositMethods });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Deposit Payment Gateways</h3>
          <p className="text-[11px] text-text-muted">Funding rails, fee percentages, and processing speed.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addMethod}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Method
          </button>
        )}
      </div>

      <div className="space-y-3">
        {depositMethods.map((m, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="w-full md:w-1/4">
              <input
                disabled={isReadOnly}
                type="text"
                required
                value={m.name}
                onChange={(e) => updateMethod(idx, 'name', e.target.value)}
                placeholder="Method Name"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/6">
              <input
                disabled={isReadOnly}
                type="text"
                value={m.currency || 'USD'}
                onChange={(e) => updateMethod(idx, 'currency', e.target.value)}
                placeholder="Currency"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/6">
              <input
                disabled={isReadOnly}
                type="number"
                value={m.feePct ?? 0}
                onChange={(e) => updateMethod(idx, 'feePct', parseFloat(e.target.value) || 0)}
                placeholder="Fee %"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/4">
              <input
                disabled={isReadOnly}
                type="text"
                value={m.processingTime || ''}
                onChange={(e) => updateMethod(idx, 'processingTime', e.target.value)}
                placeholder="Time (e.g. Instant)"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            {depositMethods.length > 1 && !isReadOnly && (
              <button
                type="button"
                onClick={() => removeMethod(idx)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ depositMethods })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 10. WITHDRAWAL PAYMENT METHODS */
function StepWithdrawalMethods({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [withdrawalMethods, setWithdrawalMethods] = useState<any[]>(
    broker.withdrawalMethodItems && broker.withdrawalMethodItems.length > 0
      ? broker.withdrawalMethodItems
      : [
          { name: 'Bank Wire Transfer', currency: 'USD', feePct: 0, minWithdrawal: 100, processingTime: '1-3 Business Days' },
          { name: 'Visa / MasterCard', currency: 'USD', feePct: 0, minWithdrawal: 20, processingTime: '1-3 Business Days' },
          { name: 'Cryptocurrency (USDT)', currency: 'USDT', feePct: 0, minWithdrawal: 50, processingTime: 'Within 2 Hours' },
        ]
  );

  const addMethod = () => {
    setWithdrawalMethods([
      ...withdrawalMethods,
      { name: 'Skrill', currency: 'USD', feePct: 0, minWithdrawal: 20, processingTime: 'Instant', sortOrder: withdrawalMethods.length },
    ]);
  };

  const removeMethod = (idx: number) => {
    setWithdrawalMethods(withdrawalMethods.filter((_, i) => i !== idx));
  };

  const updateMethod = (idx: number, field: string, val: any) => {
    const updated = [...withdrawalMethods];
    updated[idx] = { ...updated[idx], [field]: val };
    setWithdrawalMethods(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ withdrawalMethods });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Withdrawal Rails & SLA</h3>
          <p className="text-[11px] text-text-muted">Cashout options, minimums, fees, and execution timeframe.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addMethod}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Method
          </button>
        )}
      </div>

      <div className="space-y-3">
        {withdrawalMethods.map((m, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="w-full md:w-1/4">
              <input
                disabled={isReadOnly}
                type="text"
                required
                value={m.name}
                onChange={(e) => updateMethod(idx, 'name', e.target.value)}
                placeholder="Method Name"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/6">
              <input
                disabled={isReadOnly}
                type="text"
                value={m.currency || 'USD'}
                onChange={(e) => updateMethod(idx, 'currency', e.target.value)}
                placeholder="Currency"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/6">
              <input
                disabled={isReadOnly}
                type="number"
                value={m.minWithdrawal ?? 0}
                onChange={(e) => updateMethod(idx, 'minWithdrawal', parseFloat(e.target.value) || 0)}
                placeholder="Min USD"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/4">
              <input
                disabled={isReadOnly}
                type="text"
                value={m.processingTime || ''}
                onChange={(e) => updateMethod(idx, 'processingTime', e.target.value)}
                placeholder="Processing Time"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            {withdrawalMethods.length > 1 && !isReadOnly && (
              <button
                type="button"
                onClick={() => removeMethod(idx)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ withdrawalMethods })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 11. TRADABLE SYMBOL SPECIFICATIONS */
function StepSymbolSpecs({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [symbolSpecs, setSymbolSpecs] = useState<any[]>(
    broker.symbolSpecs && broker.symbolSpecs.length > 0
      ? broker.symbolSpecs
      : [
          { symbol: 'EURUSD', category: 'Forex Major', contractSize: '100,000', spreadAvg: '0.1 pips', stopDistance: '0.0', precision: 5 },
          { symbol: 'GBPUSD', category: 'Forex Major', contractSize: '100,000', spreadAvg: '0.4 pips', stopDistance: '0.0', precision: 5 },
          { symbol: 'XAUUSD', category: 'Metals', contractSize: '100 oz', spreadAvg: '1.2 pips', stopDistance: '0.0', precision: 2 },
          { symbol: 'BTCUSD', category: 'Crypto', contractSize: '1 BTC', spreadAvg: '$15.0', stopDistance: '0.0', precision: 2 },
        ]
  );

  const addSpec = () => {
    setSymbolSpecs([
      ...symbolSpecs,
      { symbol: 'US30', category: 'Indices', contractSize: '1', spreadAvg: '1.5 pts', stopDistance: '0.0', precision: 1, sortOrder: symbolSpecs.length },
    ]);
  };

  const removeSpec = (idx: number) => {
    setSymbolSpecs(symbolSpecs.filter((_, i) => i !== idx));
  };

  const updateSpec = (idx: number, field: string, val: any) => {
    const updated = [...symbolSpecs];
    updated[idx] = { ...updated[idx], [field]: val };
    setSymbolSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ symbolSpecs });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Tradable Symbol Specifications</h3>
          <p className="text-[11px] text-text-muted">Representative benchmark pairs (normalized e.g. EURUSD, XAUUSD).</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addSpec}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Symbol
          </button>
        )}
      </div>

      <div className="space-y-3">
        {symbolSpecs.map((s, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-center"
          >
            <input
              disabled={isReadOnly}
              type="text"
              required
              value={s.symbol}
              onChange={(e) => updateSpec(idx, 'symbol', e.target.value)}
              placeholder="Symbol"
              className="px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy font-bold focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="text"
              value={s.category || ''}
              onChange={(e) => updateSpec(idx, 'category', e.target.value)}
              placeholder="Category"
              className="px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="text"
              value={s.contractSize || ''}
              onChange={(e) => updateSpec(idx, 'contractSize', e.target.value)}
              placeholder="Contract Size"
              className="px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="text"
              value={s.spreadAvg || ''}
              onChange={(e) => updateSpec(idx, 'spreadAvg', e.target.value)}
              placeholder="Avg Spread"
              className="px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <input
              disabled={isReadOnly}
              type="number"
              value={s.precision ?? 5}
              onChange={(e) => updateSpec(idx, 'precision', parseInt(e.target.value) || 0)}
              placeholder="Decimals"
              className="px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            />
            <div className="flex justify-end">
              {symbolSpecs.length > 1 && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ symbolSpecs })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 12. DEALING & LIQUIDITY SETUP */
function StepDealingLiquidity({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [formData, setFormData] = useState({
    liquidityProvider: broker.liquidityProvider || 'Tier 1 Prime of Prime (J.P. Morgan, UBS, BNP Paribas, Citadel)',
    personalBookSize: broker.personalBookSize || 'Proprietary B-Book internal matching / A-Book STP aggregate hedge pool',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-navy">Tier-1 Liquidity Providers & Interbank Aggregators</label>
        <textarea
          disabled={isReadOnly}
          rows={3}
          value={formData.liquidityProvider}
          onChange={(e) => setFormData({ ...formData, liquidityProvider: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          placeholder="e.g. J.P. Morgan, Citi, Barclays, XTX Markets, Flow Traders"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-navy">Personal / Proprietary Dealing Book Architecture</label>
        <textarea
          disabled={isReadOnly}
          rows={3}
          value={formData.personalBookSize}
          onChange={(e) => setFormData({ ...formData, personalBookSize: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          placeholder="Details on risk management framework, internal hedging percentage, and DMA routing."
        />
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 13. PRIMARY BUSINESS REGIONS */
function StepBusinessAreas({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [businessAreas, setBusinessAreas] = useState<any[]>(
    broker.businessAreas && broker.businessAreas.length > 0
      ? broker.businessAreas
      : [
          { countryOrRegion: 'United Kingdom & Europe (EEA)', clientsNote: '38% of active accounts' },
          { countryOrRegion: 'Asia-Pacific (APAC)', clientsNote: '42% of active accounts' },
          { countryOrRegion: 'Middle East & North Africa (MENA)', clientsNote: '20% of active accounts' },
        ]
  );

  const addArea = () => {
    setBusinessAreas([
      ...businessAreas,
      { countryOrRegion: 'Latin America (LATAM)', clientsNote: '', sortOrder: businessAreas.length },
    ]);
  };

  const removeArea = (idx: number) => {
    setBusinessAreas(businessAreas.filter((_, i) => i !== idx));
  };

  const updateArea = (idx: number, field: string, val: any) => {
    const updated = [...businessAreas];
    updated[idx] = { ...updated[idx], [field]: val };
    setBusinessAreas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ businessAreas });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Primary Regional Footprint</h3>
          <p className="text-[11px] text-text-muted">Jurisdictions and geographic concentrations of retail flow.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addArea}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Region
          </button>
        )}
      </div>

      <div className="space-y-3">
        {businessAreas.map((a, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="w-full md:w-1/2">
              <input
                disabled={isReadOnly}
                type="text"
                required
                value={a.countryOrRegion}
                onChange={(e) => updateArea(idx, 'countryOrRegion', e.target.value)}
                placeholder="Country or Geographic Region"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="w-full md:w-1/2 flex items-center gap-2">
              <input
                disabled={isReadOnly}
                type="text"
                value={a.clientsNote || ''}
                onChange={(e) => updateArea(idx, 'clientsNote', e.target.value)}
                placeholder="Clients Note (e.g. 35% of total retail base)"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
              {businessAreas.length > 1 && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeArea(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ businessAreas })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 14. ANNUAL FUNDING & TURNOVER VOLUMES (STRICTLY PRIVATE) */
function StepFundingVolume({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [fundingYears, setFundingYears] = useState<any[]>(
    broker.fundingYears && broker.fundingYears.length > 0
      ? broker.fundingYears
      : [
          { year: 2024, netDepositUsd: 150000000, netWithdrawUsd: 110000000, netLots: 18500000 },
          { year: 2025, netDepositUsd: 210000000, netWithdrawUsd: 155000000, netLots: 24200000 },
        ]
  );

  const addYear = () => {
    const nextYear = new Date().getFullYear();
    setFundingYears([
      ...fundingYears,
      { year: nextYear, netDepositUsd: 0, netWithdrawUsd: 0, netLots: 0, sortOrder: fundingYears.length },
    ]);
  };

  const removeYear = (idx: number) => {
    setFundingYears(fundingYears.filter((_, i) => i !== idx));
  };

  const updateYear = (idx: number, field: string, val: any) => {
    const updated = [...fundingYears];
    updated[idx] = { ...updated[idx], [field]: val };
    setFundingYears(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ fundingYears });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Strictly Confidential Compliance Data:</strong> Financial figures entered here are visible strictly to
          EdutradeFX administrative auditors and broker leadership. They are never published on the public broker comparison.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase text-navy tracking-wider">Audited Financial History</h3>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addYear}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Year
          </button>
        )}
      </div>

      <div className="space-y-3">
        {fundingYears.map((fy, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 grid grid-cols-2 md:grid-cols-5 gap-3 items-center"
          >
            <div>
              <label className="text-[10px] font-bold text-navy">Year</label>
              <input
                disabled={isReadOnly}
                type="number"
                value={fy.year}
                onChange={(e) => updateYear(idx, 'year', parseInt(e.target.value) || 2024)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy font-bold focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy">Net Deposits (USD)</label>
              <input
                disabled={isReadOnly}
                type="number"
                value={fy.netDepositUsd ?? 0}
                onChange={(e) => updateYear(idx, 'netDepositUsd', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy">Net Withdrawals (USD)</label>
              <input
                disabled={isReadOnly}
                type="number"
                value={fy.netWithdrawUsd ?? 0}
                onChange={(e) => updateYear(idx, 'netWithdrawUsd', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-navy">Volume (Total Lots)</label>
              <input
                disabled={isReadOnly}
                type="number"
                value={fy.netLots ?? 0}
                onChange={(e) => updateYear(idx, 'netLots', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="flex justify-end pt-3">
              {fundingYears.length > 1 && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeYear(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ fundingYears })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 15. AVERAGE CLIENT ACTIVITY (STRICTLY PRIVATE) */
function StepClientActivity({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [formData, setFormData] = useState({
    avgNewClientDeposit: broker.clientActivity?.avgNewClientDeposit ?? 850,
    avgExistingClientDeposit: broker.clientActivity?.avgExistingClientDeposit ?? 2400,
    avgNewClientWithdrawal: broker.clientActivity?.avgNewClientWithdrawal ?? 420,
    avgExistingClientWithdrawal: broker.clientActivity?.avgExistingClientWithdrawal ?? 1900,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Private Benchmark Averages:</strong> Ticket sizes are used solely to categorize your broker account
          profile (Micro / Standard / Institutional Prime) and are strictly concealed from public profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Average New Client First Deposit (USD)</label>
          <input
            disabled={isReadOnly}
            type="number"
            value={formData.avgNewClientDeposit}
            onChange={(e) => setFormData({ ...formData, avgNewClientDeposit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Average Existing Client Ongoing Deposit (USD)</label>
          <input
            disabled={isReadOnly}
            type="number"
            value={formData.avgExistingClientDeposit}
            onChange={(e) => setFormData({ ...formData, avgExistingClientDeposit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Average New Client First Withdrawal (USD)</label>
          <input
            disabled={isReadOnly}
            type="number"
            value={formData.avgNewClientWithdrawal}
            onChange={(e) => setFormData({ ...formData, avgNewClientWithdrawal: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Average Existing Client Ongoing Withdrawal (USD)</label>
          <input
            disabled={isReadOnly}
            type="number"
            value={formData.avgExistingClientWithdrawal}
            onChange={(e) => setFormData({ ...formData, avgExistingClientWithdrawal: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-navy focus:outline-none focus:border-blue"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 16. PLATFORM PROS & CONS */
function StepProsCons({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [prosList, setProsList] = useState<string[]>(
    broker.prosList && broker.prosList.length > 0
      ? broker.prosList
      : [
          'Raw spreads from 0.0 pips on EUR/USD',
          'Fast execution speeds under 30ms via Equinix LD4',
          'Multiple tier-1 regulatory licenses (FCA, ASIC, CySEC)',
        ]
  );
  const [consList, setConsList] = useState<string[]>(
    broker.consList && broker.consList.length > 0
      ? broker.consList
      : ['No US retail clients accepted', 'Phone support unavailable on weekends']
  );

  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const addPro = () => {
    if (newPro.trim()) {
      setProsList([...prosList, newPro.trim()]);
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setConsList([...consList, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ prosList, consList });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pros */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-navy flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Official Platform Advantages (Pros)
        </label>
        <div className="space-y-2">
          {prosList.map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-navy font-semibold flex items-center justify-between"
            >
              <span>• {p}</span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setProsList(prosList.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Add platform advantage..."
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPro();
                  }
                }}
              />
              <button
                type="button"
                onClick={addPro}
                className="px-4 py-2 rounded-xl bg-blue text-white text-xs font-bold hover:bg-blue-hover"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cons */}
      <div className="space-y-2.5 pt-2 border-t border-border">
        <label className="text-xs font-bold text-navy flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Transparent Trade-Offs / Limitations (Cons)
        </label>
        <div className="space-y-2">
          {consList.map((c, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-navy font-semibold flex items-center justify-between"
            >
              <span>• {c}</span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setConsList(consList.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Add platform trade-off..."
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCon();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCon}
                className="px-4 py-2 rounded-xl bg-blue text-white text-xs font-bold hover:bg-blue-hover"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ prosList, consList })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 17. INDUSTRY AWARDS & EXPOS */
function StepAwards({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
}) {
  const [awards, setAwards] = useState<any[]>(
    broker.awards && broker.awards.length > 0
      ? broker.awards
      : [
          { year: 2024, awardFor: 'Best Global Forex ECN Broker', expo: 'Finance Magnates London Summit', expoLocation: 'London, UK' },
          { year: 2023, awardFor: 'Best Overall Client Satisfaction', expo: 'Investment Trends Report', expoLocation: 'Sydney, Australia' },
        ]
  );

  const addAward = () => {
    setAwards([
      ...awards,
      { year: new Date().getFullYear(), awardFor: '', expo: '', expoLocation: '', sortOrder: awards.length },
    ]);
  };

  const removeAward = (idx: number) => {
    setAwards(awards.filter((_, i) => i !== idx));
  };

  const updateAward = (idx: number, field: string, val: any) => {
    const updated = [...awards];
    updated[idx] = { ...updated[idx], [field]: val };
    setAwards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ awards });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-navy tracking-wider">Industry Recognitions & Expo Awards</h3>
          <p className="text-[11px] text-text-muted">Honors bestowed at international summits.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={addAward}
            className="px-3 py-1.5 rounded-full border border-blue text-blue text-xs font-bold hover:bg-blue/10 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Award
          </button>
        )}
      </div>

      <div className="space-y-3">
        {awards.map((awd, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
          >
            <div>
              <input
                disabled={isReadOnly}
                type="number"
                value={awd.year}
                onChange={(e) => updateAward(idx, 'year', parseInt(e.target.value) || 2024)}
                placeholder="Year"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <input
                disabled={isReadOnly}
                type="text"
                required
                value={awd.awardFor}
                onChange={(e) => updateAward(idx, 'awardFor', e.target.value)}
                placeholder="Award Title (e.g. Best ECN Execution)"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                disabled={isReadOnly}
                type="text"
                value={awd.expo || ''}
                onChange={(e) => updateAward(idx, 'expo', e.target.value)}
                placeholder="Expo / Organiser"
                className="w-full px-3 py-2 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
              />
              {awards.length > 1 && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeAward(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ awards })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 18. SOCIAL LINKS & VIDEO PITCH */
function StepSocialVideo({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onUploadVideo,
  uploading,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onUploadVideo: (file: File) => Promise<string | null>;
  uploading: boolean;
}) {
  const [formData, setFormData] = useState({
    promoVideoUrl: broker.promoVideoUrl || '',
    socialLinks: broker.socialLinks || {
      twitter: 'https://twitter.com/example',
      linkedin: 'https://linkedin.com/company/example',
      youtube: 'https://youtube.com/@example',
      telegram: 'https://t.me/example',
    },
  });

  const updateSocial = (key: string, val: string) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [key]: val },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['twitter', 'linkedin', 'facebook', 'youtube', 'telegram', 'instagram'].map((network) => (
          <div key={network} className="space-y-1">
            <label className="text-[11px] font-bold text-navy capitalize">{network} Profile URL</label>
            <input
              disabled={isReadOnly}
              type="url"
              value={formData.socialLinks?.[network] || ''}
              onChange={(e) => updateSocial(network, e.target.value)}
              placeholder={`https://${network}.com/...`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
            />
          </div>
        ))}
      </div>

      {/* Video Pitch */}
      <div className="p-5 rounded-3xl bg-surface-tint border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-navy tracking-wider">Promotional Video Pitch</h4>
            <p className="text-[11px] text-text-muted">
              Embed a video link (YouTube / Vimeo / MP4 Cloudinary URL) showcasing your brokerage.
            </p>
          </div>
          {!isReadOnly && (
            <label className="px-4 py-2 rounded-full bg-white border border-border text-navy text-xs font-bold hover:bg-surface-tint cursor-pointer transition">
              {uploading ? 'Uploading MP4...' : 'Upload Video File'}
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await onUploadVideo(file);
                    if (url) setFormData({ ...formData, promoVideoUrl: url });
                  }
                }}
              />
            </label>
          )}
        </div>
        <input
          disabled={isReadOnly}
          type="url"
          value={formData.promoVideoUrl}
          onChange={(e) => setFormData({ ...formData, promoVideoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
        />
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave(formData)}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Save & Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 19. POLICIES & LEGAL DOCUMENTS */
function StepPoliciesLegal({
  broker,
  isReadOnly,
  saving,
  onSave,
  onNext,
  onUploadPolicyPdf,
  uploadingField,
}: {
  broker: Broker;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (data: any) => Promise<boolean>;
  onNext: () => void;
  onUploadPolicyPdf: (file: File, key: string) => Promise<string | null>;
  uploadingField: string | null;
}) {
  const existingDocs = broker.documents || [];

  const [policies, setPolicies] = useState<any[]>(
    POLICY_DOC_TYPES.map((p) => {
      const match = existingDocs.find((d) => d.docType === p.type);
      return {
        docType: p.type,
        label: p.label,
        isMandatory: p.isMandatory,
        fileUrl: match?.fileUrl || '',
        fileName: match?.fileName || '',
        isPrivate: false,
      };
    })
  );

  const updateDocUrl = (docType: BrokerDocType, url: string, name: string) => {
    setPolicies(
      policies.map((p) => (p.docType === docType ? { ...p, fileUrl: url, fileName: name } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ policies });
    if (ok) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 rounded-2xl bg-blue/10 border border-blue/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue shrink-0 mt-0.5" />
        <p className="text-xs text-navy">
          <strong>Mandatory Compliance Policies:</strong> Terms & Conditions, General Risk Disclosure, and AML/KYC
          Policy PDFs must be uploaded before submitting your application for approval.
        </p>
      </div>

      <div className="space-y-3.5">
        {policies.map((p) => (
          <div
            key={p.docType}
            className="p-4 rounded-2xl border border-border bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy">{p.label}</span>
                {p.isMandatory && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                    Mandatory
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                {p.fileUrl ? (
                  <a href={p.fileUrl} target="_blank" rel="noreferrer" className="text-blue underline font-bold">
                    View Uploaded Document ({p.fileName || 'PDF'})
                  </a>
                ) : (
                  'No PDF document attached'
                )}
              </div>
            </div>

            {!isReadOnly && (
              <label className="px-4 py-2 rounded-full bg-surface-tint border border-border text-navy text-xs font-bold hover:bg-blue hover:text-white cursor-pointer transition shrink-0">
                {uploadingField === `policy-${p.docType}` ? 'Uploading PDF...' : 'Upload PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await onUploadPolicyPdf(file, `policy-${p.docType}`);
                      if (url) updateDocUrl(p.docType, url, file.name);
                    }
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <button
          type="button"
          disabled={isReadOnly || saving}
          onClick={() => onSave({ policies })}
          className="px-5 py-2.5 rounded-full border border-border text-navy font-bold text-xs hover:bg-surface-tint flex items-center gap-2 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isReadOnly || saving}
          className="px-6 py-2.5 rounded-full bg-blue text-white font-bold text-xs hover:bg-blue-hover flex items-center gap-2 transition shadow-sm"
        >
          Review Checklist
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

/* 20. REVIEW & FINAL SUBMISSION */
function StepReviewSubmit({
  broker,
  submitting,
  onSubmit,
  onJumpToStep,
}: {
  broker: Broker;
  submitting: boolean;
  onSubmit: () => void;
  onJumpToStep: (stepIdx: number) => void;
}) {
  const docTypes = (broker.documents || []).map((d) => d.docType);

  // Mandatory checks
  const checks = [
    {
      label: 'Core Identity (Name, Operating Country, City, Email, Website)',
      passed: Boolean(broker.companyName && broker.country && broker.city && broker.email && broker.website),
      stepIdx: 0,
    },
    {
      label: 'Regulatory Information & Active License Proof',
      passed: broker.isRegulated === false || (broker.licenses && broker.licenses.length > 0),
      stepIdx: 2,
    },
    {
      label: 'At least 1 Trading Account Group configured',
      passed: Boolean(broker.accountGroups && broker.accountGroups.length > 0),
      stepIdx: 6,
    },
    {
      label: 'At least 1 Deposit Payment Gateway configured',
      passed: Boolean(broker.depositMethodItems && broker.depositMethodItems.length > 0),
      stepIdx: 8,
    },
    {
      label: 'At least 1 Withdrawal Payment Method configured',
      passed: Boolean(broker.withdrawalMethodItems && broker.withdrawalMethodItems.length > 0),
      stepIdx: 9,
    },
    {
      label: 'Mandatory Policy: Terms & Conditions PDF',
      passed: docTypes.includes('POLICY_TERMS'),
      stepIdx: 18,
    },
    {
      label: 'Mandatory Policy: Risk Disclosure Notice PDF',
      passed: docTypes.includes('POLICY_RISK_DISCLOSURE'),
      stepIdx: 18,
    },
    {
      label: 'Mandatory Policy: AML / KYC Regulations PDF',
      passed: docTypes.includes('POLICY_AML'),
      stepIdx: 18,
    },
  ];

  const allPassed = checks.every((c) => c.passed);
  const isSubmitted = broker.onboardingStatus === 'SUBMITTED';
  const isVerified = broker.onboardingStatus === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="p-6 rounded-3xl bg-surface-tint border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-black uppercase text-blue tracking-wider">Audit Readiness</span>
          <h3 className="text-2xl font-black text-navy mt-1">Completeness: {broker.completenessPct ?? 0}%</h3>
          <p className="text-xs text-text-muted mt-1">
            All mandatory compliance gates must be satisfied before the file is routed to our audit queue.
          </p>
        </div>

        {isVerified ? (
          <div className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Broker Application Verified & Live
          </div>
        ) : isSubmitted ? (
          <div className="px-5 py-3 rounded-2xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Under Administrative Review
          </div>
        ) : (
          <button
            disabled={!allPassed || submitting}
            onClick={onSubmit}
            className="px-8 py-3.5 rounded-full bg-blue text-white font-black text-xs hover:bg-blue-hover disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md flex items-center gap-2"
          >
            {submitting ? 'Submitting File...' : 'Submit Application for Compliance Review'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mandatory Gates Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-navy tracking-wider">Mandatory Compliance Audit Gates</h4>
        <div className="space-y-2">
          {checks.map((chk, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                chk.passed
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="text-xs font-bold">{chk.label}</span>
              </div>
              {!chk.passed && (
                <button
                  onClick={() => onJumpToStep(chk.stepIdx)}
                  className="px-3 py-1 rounded-full bg-white border border-rose-300 text-rose-700 text-[11px] font-bold hover:bg-rose-100 transition"
                >
                  Fix Item →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
