'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Shield,
  Radio,
  Clock,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Check,
  Eye,
  X,
  FileCheck,
  Info,
  ExternalLink,
  DollarSign,
  Plus,
  AlertTriangle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  SignalProvider,
  PartnerAgreement,
  PartnerAgreementAcceptance,
  SpUpdateFrequency,
  SpSubscriptionModel,
  SpPlanPeriod,
  StatementAccountType,
  SignalProviderPlan,
  SignalProviderDocument,
} from '@/types';
import { PhoneInput } from '@/components/common/PhoneInput';
import { MultiSelect } from '@/components/common/MultiSelect';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { Skeleton } from '@/components/common/Skeleton';
import { getAllCountriesOptions } from '@/lib/country-state-city';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, key: 'personal', title: 'Personal Information', desc: 'Identity & Contacts' },
  { id: 2, key: 'experience', title: 'Trading Experience', desc: 'Track Record & Style' },
  { id: 3, key: 'performance', title: 'Performance Metrics', desc: 'Self-Declared Returns' },
  { id: 4, key: 'risk', title: 'Risk Management', desc: 'Leverage, R:R & Martingale' },
  { id: 5, key: 'verification', title: 'Verification Documents', desc: 'KYC & 3-Month Statements' },
  { id: 6, key: 'principles', title: 'EdutradeFX Principles', desc: 'Core Commitments' },
  { id: 7, key: 'additional', title: 'Strategy & Pricing', desc: 'Methodology & Plans' },
  { id: 8, key: 'agreements', title: 'Terms & Agreements', desc: 'Required Compliance' },
  { id: 9, key: 'review', title: 'Declaration & Submit', desc: 'Final Verification' },
];

const INSTRUMENT_OPTIONS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY',
  'XAUUSD', 'XAGUSD', 'UKOIL', 'USOIL',
  'US30', 'NAS100', 'SPX500', 'GER40', 'UK100',
  'BTCUSD', 'ETHUSD', 'SOLUSD',
  'Apple (AAPL)', 'Tesla (TSLA)', 'Nvidia (NVDA)',
  'Other',
];

const TRADING_STYLE_OPTIONS = [
  { value: 'DAY_TRADER', label: 'Day Trader' },
  { value: 'SWING_TRADER', label: 'Swing Trader' },
  { value: 'SCALPER', label: 'Scalper' },
  { value: 'POSITION_TRADER', label: 'Position Trader' },
  { value: 'NEWS_TRADER', label: 'News-based Trader' },
  { value: 'ALGORITHMIC_TRADER', label: 'Algorithmic Trader' },
];

const TIMEFRAME_OPTIONS = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

const UPDATE_FREQUENCY_OPTIONS: { value: SpUpdateFrequency; label: string; desc: string }[] = [
  { value: 'PER_SIGNAL', label: 'Per Signal Event', desc: 'Immediate alert whenever an order is opened or updated' },
  { value: 'DAILY', label: 'Daily Briefing', desc: 'Morning session preview and end-of-day trade recap' },
  { value: 'WEEKLY', label: 'Weekly Outlook', desc: 'Comprehensive Sunday macro preview and open positions' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly Review', desc: 'Fortnightly performance and macro trend report' },
  { value: 'MONTHLY', label: 'Monthly Report', desc: 'Comprehensive monthly P&L and risk audit' },
];

const PLAN_PERIOD_OPTIONS: { value: SpPlanPeriod; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (3 Months)' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly (6 Months)' },
  { value: 'YEARLY', label: 'Yearly (12 Months)' },
  { value: 'ONE_TIME', label: 'One-Time Lifetime Access' },
];

function SignalProviderOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = isNaN(stepParam) || stepParam < 1 || stepParam > 9 ? 1 : stepParam;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<SignalProvider | null>(null);
  const [agreements, setAgreements] = useState<PartnerAgreement[]>([]);
  const [acceptances, setAcceptances] = useState<PartnerAgreementAcceptance[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);
  const [completionPercent, setCompletionPercent] = useState<number>(0);

  // Active Agreement Modal
  const [viewingAgreement, setViewingAgreement] = useState<PartnerAgreement | null>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const agreementModalRef = useRef<HTMLDivElement>(null);

  // Form State — 1. Personal
  const [legalFullName, setLegalFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [residenceCountryCode, setResidenceCountryCode] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  // 2. Experience
  const [yearsTrading, setYearsTrading] = useState<number | ''>('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [tradingStyles, setTradingStyles] = useState<string[]>([]);
  const [tradingStyleDescription, setTradingStyleDescription] = useState('');
  const [previouslySignalProvider, setPreviouslySignalProvider] = useState<boolean | null>(null);
  const [previousProviderDetails, setPreviousProviderDetails] = useState('');

  // 3. Performance Metrics
  const [declaredAvgMonthlyReturn, setDeclaredAvgMonthlyReturn] = useState<number | ''>('');
  const [declaredMaxDrawdown, setDeclaredMaxDrawdown] = useState<number | ''>('');
  const [declaredWinRate, setDeclaredWinRate] = useState<number | ''>('');
  const [preferredTimeframes, setPreferredTimeframes] = useState<string[]>([]);
  const [maxConsecutiveLosses, setMaxConsecutiveLosses] = useState<number | ''>('');
  const [performancePeriodNote, setPerformancePeriodNote] = useState('');

  // 4. Risk Management
  const [maxLeverageUsed, setMaxLeverageUsed] = useState<number | ''>('');
  const [riskRewardPreference, setRiskRewardPreference] = useState('');
  const [riskPhilosophy, setRiskPhilosophy] = useState('');
  const [usesHedgingOrMartingale, setUsesHedgingOrMartingale] = useState<boolean | null>(null);
  const [usesHedging, setUsesHedging] = useState(false);
  const [usesMartingale, setUsesMartingale] = useState(false);
  const [hedgingMartingaleNotes, setHedgingMartingaleNotes] = useState('');
  const [riskCategory, setRiskCategory] = useState<string>('');

  // 5. Verification Documents
  const [performanceLink, setPerformanceLink] = useState('');
  const [statementPeriodFrom, setStatementPeriodFrom] = useState('');
  const [statementPeriodTo, setStatementPeriodTo] = useState('');
  const [statementAccountType, setStatementAccountType] = useState<StatementAccountType>('LIVE');
  const [documents, setDocuments] = useState<SignalProviderDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // 6. Commitments (Accepted via agreements system)
  // keys: COMMIT_TRANSPARENCY, COMMIT_CLIENT_EDUCATION, COMMIT_ETHICAL_PRACTICES

  // 7. Strategy, Communication & Pricing
  const [strategy, setStrategy] = useState('');
  const [strategyDetail, setStrategyDetail] = useState('');
  const [specializedExpertise, setSpecializedExpertise] = useState('');
  const [marketAdaptation, setMarketAdaptation] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [updateFrequency, setUpdateFrequency] = useState<SpUpdateFrequency | ''>('');
  const [inquiryHandlingApproach, setInquiryHandlingApproach] = useState('');
  const [offersLiveQA, setOffersLiveQA] = useState<boolean | null>(null);
  const [liveQAFrequency, setLiveQAFrequency] = useState('');
  const [website, setWebsite] = useState('');
  const [telegramChannelUrl, setTelegramChannelUrl] = useState('');
  const [subscriptionModel, setSubscriptionModel] = useState<SpSubscriptionModel>('FREE');
  const [plans, setPlans] = useState<SignalProviderPlan[]>([]);

  // 9. Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const countries = getAllCountriesOptions();

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, agreementsRes] = await Promise.allSettled([
          api.get('/signal-providers/my/profile'),
          api.get('/signal-providers/agreements'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.data?.success) {
          const sp: SignalProvider = profileRes.value.data.data.signalProvider;
          const acceptancesList: PartnerAgreementAcceptance[] = profileRes.value.data.data.acceptances || [];
          const completionData = profileRes.value.data.data.completion;

          setProfile(sp);
          setAcceptances(acceptancesList);
          setDocuments(sp.documents || []);
          setPlans(sp.plans || []);
          if (completionData) {
            setCompletionPercent(completionData.percent || 0);
            setMissingRequirements(completionData.missingRequirements || []);
          }

          // Populate Section 1
          setLegalFullName(sp.legalFullName || '');
          setDisplayName(sp.displayName || '');
          setContactPhone(sp.contactPhone || '');
          setResidenceCountryCode(sp.residenceCountryCode || '');
          setResidenceCountry(sp.residenceCountry || '');
          setPhotoUrl(sp.photo || '');

          // Populate Section 2
          setYearsTrading(sp.yearsTrading !== null && sp.yearsTrading !== undefined ? sp.yearsTrading : '');
          setInstruments(sp.instruments || []);
          setTradingStyles(sp.tradingStyles || []);
          setTradingStyleDescription(sp.tradingStyleDescription || '');
          setPreviouslySignalProvider(sp.previouslySignalProvider !== null && sp.previouslySignalProvider !== undefined ? sp.previouslySignalProvider : null);
          setPreviousProviderDetails(sp.previousProviderDetails || '');

          // Populate Section 3
          setDeclaredAvgMonthlyReturn(sp.declaredAvgMonthlyReturn !== null && sp.declaredAvgMonthlyReturn !== undefined ? Number(sp.declaredAvgMonthlyReturn) : '');
          setDeclaredMaxDrawdown(sp.declaredMaxDrawdown !== null && sp.declaredMaxDrawdown !== undefined ? Number(sp.declaredMaxDrawdown) : '');
          setDeclaredWinRate(sp.declaredWinRate !== null && sp.declaredWinRate !== undefined ? Number(sp.declaredWinRate) : '');
          setPreferredTimeframes(sp.preferredTimeframes || []);
          setMaxConsecutiveLosses(sp.maxConsecutiveLosses !== null && sp.maxConsecutiveLosses !== undefined ? sp.maxConsecutiveLosses : '');
          setPerformancePeriodNote(sp.performancePeriodNote || '');

          // Populate Section 4
          setMaxLeverageUsed(sp.maxLeverageUsed !== null && sp.maxLeverageUsed !== undefined ? sp.maxLeverageUsed : '');
          setRiskRewardPreference(sp.riskRewardPreference || '');
          setRiskPhilosophy(sp.riskPhilosophy || '');
          setUsesHedgingOrMartingale(sp.usesHedgingOrMartingale !== null && sp.usesHedgingOrMartingale !== undefined ? sp.usesHedgingOrMartingale : null);
          setUsesHedging(Boolean(sp.usesHedging));
          setUsesMartingale(Boolean(sp.usesMartingale));
          setHedgingMartingaleNotes(sp.hedgingMartingaleNotes || '');
          setRiskCategory(sp.riskCategory || '');

          // Populate Section 5
          setPerformanceLink(sp.performanceLink || '');
          setStatementPeriodFrom(sp.statementPeriodFrom ? sp.statementPeriodFrom.split('T')[0] : '');
          setStatementPeriodTo(sp.statementPeriodTo ? sp.statementPeriodTo.split('T')[0] : '');
          setStatementAccountType(sp.statementAccountType || 'LIVE');

          // Populate Section 7
          setStrategy(sp.strategy || '');
          setStrategyDetail(sp.strategyDetail || '');
          setSpecializedExpertise(sp.specializedExpertise || '');
          setMarketAdaptation(sp.marketAdaptation || '');
          setUniqueValue(sp.uniqueValue || '');
          setUpdateFrequency(sp.updateFrequency || '');
          setInquiryHandlingApproach(sp.inquiryHandlingApproach || '');
          setOffersLiveQA(sp.offersLiveQA !== null && sp.offersLiveQA !== undefined ? sp.offersLiveQA : null);
          setLiveQAFrequency(sp.liveQAFrequency || '');
          setWebsite(sp.website || '');
          setTelegramChannelUrl(sp.telegramChannelUrl || '');
          setSubscriptionModel(sp.subscriptionModel || 'FREE');

          // Populate Section 9
          setDeclarationAccepted(Boolean(sp.declarationAcceptedAt));
        }

        if (agreementsRes.status === 'fulfilled' && agreementsRes.value.data?.success) {
          setAgreements(agreementsRes.value.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load signal provider onboarding data', err);
        toast.error('Failed to load profile. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const isReadOnly = profile?.onboardingStatus === 'SUBMITTED' && profile?.status === 'PENDING';
  const isChangesRequested = profile?.onboardingStatus === 'CHANGES_REQUESTED';
  const isApproved = profile?.status === 'APPROVED';

  const goToStep = (stepNumber: number) => {
    router.push(`/dashboard/signal-provider/onboarding?step=${stepNumber}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section Save Handler
  const handleSaveSection = async (sectionName: string, payload: any, advanceNext = false) => {
    setSaving(true);
    setFieldErrors({});
    try {
      const res = await api.put(`/signal-providers/my/sections/${sectionName}`, payload);
      if (res.data?.success) {
        toast.success(`${sectionName.toUpperCase()} saved`);
        if (res.data.data?.completion) {
          setCompletionPercent(res.data.data.completion.percent);
          setMissingRequirements(res.data.data.completion.missingRequirements);
        }
        if (advanceNext && currentStep < 9) {
          goToStep(currentStep + 1);
        }
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors)) {
        const errorMap: Record<string, string> = {};
        errors.forEach((e: any) => {
          if (e.path) errorMap[e.path] = e.message;
        });
        setFieldErrors(errorMap);
      }
      toast.error(err.response?.data?.message || `Failed to save ${sectionName}`);
    } finally {
      setSaving(false);
    }
  };

  // Section 1 Save
  const savePersonal = async (advance = false) => {
    const payload = {
      legalFullName: legalFullName.trim(),
      displayName: displayName.trim(),
      contactPhone: contactPhone.trim(),
      residenceCountryCode,
      residenceCountry,
    };
    await handleSaveSection('personal', payload, advance);
  };

  // Section 2 Save
  const saveExperience = async (advance = false) => {
    const payload = {
      yearsTrading: yearsTrading !== '' ? Number(yearsTrading) : undefined,
      instruments,
      tradingStyles,
      tradingStyleDescription: tradingStyleDescription.trim(),
      previouslySignalProvider: previouslySignalProvider ?? false,
      previousProviderDetails: previouslySignalProvider ? previousProviderDetails.trim() : null,
    };
    await handleSaveSection('experience', payload, advance);
  };

  // Section 3 Save
  const savePerformance = async (advance = false) => {
    const payload = {
      declaredAvgMonthlyReturn: declaredAvgMonthlyReturn !== '' ? Number(declaredAvgMonthlyReturn) : undefined,
      declaredMaxDrawdown: declaredMaxDrawdown !== '' ? Number(declaredMaxDrawdown) : undefined,
      declaredWinRate: declaredWinRate !== '' ? Number(declaredWinRate) : undefined,
      preferredTimeframes,
      maxConsecutiveLosses: maxConsecutiveLosses !== '' ? Number(maxConsecutiveLosses) : undefined,
      performancePeriodNote: performancePeriodNote.trim() || null,
    };
    await handleSaveSection('performance', payload, advance);
  };

  // Section 4 Save
  const saveRisk = async (advance = false) => {
    const payload = {
      maxLeverageUsed: maxLeverageUsed !== '' ? Number(maxLeverageUsed) : undefined,
      riskRewardPreference: riskRewardPreference.trim(),
      riskPhilosophy: riskPhilosophy.trim(),
      usesHedgingOrMartingale: usesHedgingOrMartingale ?? false,
      usesHedging: usesHedgingOrMartingale ? usesHedging : false,
      usesMartingale: usesHedgingOrMartingale ? usesMartingale : false,
      hedgingMartingaleNotes: usesHedgingOrMartingale ? hedgingMartingaleNotes.trim() : null,
      riskCategory: riskCategory || undefined,
    };
    await handleSaveSection('risk', payload, advance);
  };

  // Section 5 Save
  const saveVerification = async (advance = false) => {
    const payload = {
      performanceLink: performanceLink.trim() || null,
      statementPeriodFrom: statementPeriodFrom || null,
      statementPeriodTo: statementPeriodTo || null,
      statementAccountType,
    };
    await handleSaveSection('verification', payload, advance);
  };

  // Section 7 Save
  const saveAdditionalAndPricing = async (advance = false) => {
    const additionalPayload = {
      strategy: strategy.trim(),
      strategyDetail: strategyDetail.trim(),
      specializedExpertise: specializedExpertise.trim() || null,
      marketAdaptation: marketAdaptation.trim(),
      uniqueValue: uniqueValue.trim(),
    };
    await handleSaveSection('additional', additionalPayload, false);

    const communicationPayload = {
      updateFrequency: updateFrequency || undefined,
      inquiryHandlingApproach: inquiryHandlingApproach.trim(),
      offersLiveQA: offersLiveQA ?? false,
      liveQAFrequency: offersLiveQA ? liveQAFrequency.trim() : null,
      website: website.trim() || null,
      telegramChannelUrl: telegramChannelUrl.trim() || null,
    };
    await handleSaveSection('communication', communicationPayload, false);

    const pricingPayload = {
      subscriptionModel,
      plans: subscriptionModel === 'PAID' ? plans : [],
    };
    await handleSaveSection('pricing', pricingPayload, advance);
  };

  // Document Upload
  const handleDocUpload = async (docType: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingDocType(docType);
    const formData = new FormData();
    formData.append('docType', docType);
    if (docType === 'ACCOUNT_STATEMENT') {
      if (statementPeriodFrom) formData.append('periodFrom', statementPeriodFrom);
      if (statementPeriodTo) formData.append('periodTo', statementPeriodTo);
    }
    for (let i = 0; i < files.length; i++) {
      formData.append('docs', files[i]);
    }

    try {
      const res = await api.post('/signal-providers/my/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        toast.success('Document uploaded successfully');
        const refreshed = await api.get('/signal-providers/my/profile');
        if (refreshed.data?.success) {
          setDocuments(refreshed.data.data.signalProvider?.documents || []);
          if (refreshed.data.data.completion) {
            setCompletionPercent(refreshed.data.data.completion.percent);
            setMissingRequirements(refreshed.data.data.completion.missingRequirements);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Document upload failed');
    } finally {
      setUploadingDocType(null);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id: string) => {
    try {
      await api.delete(`/signal-providers/my/documents/${id}`);
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success('Document deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Profile Photo Upload
  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await api.post('/signal-providers/my/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setPhotoUrl(res.data.data.photo);
        toast.success('Photo uploaded successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Accept Agreement or Commitment
  const handleAcceptAgreement = async (key: string, version: number) => {
    try {
      const res = await api.post('/signal-providers/my/agreements/accept', {
        acceptances: [{ key, version }],
      });
      if (res.data?.success) {
        const refreshed = await api.get('/signal-providers/my/profile');
        if (refreshed.data?.success) {
          setAcceptances(refreshed.data.data.acceptances || []);
          if (refreshed.data.data.completion) {
            setCompletionPercent(refreshed.data.data.completion.percent);
            setMissingRequirements(refreshed.data.data.completion.missingRequirements);
          }
        }
        toast.success('Agreement recorded');
        setViewingAgreement(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record acceptance');
    }
  };

  // Final Submit
  const handleSubmitApplication = async () => {
    if (!declarationAccepted) {
      toast.error('You must accept the truthfulness declaration before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/signal-providers/my/submit');
      if (res.data?.success) {
        toast.success('Application submitted for compliance review!');
        router.push('/dashboard/signal-provider');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Submission failed. Please check missing items.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const errorMap: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => {
          if (e.path) errorMap[e.path] = e.message;
        });
        setFieldErrors(errorMap);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <Skeleton className="h-12 w-80 rounded-2xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 md:col-span-2 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Commitments filter & Legal agreements filter
  const commitments = agreements.filter((a) => a.kind === 'COMMITMENT');
  const legalAgreements = agreements.filter((a) => a.kind === 'AGREEMENT');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28">
      {/* Status Banners */}
      {isChangesRequested && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-soft flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Compliance Action Required: Changes Requested</h3>
            <p className="text-xs text-amber-800 mt-1 whitespace-pre-line">
              {profile?.changesRequestedNote || 'Please review your application parameters and update the flagged sections.'}
            </p>
          </div>
        </div>
      )}

      {isReadOnly && (
        <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 shadow-soft flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-navy">Application Under Review</h3>
            <p className="text-xs text-text-muted mt-1">
              Your Signal Provider profile and verification documents are currently being audited by compliance.
              The application is locked in read-only mode during review.
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-soft flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-emerald-950">Approved & Verified Provider</h3>
            <p className="text-xs text-emerald-800 mt-1">
              Your profile is actively approved. Modifying sensitive strategy or risk fields will automatically trigger a compliance re-review.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-tint border border-border text-navy">
              Provider Accreditation
            </span>
            <span className="text-xs text-text-muted">Step {currentStep} of 9</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1">
            Signal Provider Verification & Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Complete the 31 regulatory declarations and verification milestones to publish verified signals on EdutradeFX.
          </p>
        </div>

        {/* Completion Ring */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-border shadow-soft self-start sm:self-auto">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={completionPercent === 100 ? 'text-green' : 'text-blue'}
                strokeDasharray={`${completionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black font-mono text-navy">
              {completionPercent}%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-navy">Profile Readiness</div>
            <div className="text-[10px] text-text-muted">
              {completionPercent === 100 ? 'All 32 criteria met' : `${missingRequirements.length} items remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Layout: Steps Navigation + Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Navigation Rail (Desktop) */}
        <div className="lg:col-span-4 space-y-2 bg-white p-4 rounded-3xl border border-border shadow-soft">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 py-1">
            Application Sections
          </div>
          <div className="space-y-1">
            {STEPS.map((s) => {
              const isActive = currentStep === s.id;
              const isPast = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
                    isActive
                      ? 'bg-blue text-white shadow-soft font-bold'
                      : 'hover:bg-surface-tint text-text-heading'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive
                          ? 'bg-white text-blue'
                          : isPast
                          ? 'bg-green/10 text-green'
                          : 'bg-surface-tint text-text-muted border border-border'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <div className="truncate">
                      <div className="text-xs leading-tight truncate">{s.title}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content Area */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-soft">
          {/* ── STEP 1: PERSONAL INFORMATION ────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <User className="w-5 h-5 text-blue" />
                  Section 1: Personal Information
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Private identity verification details. Your legal full name is matched against your government ID and is never made public.
                </p>
              </div>

              <div className="space-y-4">
                {/* Photo Upload Slot */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1.5">
                    Profile Avatar / Brand Logo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-surface-tint border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-text-muted" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="sp-photo-file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isReadOnly || photoUploading}
                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="sp-photo-file"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border hover:border-blue text-xs font-bold text-text-heading rounded-xl cursor-pointer transition shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue" />
                        <span>{photoUploading ? 'Uploading...' : 'Choose Photo (≤ 5MB)'}</span>
                      </label>
                      <p className="text-[11px] text-text-muted mt-1">JPG, PNG, or WebP. Magic bytes verified.</p>
                    </div>
                  </div>
                </div>

                {/* Legal Full Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q1: Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      Strictly Private (Admin Only)
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={legalFullName}
                    onChange={(e) => setLegalFullName(e.target.value)}
                    placeholder="As shown on passport or national identity document"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Must match the identification document submitted in Section 5.
                  </p>
                  {fieldErrors.legalFullName && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.legalFullName}</p>
                  )}
                </div>

                {/* Public Display Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Public Display Name / Channel Alias <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      Publicly Listed
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Apex OrderFlow FX or your preferred trading alias"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  {fieldErrors.displayName && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.displayName}</p>
                  )}
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q2: Verified Account Email
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      Strictly Private
                    </span>
                  </div>
                  <input
                    type="email"
                    disabled
                    value={profile?.user?.email || ''}
                    className="w-full px-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-muted cursor-not-allowed min-h-[42px]"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Bound to your authenticated EdutradeFX user account. Never disclosed to followers.
                  </p>
                </div>

                {/* Contact Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q3: Contact Phone Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      Strictly Private
                    </span>
                  </div>
                  <PhoneInput
                    value={contactPhone}
                    disabled={isReadOnly}
                    onChange={(val) => setContactPhone(val)}
                  />
                  {fieldErrors.contactPhone && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.contactPhone}</p>
                  )}
                </div>

                {/* Country of Residence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q4: Country of Residence <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      Strictly Private
                    </span>
                  </div>
                  <select
                    disabled={isReadOnly}
                    value={residenceCountryCode}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      setResidenceCountryCode(selectedCode);
                      const match = countries.find((c) => c.value === selectedCode);
                      setResidenceCountry(match ? match.label : '');
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  >
                    <option value="">Select country of residence...</option>
                    {countries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.residenceCountryCode && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.residenceCountryCode}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isReadOnly || saving}
                  onClick={() => savePersonal(false)}
                  className="px-5 py-2.5 bg-white border border-border hover:border-blue text-xs font-bold text-text-heading rounded-xl transition"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isReadOnly || saving}
                  onClick={() => savePersonal(true)}
                  className="px-6 py-2.5 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Save & Next: Experience
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: TRADING EXPERIENCE ──────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue" />
                  Section 2: Trading Experience
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Disclose your professional market background, traded asset classes, and previous signal provider track record.
                </p>
              </div>

              <div className="space-y-4">
                {/* Q5: Years Trading */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q5: Number of Years Trading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    disabled={isReadOnly}
                    value={yearsTrading}
                    onChange={(e) => setYearsTrading(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  {fieldErrors.yearsTrading && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.yearsTrading}</p>
                  )}
                </div>

                {/* Q6: Preferred Trading Instruments */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q6: Preferred Trading Instruments (1 - 15) <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    options={INSTRUMENT_OPTIONS}
                    value={instruments}
                    onChange={(sel) => setInstruments(sel)}
                    placeholder="Select forex pairs, metals, indices, commodities..."
                  />
                  {fieldErrors.instruments && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.instruments}</p>
                  )}
                </div>

                {/* Q7: Trading Styles */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q7: Primary Trading Styles <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRADING_STYLE_OPTIONS.map((style) => {
                      const isChecked = tradingStyles.includes(style.value);
                      return (
                        <label
                          key={style.value}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                            isChecked
                              ? 'bg-blue/5 border-blue text-blue'
                              : 'bg-white border-border text-text-body hover:border-border-hover'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setTradingStyles(tradingStyles.filter((s) => s !== style.value));
                              } else {
                                setTradingStyles([...tradingStyles, style.value]);
                              }
                            }}
                            className="rounded text-blue focus:ring-0"
                          />
                          <span>{style.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.tradingStyles && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.tradingStyles}</p>
                  )}
                </div>

                {/* Trading Style Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Describe Your Trading Style in Detail (min 50 characters) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">
                      {tradingStyleDescription.length} / 1500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    disabled={isReadOnly}
                    value={tradingStyleDescription}
                    onChange={(e) => setTradingStyleDescription(e.target.value)}
                    placeholder="Describe your session execution routine, technical confluences, entry triggers, and trade management..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                  {fieldErrors.tradingStyleDescription && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.tradingStyleDescription}</p>
                  )}
                </div>

                {/* Q8: Previously acted as a Signal Provider? */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1.5">
                    Q8: Have you previously acted as a Signal Provider on any platform? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="prevSP"
                        disabled={isReadOnly}
                        checked={previouslySignalProvider === true}
                        onChange={() => setPreviouslySignalProvider(true)}
                        className="text-blue"
                      />
                      <span>Yes, I have prior provider experience</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="prevSP"
                        disabled={isReadOnly}
                        checked={previouslySignalProvider === false}
                        onChange={() => setPreviouslySignalProvider(false)}
                        className="text-blue"
                      />
                      <span>No, this is my first signal service</span>
                    </label>
                  </div>
                </div>

                {previouslySignalProvider && (
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Previous Provider Details (Platform name, service duration, follower count) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={previousProviderDetails}
                      onChange={(e) => setPreviousProviderDetails(e.target.value)}
                      placeholder="e.g. MQL5 signals desk from 2021-2023 with 350 active copy-traders..."
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                    />
                    {fieldErrors.previousProviderDetails && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.previousProviderDetails}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveExperience(false)}
                    className="px-5 py-2.5 bg-white border border-border text-xs font-bold text-text-heading rounded-xl"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveExperience(true)}
                    className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                  >
                    Save & Next: Performance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: PERFORMANCE METRICS ─────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue" />
                  Section 3: Self-Declared Performance Metrics
                </h2>
                <div className="p-3.5 rounded-2xl bg-surface-tint border border-blue-200 mt-2 text-xs text-text-muted flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-navy">Transparency Disclosure: </span>
                    These figures are self-declared by the provider. EdutradeFX independently audits only the statements and verified tracking links uploaded in Section 5.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Q9: Avg Monthly Return */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q9: Average Monthly Return (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={-100}
                    max={1000}
                    disabled={isReadOnly}
                    value={declaredAvgMonthlyReturn}
                    onChange={(e) => setDeclaredAvgMonthlyReturn(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 12.5"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  {fieldErrors.declaredAvgMonthlyReturn && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.declaredAvgMonthlyReturn}</p>
                  )}
                </div>

                {/* Q10: Max Drawdown */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q10: Maximum Drawdown (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    disabled={isReadOnly}
                    value={declaredMaxDrawdown}
                    onChange={(e) => setDeclaredMaxDrawdown(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 8.4"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  {fieldErrors.declaredMaxDrawdown && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.declaredMaxDrawdown}</p>
                  )}
                </div>

                {/* Q11: Declared Win Rate */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q11: Declared Winning Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    disabled={isReadOnly}
                    value={declaredWinRate}
                    onChange={(e) => setDeclaredWinRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 68.5"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Kept separate from live signals win rate.</p>
                  {fieldErrors.declaredWinRate && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.declaredWinRate}</p>
                  )}
                </div>

                {/* Q13: Max Consecutive Losses */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q13: Max Consecutive Losing Trades <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    disabled={isReadOnly}
                    value={maxConsecutiveLosses}
                    onChange={(e) => setMaxConsecutiveLosses(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  {fieldErrors.maxConsecutiveLosses && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.maxConsecutiveLosses}</p>
                  )}
                </div>

                {/* Q12: Preferred Time Frame */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q12: Preferred Time Frame (Select 1 to 3) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIMEFRAME_OPTIONS.map((tf) => {
                      const isSelected = preferredTimeframes.includes(tf);
                      return (
                        <button
                          key={tf}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            if (isSelected) {
                              setPreferredTimeframes(preferredTimeframes.filter((t) => t !== tf));
                            } else if (preferredTimeframes.length < 3) {
                              setPreferredTimeframes([...preferredTimeframes, tf]);
                            } else {
                              toast.error('Maximum 3 preferred timeframes allowed');
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                            isSelected
                              ? 'bg-blue text-white border-blue'
                              : 'bg-white border-border text-text-body hover:border-border-hover'
                          }`}
                        >
                          {tf}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.preferredTimeframes && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.preferredTimeframes}</p>
                  )}
                </div>

                {/* Performance Period Note */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    What historical period do these metrics cover? (Recommended)
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={performancePeriodNote}
                    onChange={(e) => setPerformancePeriodNote(e.target.value)}
                    placeholder="e.g. Verified across 18 months of continuous live market execution (2024-2025)"
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => savePerformance(false)}
                    className="px-5 py-2.5 bg-white border border-border text-xs font-bold text-text-heading rounded-xl"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => savePerformance(true)}
                    className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                  >
                    Save & Next: Risk Management
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: RISK MANAGEMENT ─────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue" />
                  Section 4: Risk Management & Capital Preservation
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Disclose leverage tolerance, risk-to-reward ratios, and martingale/hedging practices.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Q14: Maximum Leverage Used */}
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Q14: Maximum Leverage Used (1 : N) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                        1 :
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={3000}
                        disabled={isReadOnly}
                        value={maxLeverageUsed}
                        onChange={(e) => setMaxLeverageUsed(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        placeholder="e.g. 100"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                      />
                    </div>
                    {typeof maxLeverageUsed === 'number' && maxLeverageUsed > 500 && (
                      <p className="text-[11px] text-amber-600 mt-1">
                        High leverage ({'>'} 1:500) will be highlighted for follower risk awareness.
                      </p>
                    )}
                    {fieldErrors.maxLeverageUsed && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.maxLeverageUsed}</p>
                    )}
                  </div>

                  {/* Q15: Risk-Reward Ratio Preference */}
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Q15: Risk-Reward Ratio Preference (e.g. 1:2 or 1:2.5) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={riskRewardPreference}
                      onChange={(e) => setRiskRewardPreference(e.target.value)}
                      placeholder="e.g. 1:2.5"
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                    />
                    {fieldErrors.riskRewardPreference && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.riskRewardPreference}</p>
                    )}
                  </div>
                </div>

                {/* Q16: Risk Management Philosophy */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q16: Risk Management Philosophy (min 50 characters) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">{riskPhilosophy.length} / 2000</span>
                  </div>
                  <textarea
                    rows={4}
                    disabled={isReadOnly}
                    value={riskPhilosophy}
                    onChange={(e) => setRiskPhilosophy(e.target.value)}
                    placeholder="Describe max daily loss limits, per-trade equity risk percentage, trailing stop policies, and position sizing..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                  {fieldErrors.riskPhilosophy && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.riskPhilosophy}</p>
                  )}
                </div>

                {/* Q17: Hedging or Martingale? */}
                <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-3">
                  <label className="block text-xs font-bold text-text-heading">
                    Q17: Do you utilize Hedging or Martingale trading strategies? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="hedgingMartingale"
                        disabled={isReadOnly}
                        checked={usesHedgingOrMartingale === true}
                        onChange={() => setUsesHedgingOrMartingale(true)}
                        className="text-blue"
                      />
                      <span>Yes, I use hedging or martingale</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="hedgingMartingale"
                        disabled={isReadOnly}
                        checked={usesHedgingOrMartingale === false}
                        onChange={() => {
                          setUsesHedgingOrMartingale(false);
                          setUsesHedging(false);
                          setUsesMartingale(false);
                          setHedgingMartingaleNotes('');
                        }}
                        className="text-blue"
                      />
                      <span>No, strictly non-hedging, zero martingale</span>
                    </label>
                  </div>

                  {usesHedgingOrMartingale && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={usesHedging}
                            onChange={(e) => setUsesHedging(e.target.checked)}
                            className="rounded text-blue"
                          />
                          <span>Uses Hedging</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={usesMartingale}
                            onChange={(e) => setUsesMartingale(e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span className="text-amber-800">Uses Martingale / Cost Averaging</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-heading mb-1">
                          Hedging / Martingale Risk Notes (min 30 characters) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          disabled={isReadOnly}
                          value={hedgingMartingaleNotes}
                          onChange={(e) => setHedgingMartingaleNotes(e.target.value)}
                          placeholder="Disclose exact multiplier, max grid layers, recovery formulas, and catastrophic drawdown caps..."
                          className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Category Self-Label */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Risk Category Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={riskCategory}
                    onChange={(e) => setRiskCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  >
                    <option value="">Select risk category...</option>
                    <option value="LOW">Low Risk (Strict &le; 1% risk per trade, no grid)</option>
                    <option value="MEDIUM">Medium Risk (1 - 2% risk per trade, balanced)</option>
                    <option value="HIGH">High Risk (Aggressive scalping, &gt; 2% risk per trade)</option>
                    <option value="VERY_HIGH">Very High Risk (High leverage or martingale strategy)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveRisk(false)}
                    className="px-5 py-2.5 bg-white border border-border text-xs font-bold text-text-heading rounded-xl"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveRisk(true)}
                    className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                  >
                    Save & Next: Verification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: VERIFICATION DOCUMENTS ──────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue" />
                  Section 5: Verification Documents (KYC & Track Record)
                </h2>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 mt-2 text-xs text-amber-800 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950">Strict KYC Privacy Protection: </span>
                    Passport, national IDs, and account statements are stored in encrypted non-public storage. They are accessible solely to verified compliance auditors via signed 5-minute single-use tokens.
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Q18: Identification Document */}
                <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-navy">
                        Q18: Government Identification Document <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        Passport, national ID card, or driving license (front and back). PDF, JPG, PNG &le; 5MB.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-hover transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingDocType === 'IDENTITY_DOCUMENT' ? 'Uploading...' : 'Upload ID'}</span>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        disabled={isReadOnly || uploadingDocType !== null}
                        onChange={(e) => handleDocUpload('IDENTITY_DOCUMENT', e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* List uploaded IDs */}
                  <div className="space-y-2">
                    {documents
                      .filter((d) => d.docType === 'IDENTITY_DOCUMENT')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-border text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-blue shrink-0" />
                            <span className="font-medium text-text-heading truncate">{doc.fileName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-tint font-bold uppercase text-text-muted">
                              {doc.reviewStatus}
                            </span>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Q19: Trading Account Statement */}
                <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-navy">
                      Q19: Trading Account Statement (Last 3 Months) <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Export from MetaTrader or your brokerage portal as PDF or CSV.
                      <strong className="text-red-600"> Strictly no HTML exports</strong> (export as PDF or CSV instead).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-heading mb-1">
                        Statement Period From <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        disabled={isReadOnly}
                        value={statementPeriodFrom}
                        onChange={(e) => setStatementPeriodFrom(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-heading mb-1">
                        Statement Period To <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        disabled={isReadOnly}
                        value={statementPeriodTo}
                        onChange={(e) => setStatementPeriodTo(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-heading mb-1">
                        Account Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={statementAccountType}
                        onChange={(e) => setStatementAccountType(e.target.value as StatementAccountType)}
                        className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading"
                      >
                        <option value="LIVE">LIVE Real Funds Account</option>
                        <option value="DEMO">DEMO Account (Cannot earn verified badge)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-text-muted">
                      Statement span must be &ge; 85 days and end within the last 45 days.
                    </span>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-hover transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingDocType === 'ACCOUNT_STATEMENT' ? 'Uploading...' : 'Upload Statement'}</span>
                      <input
                        type="file"
                        accept=".pdf,.csv,.xlsx,.xls,.png,.jpg"
                        disabled={isReadOnly || uploadingDocType !== null}
                        onChange={(e) => handleDocUpload('ACCOUNT_STATEMENT', e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* List uploaded statements */}
                  <div className="space-y-2">
                    {documents
                      .filter((d) => d.docType === 'ACCOUNT_STATEMENT')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-border text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-text-heading truncate">{doc.fileName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-tint font-bold uppercase text-text-muted">
                              {doc.reviewStatus}
                            </span>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Q20: Performance Tracking Platform Link */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q20: Link to MQL5 Signals, Myfxbook, or FXBlue Track Record (Optional)
                  </label>
                  <input
                    type="url"
                    disabled={isReadOnly}
                    value={performanceLink}
                    onChange={(e) => setPerformanceLink(e.target.value)}
                    placeholder="https://www.mql5.com/en/signals/... or https://www.myfxbook.com/members/..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Authorized domains: mql5.com, myfxbook.com, fxblue.com, tradingview.com, zulutrade.com, fxstreet.com, signalstart.com, darwinex.com.
                    Shown publicly only after compliance verification.
                  </p>
                  {fieldErrors.performanceLink && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.performanceLink}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveVerification(false)}
                    className="px-5 py-2.5 bg-white border border-border text-xs font-bold text-text-heading rounded-xl"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveVerification(true)}
                    className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                  >
                    Save & Next: Principles
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: EDUTRADEFX PRINCIPLES ───────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue" />
                  Section 6: Compliance with EdutradeFX Principles
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Read and affirm each of the three mandatory ethical declarations established by the EdutradeFX board.
                </p>
              </div>

              <div className="space-y-4">
                {commitments.map((cmt) => {
                  const acceptance = acceptances.find((acc) => acc.agreementKey === cmt.key);
                  const isAccepted = Boolean(acceptance && acceptance.version === cmt.version);
                  return (
                    <div
                      key={cmt.id}
                      className={`p-5 rounded-2xl border transition ${
                        isAccepted
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-white border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                            <span>{cmt.title}</span>
                            {isAccepted && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                Accepted
                              </span>
                            )}
                          </h3>
                          <blockquote className="text-xs text-text-body font-medium italic border-l-2 border-blue pl-3 py-1">
                            "{cmt.body}"
                          </blockquote>
                          {isAccepted && acceptance && (
                            <p className="text-[10px] text-text-muted pt-1">
                              Recorded at {new Date(acceptance.acceptedAt).toLocaleString()} (v{acceptance.version})
                            </p>
                          )}
                        </div>

                        {!isReadOnly && !isAccepted && (
                          <button
                            type="button"
                            onClick={() => handleAcceptAgreement(cmt.key, cmt.version)}
                            className="px-4 py-2 bg-blue text-white text-xs font-bold rounded-xl hover:bg-blue-hover transition shrink-0 shadow-sm"
                          >
                            Pledge & Accept
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                >
                  Next: Strategy & Pricing
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 7: ADDITIONAL INFO, COMMUNICATION & PRICING ─────── */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue" />
                  Section 7 & 8: Strategy, Communication & Pricing
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Detailed strategy disclosures, subscriber communication frequency, and transparent subscription tiers.
                </p>
              </div>

              <div className="space-y-5">
                {/* Q24: Strategy Headline & Detail */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Strategy Headline (Short Title, 2-100 chars) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      placeholder="e.g. Session Liquidity & Order Block Confirmations"
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue min-h-[42px]"
                    />
                    {fieldErrors.strategy && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.strategy}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-text-heading">
                        Q24: Trading Strategy in Detail (min 100 characters) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-text-muted font-mono">{strategyDetail.length} / 5000</span>
                    </div>
                    <textarea
                      rows={5}
                      disabled={isReadOnly}
                      value={strategyDetail}
                      onChange={(e) => setStrategyDetail(e.target.value)}
                      placeholder="Elaborate deeply on technical and fundamental analysis, session sweeps, candlestick triggers, multi-timeframe alignment..."
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                    />
                    {fieldErrors.strategyDetail && (
                      <p className="text-[11px] text-red-500 mt-1">{fieldErrors.strategyDetail}</p>
                    )}
                  </div>
                </div>

                {/* Q25: Specialized Expertise */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q25: Specialized Areas of Expertise (Optional)
                  </label>
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={specializedExpertise}
                    onChange={(e) => setSpecializedExpertise(e.target.value)}
                    placeholder="e.g. Gold (XAUUSD) intraday breakouts, London fix liquidity dynamics, central bank interest rate differentials..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                </div>

                {/* Q26: Market Adaptation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q26: How you adapt to different market conditions (Trending vs Ranging) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">{marketAdaptation.length} / 2000</span>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={marketAdaptation}
                    onChange={(e) => setMarketAdaptation(e.target.value)}
                    placeholder="Explain how you adjust position size, take-profit distance, or step aside during high-impact news spikes..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                  {fieldErrors.marketAdaptation && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.marketAdaptation}</p>
                  )}
                </div>

                {/* Q27: Unique Value Proposition */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-text-heading">
                      Q27: What sets your signal service apart? <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted font-mono">{uniqueValue.length} / 1500</span>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={uniqueValue}
                    onChange={(e) => setUniqueValue(e.target.value)}
                    placeholder="Detail your transparency commitment, educational trade rationales, strict drawdown defense..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                  {fieldErrors.uniqueValue && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.uniqueValue}</p>
                  )}
                </div>

                {/* Q28: Update Frequency */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1.5">
                    Q28: Update Frequency to Followers <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {UPDATE_FREQUENCY_OPTIONS.map((freq) => {
                      const isSelected = updateFrequency === freq.value;
                      return (
                        <div
                          key={freq.value}
                          onClick={() => !isReadOnly && setUpdateFrequency(freq.value)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue/5 border-blue text-blue shadow-sm'
                              : 'bg-white border-border hover:border-border-hover'
                          }`}
                        >
                          <div className="text-xs font-bold">{freq.label}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{freq.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Q29: Inquiry Handling Approach */}
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Q29: Approach to Handling Investor & Follower Inquiries <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={inquiryHandlingApproach}
                    onChange={(e) => setInquiryHandlingApproach(e.target.value)}
                    placeholder="State response turnaround times, communication channels, and support boundaries..."
                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  />
                </div>

                {/* Q30: Live Q&A */}
                <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-3">
                  <label className="block text-xs font-bold text-text-heading">
                    Q30: Are you available for live Q&A sessions or webinars? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="liveQA"
                        disabled={isReadOnly}
                        checked={offersLiveQA === true}
                        onChange={() => setOffersLiveQA(true)}
                        className="text-blue"
                      />
                      <span>Yes, available for webinars / live streams</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="liveQA"
                        disabled={isReadOnly}
                        checked={offersLiveQA === false}
                        onChange={() => {
                          setOffersLiveQA(false);
                          setLiveQAFrequency('');
                        }}
                        className="text-blue"
                      />
                      <span>No, text alerts only</span>
                    </label>
                  </div>
                  {offersLiveQA && (
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={liveQAFrequency}
                      onChange={(e) => setLiveQAFrequency(e.target.value)}
                      placeholder="e.g. Monthly Sunday market analysis webinar"
                      className="w-full px-4 py-2 bg-white border border-border rounded-xl text-xs text-text-heading"
                    />
                  )}
                </div>

                {/* Public Social / Channel Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      disabled={isReadOnly}
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-heading mb-1">
                      Telegram Channel / Desk (Optional)
                    </label>
                    <input
                      type="url"
                      disabled={isReadOnly}
                      value={telegramChannelUrl}
                      onChange={(e) => setTelegramChannelUrl(e.target.value)}
                      placeholder="https://t.me/..."
                      className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Subscription Model & Plan Editor */}
                <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-navy">
                      Subscription Fee Model & Membership Plans <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Disclose whether your signal service is 100% Free or offers Paid subscriptions (up to 5 tiers).
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="subModel"
                        disabled={isReadOnly}
                        checked={subscriptionModel === 'FREE'}
                        onChange={() => setSubscriptionModel('FREE')}
                        className="text-blue"
                      />
                      <span>100% Free Public Community Desk</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="subModel"
                        disabled={isReadOnly}
                        checked={subscriptionModel === 'PAID'}
                        onChange={() => setSubscriptionModel('PAID')}
                        className="text-blue"
                      />
                      <span>Paid VIP Subscription Membership</span>
                    </label>
                  </div>

                  {subscriptionModel === 'PAID' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-heading">Subscription Tiers</span>
                        {plans.length < 5 && !isReadOnly && (
                          <button
                            type="button"
                            onClick={() =>
                              setPlans([
                                ...plans,
                                {
                                  id: `temp-${Date.now()}`,
                                  name: 'VIP Monthly Access',
                                  period: 'MONTHLY',
                                  price: 49.99,
                                  currency: 'USD',
                                  description: 'Full signal access with SL/TP updates',
                                },
                              ])
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white text-xs font-bold rounded-lg hover:bg-blue-hover transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Tier</span>
                          </button>
                        )}
                      </div>

                      {plans.map((plan, idx) => (
                        <div key={plan.id || idx} className="p-4 bg-white rounded-2xl border border-border space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                                Plan Name
                              </label>
                              <input
                                type="text"
                                disabled={isReadOnly}
                                value={plan.name}
                                onChange={(e) => {
                                  const updated = [...plans];
                                  updated[idx].name = e.target.value;
                                  setPlans(updated);
                                }}
                                className="w-full px-3 py-2 bg-surface-tint border border-border rounded-xl text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                                Billing Period
                              </label>
                              <select
                                disabled={isReadOnly}
                                value={plan.period}
                                onChange={(e) => {
                                  const updated = [...plans];
                                  updated[idx].period = e.target.value as SpPlanPeriod;
                                  setPlans(updated);
                                }}
                                className="w-full px-3 py-2 bg-surface-tint border border-border rounded-xl text-xs"
                              >
                                {PLAN_PERIOD_OPTIONS.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                                Price (USD)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                disabled={isReadOnly}
                                value={plan.price}
                                onChange={(e) => {
                                  const updated = [...plans];
                                  updated[idx].price = parseFloat(e.target.value) || 0;
                                  setPlans(updated);
                                }}
                                className="w-full px-3 py-2 bg-surface-tint border border-border rounded-xl text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              disabled={isReadOnly}
                              value={plan.description || ''}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[idx].description = e.target.value;
                                setPlans(updated);
                              }}
                              placeholder="Plan perks summary (e.g. VIP Telegram, live trade alerts, webinars)..."
                              className="w-full px-3 py-1.5 bg-surface-tint border border-border rounded-xl text-xs text-text-muted"
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => setPlans(plans.filter((_, i) => i !== idx))}
                                className="ml-3 text-red-500 hover:text-red-700 p-1 shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(6)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveAdditionalAndPricing(false)}
                    className="px-5 py-2.5 bg-white border border-border text-xs font-bold text-text-heading rounded-xl"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly || saving}
                    onClick={() => saveAdditionalAndPricing(true)}
                    className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                  >
                    Save & Next: Agreements
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 8: TERMS & AGREEMENTS (SCROLL-GATE) ─────────────── */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue" />
                  Section 10: Legal Agreements & Compliance Gate
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Each legal instrument must be opened, reviewed in full, and individually signed. Version, timestamp, and IP are cryptographically recorded.
                </p>
              </div>

              <div className="space-y-3">
                {legalAgreements.map((agr) => {
                  const acceptance = acceptances.find((acc) => acc.agreementKey === agr.key);
                  const isAccepted = Boolean(acceptance && acceptance.version === agr.version);
                  return (
                    <div
                      key={agr.id}
                      className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isAccepted
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-white border-border shadow-soft'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-navy">{agr.title}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-tint text-text-muted">
                            v{agr.version}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {agr.key === 'CLIENT_FUND_PROTECTION' && 'Strict prohibition against soliciting or handling client deposits.'}
                          {agr.key === 'SUBSCRIPTION_FEE_STRUCTURE' && 'Full transparency regarding subscriber pricing and billing terms.'}
                          {agr.key === 'LOSS_RECOVERING' && 'Prohibition against promising guaranteed loss recovery or indemnity.'}
                          {agr.key === 'NO_PROFIT_SHARING' && 'Prohibition against PAMM/MAM or profit-sharing percentages.'}
                          {agr.key === 'DISPUTE_RESOLUTION' && 'Standard platform mediation, arbitration and arbitration jurisdiction.'}
                          {agr.key === 'EDUCATIONAL_NON_LIABILITY' && 'Educational Purpose & Non-Liability Agreement (Signals for education only).'}
                        </p>
                        {isAccepted && acceptance && (
                          <div className="text-[10px] text-emerald-700 flex items-center gap-1.5 font-medium pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Signed on {new Date(acceptance.acceptedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingAgreement(agr);
                            setHasScrolledToEnd(false);
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                            isAccepted
                              ? 'bg-surface-tint text-text-heading border border-border hover:bg-border/30'
                              : 'bg-blue text-white hover:bg-blue-hover shadow-sm'
                          }`}
                        >
                          {isAccepted ? 'Review Text' : 'Read & Accept'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(9)}
                  className="px-6 py-2.5 bg-blue text-white text-xs font-bold rounded-xl"
                >
                  Next: Review & Submit
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 9: DECLARATION & REVIEW ────────────────────────── */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-navy flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green" />
                  Section 9: Truthfulness Declaration & Final Review
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Audit your submission parameters, verify all requirements, and sign the closing legal declaration.
                </p>
              </div>

              {/* Missing Requirements Callout */}
              {missingRequirements.length > 0 && (
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Incomplete Application ({missingRequirements.length} required fields remaining)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-800">
                    {missingRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        <span className="truncate">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Summaries */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 1: Personal Information</h3>
                    <p className="text-[11px] text-text-muted">
                      {displayName || 'No display name'} ({legalFullName ? 'Legal name provided' : 'Missing legal name'})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 2: Experience & Instruments</h3>
                    <p className="text-[11px] text-text-muted">
                      {yearsTrading !== '' ? `${yearsTrading} years` : 'Years not entered'} &bull; {instruments.length} instruments selected
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 3: Declared Performance</h3>
                    <p className="text-[11px] text-text-muted">
                      Monthly Return: {declaredAvgMonthlyReturn !== '' ? `${declaredAvgMonthlyReturn}%` : '&mdash;'} &bull; Max DD: {declaredMaxDrawdown !== '' ? `${declaredMaxDrawdown}%` : '&mdash;'} &bull; Win Rate: {declaredWinRate !== '' ? `${declaredWinRate}%` : '&mdash;'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 4: Risk Parameters</h3>
                    <p className="text-[11px] text-text-muted">
                      Leverage: 1:{maxLeverageUsed || '&mdash;'} &bull; R:R {riskRewardPreference || '&mdash;'} &bull; Martingale: {usesMartingale ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 5: Verification Documents</h3>
                    <p className="text-[11px] text-text-muted">
                      {documents.filter((d) => d.docType === 'IDENTITY_DOCUMENT').length} ID docs &bull; {documents.filter((d) => d.docType === 'ACCOUNT_STATEMENT').length} statements uploaded
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(5)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Section 6 & 8: Principles & Legal Agreements</h3>
                    <p className="text-[11px] text-text-muted">
                      {acceptances.length} agreements and commitments recorded
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(8)}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Q31: Closing Declaration Verbatim from PDF */}
              <div className="p-5 rounded-3xl bg-blue/5 border border-blue-200 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="closing-declaration"
                    disabled={isReadOnly || completionPercent < 100}
                    checked={declarationAccepted}
                    onChange={(e) => {
                      setDeclarationAccepted(e.target.checked);
                      if (e.target.checked) {
                        handleSaveSection('declaration', { acceptDeclaration: true }, false);
                      }
                    }}
                    className="mt-1 rounded text-blue focus:ring-0"
                  />
                  <label htmlFor="closing-declaration" className="text-xs text-text-body font-medium leading-relaxed cursor-pointer">
                    <strong className="text-navy block mb-1">Q31: Final Legal Declaration</strong>
                    "I confirm that all information provided is accurate, and I agree to comply with EdutradeFX's guidelines and principles. I understand that any misrepresentation may result in the termination of my Signal Provider account."
                  </label>
                </div>
                {completionPercent < 100 && (
                  <p className="text-[11px] text-amber-700 pl-7">
                    Please complete all required fields across sections 1 through 8 before signing this declaration.
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(8)}
                  className="px-5 py-2.5 bg-surface-tint border border-border text-xs font-bold text-text-heading rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isReadOnly || submitting || completionPercent < 100 || !declarationAccepted}
                  onClick={handleSubmitApplication}
                  className="px-8 py-3 bg-green hover:bg-green-hover text-white text-xs font-black rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application for Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SCROLL-TO-END AGREEMENT MODAL ───────────────────────── */}
      {viewingAgreement && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border max-w-2xl w-full max-h-[85vh] flex flex-col shadow-lift overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">{viewingAgreement.title}</h3>
                <span className="text-[10px] text-text-muted font-mono">
                  Version {viewingAgreement.version} &bull; Audience: {viewingAgreement.audience}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingAgreement(null)}
                className="text-text-muted hover:text-text-heading p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Text Body */}
            <div
              ref={agreementModalRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
                  setHasScrolledToEnd(true);
                }
              }}
              className="p-6 overflow-y-auto space-y-4 text-xs text-text-body leading-relaxed max-h-[50vh] bg-surface-tint"
            >
              <div className="whitespace-pre-line bg-white p-5 rounded-2xl border border-border shadow-sm">
                {viewingAgreement.body}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-border flex items-center justify-between bg-white">
              <span className="text-[11px] text-text-muted">
                {hasScrolledToEnd ? 'Document reviewed to bottom' : 'Scroll to the bottom of the agreement to enable acceptance'}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setViewingAgreement(null)}
                  className="px-4 py-2 bg-surface-tint text-xs font-bold text-text-heading rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!hasScrolledToEnd || isReadOnly}
                  onClick={() => handleAcceptAgreement(viewingAgreement.key, viewingAgreement.version)}
                  className="px-5 py-2 bg-blue text-white text-xs font-bold rounded-xl hover:bg-blue-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Accept Agreement (v{viewingAgreement.version})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignalProviderOnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      }
    >
      <SignalProviderOnboardingContent />
    </React.Suspense>
  );
}
