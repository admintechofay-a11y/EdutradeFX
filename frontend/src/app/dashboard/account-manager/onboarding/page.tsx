'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Shield,
  FileText,
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
  Building2,
  HelpCircle,
  FileCheck,
  Info,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AccountManager, AccountManagerAgreement, AmEntityType, RiskTolerance, SettlementCycle } from '@/types';
import { PhoneInput } from '@/components/common/PhoneInput';
import { MultiSelect } from '@/components/common/MultiSelect';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { Skeleton } from '@/components/common/Skeleton';
import {
  getAllCountriesOptions,
  getStatesOfCountryOptions,
  getCitiesOfStateOptions,
} from '@/lib/country-state-city';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, key: 'personal', title: 'Personal Information', desc: 'Identity & Contacts' },
  { id: 2, key: 'regulatory', title: 'Regulatory', desc: 'Financial Licensing' },
  { id: 3, key: 'about', title: 'About Trader', desc: 'Bio, Speciality & CV' },
  { id: 4, key: 'experience', title: 'Experience', desc: 'Market Track Record' },
  { id: 5, key: 'style', title: 'Trading Style', desc: 'Instruments & Platforms' },
  { id: 6, key: 'strategy', title: 'Trading Strategy', desc: 'Technical & Fundamental' },
  { id: 7, key: 'risk', title: 'Risk Appetite', desc: 'Discipline & Daily Limits' },
  { id: 8, key: 'settlement', title: 'Client Settlements', desc: 'Settlement Cycles' },
  { id: 9, key: 'sharing', title: 'Sharing & Security', desc: 'P&L Split & Funds' },
  { id: 10, key: 'agreements', title: 'Agreements', desc: 'Legal Contracts' },
  { id: 11, key: 'review', title: 'Review & Submit', desc: 'Final Verification' },
];

const INSTRUMENT_OPTIONS = [
  'XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
  'NZDUSD', 'EURJPY', 'GBPJPY', 'BTCUSD', 'ETHUSD', 'US30', 'NAS100', 'SPX500',
  'GER40', 'UKOIL', 'USOIL', 'Other',
];

const TRADING_STYLE_OPTIONS = [
  { value: 'DAY_TRADER', label: 'Day Trader' },
  { value: 'SWING_TRADER', label: 'Swing Trader' },
  { value: 'SCALPER', label: 'Scalper' },
  { value: 'POSITION_TRADER', label: 'Position Trader' },
  { value: 'NEWS_TRADER', label: 'News-based Trader' },
  { value: 'ALGORITHMIC_TRADER', label: 'Algorithmic Trader' },
];

const PLATFORM_OPTIONS = [
  { value: 'MT4', label: 'MetaTrader 4 (MT4)' },
  { value: 'MT5', label: 'MetaTrader 5 (MT5)' },
  { value: 'CTRADER', label: 'cTrader' },
  { value: 'OTHER', label: 'Other (Specify)' },
];

const BROKER_TYPE_OPTIONS = [
  { value: 'ECN', label: 'ECN (Electronic Communication Network)' },
  { value: 'STP', label: 'STP (Straight Through Processing)' },
  { value: 'MARKET_MAKER', label: 'Market Maker (Dealing Desk)' },
];

const TIMEFRAME_OPTIONS = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

function AccountManagerOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = isNaN(stepParam) || stepParam < 1 || stepParam > 11 ? 1 : stepParam;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<AccountManager | null>(null);
  const [agreements, setAgreements] = useState<AccountManagerAgreement[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Personal
  const [entityType, setEntityType] = useState<AmEntityType>('INDIVIDUAL');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [incorporationCountry, setIncorporationCountry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [stateRegion, setStateRegion] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [socialLinksPublic, setSocialLinksPublic] = useState(false);

  // 2. Regulatory
  const [isRegulated, setIsRegulated] = useState<boolean | null>(null);
  const [regulatorName, setRegulatorName] = useState('');
  const [regulatorRegistrationNumber, setRegulatorRegistrationNumber] = useState('');
  const [regulatorCountry, setRegulatorCountry] = useState('');

  // 3. About
  const [bio, setBio] = useState('');
  const [speciality, setSpeciality] = useState('');

  // 4. Experience
  const [yearsExperience, setYearsExperience] = useState<number | ''>('');
  const [marketEventExperience, setMarketEventExperience] = useState('');

  // 5. Style
  const [preferredInstruments, setPreferredInstruments] = useState<string[]>([]);
  const [tradingStyles, setTradingStyles] = useState<string[]>([]);
  const [accuracyLevel, setAccuracyLevel] = useState<number | ''>('');
  const [accuracyPeriodNote, setAccuracyPeriodNote] = useState('');
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([]);
  const [otherPlatformName, setOtherPlatformName] = useState('');
  const [preferredBrokerTypes, setPreferredBrokerTypes] = useState<string[]>([]);

  // 6. Strategy
  const [indicators, setIndicators] = useState('');
  const [signals, setSignals] = useState('');
  const [fundamentals, setFundamentals] = useState('');
  const [technical, setTechnical] = useState('');
  const [newsTrade, setNewsTrade] = useState('');

  // 7. Risk
  const [riskRewardRatio, setRiskRewardRatio] = useState('1:2');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('MODERATE');
  const [lossPerTradePercent, setLossPerTradePercent] = useState<number | ''>('');
  const [dailyTrades, setDailyTrades] = useState<number | ''>('');
  const [dailyLots, setDailyLots] = useState<number | ''>('');
  const [dailyStopLossPoints, setDailyStopLossPoints] = useState<number | ''>('');
  const [dailyTakeProfitPoints, setDailyTakeProfitPoints] = useState<number | ''>('');
  const [favouriteTimeframe, setFavouriteTimeframe] = useState('H1');
  const [tradingTimeFrom, setTradingTimeFrom] = useState('09:00');
  const [tradingTimeTo, setTradingTimeTo] = useState('18:00');
  const [lossRecoveryStrategy, setLossRecoveryStrategy] = useState('');

  // 8. Settlement
  const [settlementCycle, setSettlementCycle] = useState<SettlementCycle>('MONTHLY');

  // 9. Sharing
  const [clientFundSecurity, setClientFundSecurity] = useState('');
  const [recommendsBroker, setRecommendsBroker] = useState<boolean | null>(false);
  const [recommendedBrokerName, setRecommendedBrokerName] = useState('');
  const [recommendedBrokerPlatform, setRecommendedBrokerPlatform] = useState('MT5');
  const [profitSharingPercent, setProfitSharingPercent] = useState<number | ''>('');
  const [lossSharingPercent, setLossSharingPercent] = useState<number | ''>('');

  // 10. Agreements & Modal state
  const [activeModalAgreement, setActiveModalAgreement] = useState<AccountManagerAgreement | null>(null);
  const [modalScrolledToBottom, setModalScrolledToBottom] = useState(false);
  const [acceptedKeys, setAcceptedKeys] = useState<Record<string, number>>({});
  const [masterAgreed, setMasterAgreed] = useState(false);

  // Upload progress states
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const modalScrollContainerRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, agreementsRes] = await Promise.all([
          api.get('/account-managers/my/profile'),
          api.get('/account-managers/agreements'),
        ]);

        const p: AccountManager = profileRes.data?.data;
        const ag: AccountManagerAgreement[] = agreementsRes.data?.data || [];

        setProfile(p);
        setAgreements(ag);

        if (p) {
          // 1. Personal
          if (p.entityType) setEntityType(p.entityType);
          if (p.companyLegalName) setCompanyLegalName(p.companyLegalName);
          if (p.companyRegistrationNumber) setCompanyRegistrationNumber(p.companyRegistrationNumber);
          if (p.incorporationCountry) setIncorporationCountry(p.incorporationCountry);
          if (p.companyWebsite) setCompanyWebsite(p.companyWebsite);
          if (p.photo) setPhoto(p.photo);
          if (p.address) setAddress(p.address);
          if (p.countryCode) setCountryCode(p.countryCode);
          if (p.stateRegion) setStateRegion(p.stateRegion);
          if (p.stateCode) setStateCode(p.stateCode);
          if (p.city) setCity(p.city);
          if (p.zipCode) setZipCode(p.zipCode);
          if (p.contactEmail) setContactEmail(p.contactEmail);
          if (p.contactPhone) setContactPhone(p.contactPhone);
          if (p.socialLinks) setSocialLinks(p.socialLinks as any);
          if (p.socialLinksPublic !== undefined) setSocialLinksPublic(p.socialLinksPublic);

          // 2. Regulatory
          if (p.isRegulated !== null && p.isRegulated !== undefined) setIsRegulated(p.isRegulated);
          if (p.regulatorName) setRegulatorName(p.regulatorName);
          if (p.regulatorRegistrationNumber) setRegulatorRegistrationNumber(p.regulatorRegistrationNumber);
          if (p.regulatorCountry) setRegulatorCountry(p.regulatorCountry);

          // 3. About
          if (p.bio) setBio(p.bio);
          if (p.speciality) setSpeciality(p.speciality);

          // 4. Experience
          if (p.yearsExperience !== null && p.yearsExperience !== undefined) setYearsExperience(p.yearsExperience);
          if (p.marketEventExperience) setMarketEventExperience(p.marketEventExperience);

          // 5. Style
          if (p.preferredInstruments) setPreferredInstruments(p.preferredInstruments);
          if (p.tradingStyles) setTradingStyles(p.tradingStyles);
          if (p.accuracyLevel !== null && p.accuracyLevel !== undefined) setAccuracyLevel(Number(p.accuracyLevel));
          if (p.accuracyPeriodNote) setAccuracyPeriodNote(p.accuracyPeriodNote);
          if (p.preferredPlatforms) setPreferredPlatforms(p.preferredPlatforms);
          if (p.otherPlatformName) setOtherPlatformName(p.otherPlatformName);
          if (p.preferredBrokerTypes) setPreferredBrokerTypes(p.preferredBrokerTypes);

          // 6. Strategy
          if (p.indicators) setIndicators(p.indicators);
          if (p.signals) setSignals(p.signals);
          if (p.fundamentals) setFundamentals(p.fundamentals);
          if (p.technical) setTechnical(p.technical);
          if (p.newsTrade) setNewsTrade(p.newsTrade);

          // 7. Risk
          if (p.riskRewardRatio) setRiskRewardRatio(p.riskRewardRatio);
          if (p.riskTolerance) setRiskTolerance(p.riskTolerance);
          if (p.lossPerTradePercent !== null && p.lossPerTradePercent !== undefined)
            setLossPerTradePercent(Number(p.lossPerTradePercent));
          if (p.dailyTrades !== null && p.dailyTrades !== undefined) setDailyTrades(p.dailyTrades);
          if (p.dailyLots !== null && p.dailyLots !== undefined) setDailyLots(Number(p.dailyLots));
          if (p.dailyStopLossPoints !== null && p.dailyStopLossPoints !== undefined)
            setDailyStopLossPoints(p.dailyStopLossPoints);
          if (p.dailyTakeProfitPoints !== null && p.dailyTakeProfitPoints !== undefined)
            setDailyTakeProfitPoints(p.dailyTakeProfitPoints);
          if (p.favouriteTimeframe) setFavouriteTimeframe(p.favouriteTimeframe);
          if (p.tradingTimeFrom) setTradingTimeFrom(p.tradingTimeFrom);
          if (p.tradingTimeTo) setTradingTimeTo(p.tradingTimeTo);
          if (p.lossRecoveryStrategy) setLossRecoveryStrategy(p.lossRecoveryStrategy);

          // 8. Settlement
          if (p.settlementCycle) setSettlementCycle(p.settlementCycle);

          // 9. Sharing
          if (p.clientFundSecurity) setClientFundSecurity(p.clientFundSecurity);
          if (p.recommendsBroker !== null && p.recommendsBroker !== undefined)
            setRecommendsBroker(p.recommendsBroker);
          if (p.recommendedBrokerName) setRecommendedBrokerName(p.recommendedBrokerName);
          if (p.recommendedBrokerPlatform) setRecommendedBrokerPlatform(p.recommendedBrokerPlatform);
          if (p.profitSharingPercent !== null && p.profitSharingPercent !== undefined)
            setProfitSharingPercent(Number(p.profitSharingPercent));
          if (p.lossSharingPercent !== null && p.lossSharingPercent !== undefined)
            setLossSharingPercent(Number(p.lossSharingPercent));

          // 10. Accepted agreements
          if (p.agreements) {
            const accMap: Record<string, number> = {};
            p.agreements.forEach((a) => {
              accMap[a.agreementKey] = a.version;
            });
            setAcceptedKeys(accMap);
          }
        }
      } catch (err: any) {
        console.error('Failed to load onboarding', err);
        toast.error('Failed to load onboarding data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const goToStep = (stepNumber: number) => {
    router.push(`/dashboard/account-manager/onboarding?step=${stepNumber}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert IST time string to UTC preview
  const getUtcPreview = (istTime: string) => {
    if (!istTime || !istTime.includes(':')) return '';
    const [h, m] = istTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    let totalMinutes = h * 60 + m - 330; // -5h 30m
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);
    const utcH = Math.floor(totalMinutes / 60);
    const utcM = totalMinutes % 60;
    return `${String(utcH).padStart(2, '0')}:${String(utcM).padStart(2, '0')} UTC`;
  };

  // Save current step draft
  const handleSaveDraft = async (stepId: number, silent = false): Promise<boolean> => {
    try {
      setSaving(true);
      setFieldErrors({});

      let sectionKey = '';
      let payload: any = {};

      if (stepId === 1) {
        sectionKey = 'personal';
        payload = {
          entityType,
          companyLegalName: entityType === 'CORPORATE' ? companyLegalName : undefined,
          companyRegistrationNumber: entityType === 'CORPORATE' ? companyRegistrationNumber : undefined,
          incorporationCountry: entityType === 'CORPORATE' ? incorporationCountry : undefined,
          companyWebsite: entityType === 'CORPORATE' ? companyWebsite : undefined,
          address,
          countryCode,
          stateRegion: stateRegion || stateCode,
          stateCode,
          city: customCity || city,
          zipCode,
          contactEmail,
          contactPhone,
          socialLinks,
          socialLinksPublic,
        };
      } else if (stepId === 2) {
        sectionKey = 'regulatory';
        payload = {
          isRegulated,
          regulatorName: isRegulated ? regulatorName : undefined,
          regulatorRegistrationNumber: isRegulated ? regulatorRegistrationNumber : undefined,
          regulatorCountry: isRegulated ? regulatorCountry : undefined,
        };
      } else if (stepId === 3) {
        sectionKey = 'about';
        payload = { bio, speciality };
      } else if (stepId === 4) {
        sectionKey = 'experience';
        payload = {
          yearsExperience: yearsExperience === '' ? undefined : Number(yearsExperience),
          marketEventExperience,
        };
      } else if (stepId === 5) {
        sectionKey = 'style';
        payload = {
          preferredInstruments,
          tradingStyles,
          accuracyLevel: accuracyLevel === '' ? undefined : Number(accuracyLevel),
          accuracyPeriodNote,
          preferredPlatforms,
          otherPlatformName: preferredPlatforms.includes('OTHER') ? otherPlatformName : undefined,
          preferredBrokerTypes,
        };
      } else if (stepId === 6) {
        sectionKey = 'strategy';
        payload = { indicators, signals, fundamentals, technical, newsTrade };
      } else if (stepId === 7) {
        payload = {
          riskRewardRatio,
          riskTolerance,
          lossPerTradePercent: lossPerTradePercent === '' ? undefined : Number(lossPerTradePercent),
          dailyTrades: dailyTrades === '' ? undefined : Number(dailyTrades),
          dailyLots: dailyLots === '' ? undefined : Number(dailyLots),
          dailyStopLossPoints: dailyStopLossPoints === '' ? undefined : Number(dailyStopLossPoints),
          dailyTakeProfitPoints: dailyTakeProfitPoints === '' ? undefined : Number(dailyTakeProfitPoints),
          favouriteTimeframe,
          tradingTimeFrom,
          tradingTimeTo,
          lossRecoveryStrategy,
        };
        sectionKey = 'risk';
      } else if (stepId === 8) {
        sectionKey = 'settlement';
        payload = { settlementCycle };
      } else if (stepId === 9) {
        sectionKey = 'sharing';
        payload = {
          clientFundSecurity,
          recommendsBroker,
          recommendedBrokerName: recommendsBroker ? recommendedBrokerName : undefined,
          recommendedBrokerPlatform: recommendsBroker ? recommendedBrokerPlatform : undefined,
          profitSharingPercent: profitSharingPercent === '' ? undefined : Number(profitSharingPercent),
          lossSharingPercent: lossSharingPercent === '' ? undefined : Number(lossSharingPercent),
        };
      }

      if (sectionKey) {
        const res = await api.put(`/account-managers/my/sections/${sectionKey}`, payload);
        if (res.data?.data) {
          setProfile(res.data.data);
        }
      }

      if (!silent) {
        toast.success('Draft saved successfully');
      }
      return true;
    } catch (err: any) {
      console.error('Save draft failed', err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      toast.error(err.response?.data?.message || 'Failed to save draft');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async (stepId: number) => {
    const ok = await handleSaveDraft(stepId, true);
    if (ok) {
      goToStep(stepId + 1);
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be 5 MB or smaller');
      return;
    }

    try {
      setUploadingDocType('photo');
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.post('/account-managers/my/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.photo) {
        setPhoto(res.data.data.photo);
        setProfile((prev) => (prev ? { ...prev, photo: res.data.data.photo } : null));
        toast.success('Profile photo uploaded');
      }
    } catch (err: any) {
      console.error('Photo upload failed', err);
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingDocType(null);
    }
  };

  // Upload Document
  const handleDocumentUpload = async (
    docType: string,
    file: File,
    caption?: string,
    periodNote?: string
  ) => {
    try {
      setUploadingDocType(docType);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      if (caption) formData.append('caption', caption);
      if (periodNote) formData.append('periodNote', periodNote);

      const res = await api.post('/account-managers/my/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data) {
        setProfile((prev) => {
          if (!prev) return null;
          const docs = prev.documents || [];
          return { ...prev, documents: [...docs, res.data.data] };
        });
        toast.success('Document uploaded');
      }
    } catch (err: any) {
      console.error('Doc upload failed', err);
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDocType(null);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (id: string) => {
    try {
      await api.delete(`/account-managers/my/documents/${id}`);
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          documents: (prev.documents || []).filter((d) => d.id !== id),
        };
      });
      toast.success('Document removed');
    } catch (err: any) {
      console.error('Delete doc failed', err);
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Submit Final Application
  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      setFieldErrors({});

      const res = await api.post('/account-managers/my/submit');
      toast.success('Application submitted successfully for compliance review!');
      router.push('/dashboard/account-manager');
    } catch (err: any) {
      console.error('Submit application failed', err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      toast.error(err.response?.data?.message || 'Submission failed. Please check missing required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  // Agreements modal scroll handler
  const handleModalScroll = () => {
    const el = modalScrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 25) {
      setModalScrolledToBottom(true);
    }
  };

  // Save Agreement Acceptance
  const handleAcceptAgreement = async (key: string, version: number) => {
    try {
      const nextAccepted = { ...acceptedKeys, [key]: version };
      setAcceptedKeys(nextAccepted);
      setActiveModalAgreement(null);

      // Post acceptances to server
      const acceptances = Object.entries(nextAccepted).map(([k, v]) => ({
        key: k,
        version: v,
      }));

      await api.post('/account-managers/my/agreements/accept', {
        acceptances,
        master: masterAgreed,
      });

      toast.success('Agreement recorded');
    } catch (err: any) {
      console.error('Accept agreement failed', err);
      toast.error(err.response?.data?.message || 'Failed to record agreement acceptance');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const isSubmitted = profile?.onboardingStatus === 'SUBMITTED' && profile?.status === 'PENDING';
  const countries = getAllCountriesOptions();
  const states = getStatesOfCountryOptions(countryCode);
  const cities = getCitiesOfStateOptions(countryCode, stateCode);

  const cvDocuments = (profile?.documents || []).filter((d) => d.docType === 'CV_RESUME');
  const performanceDocs = (profile?.documents || []).filter((d) => d.docType === 'PERFORMANCE_RECORD');
  const strategyDocs = (profile?.documents || []).filter((d) => d.docType === 'STRATEGY_DOCUMENT');
  const certDocs = (profile?.documents || []).filter((d) => d.docType === 'CERTIFICATE');
  const screenshotDocs = (profile?.documents || []).filter((d) => d.docType === 'PAST_RESULT_SCREENSHOT');
  const regulatoryProofDocs = (profile?.documents || []).filter((d) => d.docType === 'REGULATORY_PROOF');

  const requiredAgreementKeys = [
    'CLIENT_FUND_PROTECTION',
    'TRADER_PROFIT_PROTECTION',
    'NO_PERSONAL_CONTACT_SHARING',
    'CLIENT_FUND_INSURANCE_PROTECTION',
    'LOSS_RECOVERING',
    'PROFIT_SHARING',
    'NDA',
  ];
  const all7Accepted = requiredAgreementKeys.every((k) => acceptedKeys[k]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-36">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/account-manager"
              className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Portal Overview
            </Link>
            <span className="text-text-muted text-xs">•</span>
            <span className="text-xs font-bold text-orange">Step {currentStep} of 11</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-heading mt-1">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">{STEPS[currentStep - 1].desc}</p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {profile?.onboardingStatus === 'SUBMITTED' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue border border-blue-200">
              SUBMITTED / IN REVIEW
            </span>
          ) : profile?.onboardingStatus === 'CHANGES_REQUESTED' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              CHANGES REQUESTED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-tint text-text-muted border border-border">
              DRAFT PROGRESS ({profile?.completionPercent || 0}%)
            </span>
          )}
        </div>
      </div>

      {/* Submitted Read-Only Warning */}
      {isSubmitted && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Application Under Review: </span>
            Your onboarding submission is currently being reviewed by compliance. Form fields are read-only until
            review completes or changes are requested.
          </div>
        </div>
      )}

      {/* Step Navigator (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          return (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-blue text-white border-blue shadow-soft'
                  : isDone
                  ? 'bg-surface-tint text-text-heading border-border hover:bg-blue-50/50'
                  : 'bg-white text-text-muted border-border hover:text-text-heading'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-white text-blue' : isDone ? 'bg-green text-white' : 'bg-gray-100 text-text-muted'
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
              </span>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Step Form Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
        {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Entity Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-2">
                Entity Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setEntityType('INDIVIDUAL')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    entityType === 'INDIVIDUAL'
                      ? 'border-blue bg-blue-50/30'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      entityType === 'INDIVIDUAL' ? 'bg-blue text-white' : 'bg-surface-tint text-text-muted'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-heading">Individual Trader</div>
                    <div className="text-[11px] text-text-muted">Trading independently under your legal personal name</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setEntityType('CORPORATE')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    entityType === 'CORPORATE'
                      ? 'border-blue bg-blue-50/30'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      entityType === 'CORPORATE' ? 'bg-blue text-white' : 'bg-surface-tint text-text-muted'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-heading">Corporate / Firm</div>
                    <div className="text-[11px] text-text-muted">Registered trading corporation, firm, or fund entity</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Corporate Extras (if Corporate) */}
            {entityType === 'CORPORATE' && (
              <div className="p-5 rounded-2xl bg-surface-tint border border-blue-100 space-y-4">
                <h3 className="text-xs font-bold text-blue uppercase tracking-wider">Corporate Entity Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Company Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={companyLegalName}
                      onChange={(e) => setCompanyLegalName(e.target.value)}
                      placeholder="e.g. Alpha Quant Capital Ltd."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                    {fieldErrors.companyLegalName && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.companyLegalName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={companyRegistrationNumber}
                      onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                      placeholder="e.g. CR-98745612"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Country of Incorporation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={incorporationCountry}
                      onChange={(e) => setIncorporationCountry(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">Company Website</label>
                    <input
                      type="url"
                      disabled={isSubmitted}
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-2">
                Profile Photo <span className="text-red-500">*</span> (≤ 5 MB, jpg/png/webp)
              </label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-surface-tint border-2 border-border overflow-hidden flex items-center justify-center shrink-0">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-text-muted" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-surface-tint border border-border hover:bg-gray-100 rounded-xl text-xs font-bold text-text-heading transition">
                    <Upload className="w-4 h-4 text-blue" />
                    <span>{uploadingDocType === 'photo' ? 'Uploading...' : 'Choose Photo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={isSubmitted || uploadingDocType === 'photo'}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Clear front-facing headshot or corporate logo. Automatically optimized.
                  </p>
                </div>
              </div>
              {fieldErrors.photo && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.photo}</p>}
            </div>

            {/* Address & Cascading Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, building, apartment or office suite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
                {fieldErrors.address && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.address}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={isSubmitted}
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setStateCode('');
                    setStateRegion('');
                    setCity('');
                    setCustomCity('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.countryCode && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.countryCode}</p>}
              </div>

              {/* State / Region */}
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  State / Region <span className="text-red-500">*</span>
                </label>
                {states.length > 0 ? (
                  <select
                    disabled={isSubmitted}
                    value={stateCode}
                    onChange={(e) => {
                      const sel = states.find((s) => s.value === e.target.value);
                      setStateCode(e.target.value);
                      setStateRegion(sel?.label || e.target.value);
                      setCity('');
                      setCustomCity('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                  >
                    <option value="">Select State / Region</option>
                    {states.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={stateRegion}
                    onChange={(e) => {
                      setStateRegion(e.target.value);
                      setStateCode(e.target.value);
                    }}
                    placeholder="Enter state or region name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                )}
                {fieldErrors.stateRegion && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.stateRegion}</p>}
              </div>

              {/* City (with other fallback) */}
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                {cities.length > 0 && city !== '__OTHER__' ? (
                  <select
                    disabled={isSubmitted}
                    value={city}
                    onChange={(e) => {
                      if (e.target.value === '__OTHER__') {
                        setCity('__OTHER__');
                      } else {
                        setCity(e.target.value);
                        setCustomCity('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                    <option value="__OTHER__">Other (type it)</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={customCity || (city !== '__OTHER__' ? city : '')}
                      onChange={(e) => {
                        setCustomCity(e.target.value);
                        setCity(e.target.value);
                      }}
                      placeholder="Type your city name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                    {cities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCity('');
                          setCustomCity('');
                        }}
                        className="text-[10px] text-blue underline font-semibold"
                      >
                        Choose from list instead
                      </button>
                    )}
                  </div>
                )}
                {fieldErrors.city && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.city}</p>}
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Zip / Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 110001 or SW1A 1AA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
                {fieldErrors.zipCode && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.zipCode}</p>}
              </div>
            </div>

            {/* Contact Email & Phone (ADMIN PRIVATE NOTICE) */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Contact Privacy Protection (Admin-Only Confidential)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                In compliance with the No Personal Contact Sharing Agreement, your direct email and phone number are
                kept private from prospective clients and will NEVER be shown on your public profile or card.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={isSubmitted}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="manager@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none bg-white"
                  />
                  {fieldErrors.contactEmail && (
                    <p className="text-[10px] text-red-500 mt-1">{fieldErrors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Contact Phone (E.164) <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    disabled={isSubmitted}
                    value={contactPhone}
                    onChange={(val) => setContactPhone(val)}
                    placeholder="Enter phone with country code"
                    error={fieldErrors.contactPhone}
                  />
                </div>
              </div>
            </div>

            {/* Social Links (Optional) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-text-heading">Social Handles & Links (Optional)</label>
                  <p className="text-[11px] text-text-muted">Domain allow-listed URLs or usernames.</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-heading">
                  <input
                    type="checkbox"
                    disabled={isSubmitted}
                    checked={socialLinksPublic}
                    onChange={(e) => setSocialLinksPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-blue focus:ring-blue border-border"
                  />
                  <span>Show on my public profile</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">YouTube Channel</span>
                  <input
                    type="url"
                    disabled={isSubmitted}
                    value={socialLinks.youtube || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">Instagram</span>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="@handle or https://instagram.com/handle"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">LinkedIn</span>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/handle"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">Discord</span>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={socialLinks.discord || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                    placeholder="username or discord.gg/invite"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">Facebook</span>
                  <input
                    type="url"
                    disabled={isSubmitted}
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/page"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-text-muted mb-1">Twitter / X</span>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="@handle or https://x.com/handle"
                    className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: REGULATORY ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-2">
                Are you registered with any financial authority or regulatory body?{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setIsRegulated(true)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    isRegulated === true ? 'border-blue bg-blue-50/30' : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isRegulated === true ? 'bg-blue text-white' : 'bg-surface-tint text-text-muted'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-heading">Yes, I am Regulated</div>
                    <div className="text-[11px] text-text-muted">Registered with FCA, ASIC, CySEC, SEBI, etc.</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setIsRegulated(false)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    isRegulated === false
                      ? 'border-blue bg-blue-50/30'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isRegulated === false ? 'bg-blue text-white' : 'bg-surface-tint text-text-muted'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-heading">No, Unregulated</div>
                    <div className="text-[11px] text-text-muted">Profile will not display a regulated badge</div>
                  </div>
                </button>
              </div>
            </div>

            {/* If Yes: Details */}
            {isRegulated === true && (
              <div className="p-5 rounded-2xl bg-surface-tint border border-blue-100 space-y-4">
                <h3 className="text-xs font-bold text-blue uppercase tracking-wider">Regulatory Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Regulator Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={regulatorName}
                      onChange={(e) => setRegulatorName(e.target.value)}
                      placeholder="e.g. FCA, ASIC, CySEC, DFSA, SEBI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                    {fieldErrors.regulatorName && (
                      <p className="text-[10px] text-red-500 mt-1">{fieldErrors.regulatorName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Registration / License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={regulatorRegistrationNumber}
                      onChange={(e) => setRegulatorRegistrationNumber(e.target.value)}
                      placeholder="e.g. 543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Regulator Jurisdiction Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={regulatorCountry}
                      onChange={(e) => setRegulatorCountry(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Proof Document Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-text-heading mb-1">
                    Regulatory Proof Document (License copy / certificate)
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-border hover:bg-gray-100 rounded-xl text-xs font-bold text-text-heading transition">
                    <Upload className="w-4 h-4 text-blue" />
                    <span>{uploadingDocType === 'REGULATORY_PROOF' ? 'Uploading...' : 'Upload Proof Document'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={isSubmitted || uploadingDocType === 'REGULATORY_PROOF'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('REGULATORY_PROOF', file);
                      }}
                      className="hidden"
                    />
                  </label>

                  {regulatoryProofDocs.map((doc) => (
                    <div key={doc.id} className="mt-2 flex items-center justify-between p-2.5 bg-white border border-border rounded-xl text-xs">
                      <span className="font-semibold truncate max-w-sm">{doc.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Regulatory badges show on your public profile only after manual compliance verification.
                  </p>
                </div>
              </div>
            )}

            {isRegulated === false && (
              <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-muted">
                Your profile will be classified as an independent unregulated account manager. No regulatory badge will
                be shown.
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: ABOUT TRADER & CV ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                About Information (Bio) <span className="text-red-500">*</span> (50–3000 chars)
              </label>
              <textarea
                rows={5}
                disabled={isSubmitted}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your background, market philosophy, experience managing capital, and professional journey..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>Min 50 characters</span>
                <span>{bio.length}/3000</span>
              </div>
              {fieldErrors.bio && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.bio}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Speciality About Trader <span className="text-red-500">*</span> (20–1500 chars)
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                placeholder="Highlight your key edge, specialized instruments, risk management protocols, or algorithmic execution style..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>Min 20 characters</span>
                <span>{speciality.length}/1500</span>
              </div>
              {fieldErrors.speciality && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.speciality}</p>}
            </div>

            {/* Document Uploads Slot 1: CV/Resume (Required) */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-heading">
                    CV / Resume Upload <span className="text-red-500">*</span> (Private, admin-only)
                  </h3>
                  <p className="text-[11px] text-text-muted">1 file (pdf/doc/docx, ≤ 10 MB). Stored securely.</p>
                </div>

                {cvDocuments.length === 0 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingDocType === 'CV_RESUME' ? 'Uploading...' : 'Upload CV'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={isSubmitted || uploadingDocType === 'CV_RESUME'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('CV_RESUME', file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {cvDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue shrink-0" />
                    <span className="font-semibold truncate">{doc.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Document Uploads Slot 2: Trading Performance Records (xls/xlsx/csv/pdf) */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-heading">
                    Trading Performance Records (Up to 5 files)
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Platform statement exports, investor reports (pdf/doc/docx/xls/xlsx/csv, ≤ 10 MB each).
                  </p>
                </div>

                {performanceDocs.length < 5 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-surface-tint border border-border hover:bg-gray-100 rounded-xl text-xs font-bold text-text-heading transition">
                    <Upload className="w-3.5 h-3.5 text-blue" />
                    <span>{uploadingDocType === 'PERFORMANCE_RECORD' ? 'Uploading...' : 'Add Statement'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      disabled={isSubmitted || uploadingDocType === 'PERFORMANCE_RECORD'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('PERFORMANCE_RECORD', file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {performanceDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <TrendingUp className="w-4 h-4 text-green shrink-0" />
                    <span className="font-semibold truncate">{doc.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Document Uploads Slot 3: Strategy Documents */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-heading">
                    Trading Strategy Documents (Up to 5 files)
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Detailed system rules, backtest analyses, whitepapers (pdf/doc/docx, ≤ 10 MB each).
                  </p>
                </div>

                {strategyDocs.length < 5 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-surface-tint border border-border hover:bg-gray-100 rounded-xl text-xs font-bold text-text-heading transition">
                    <Upload className="w-3.5 h-3.5 text-blue" />
                    <span>{uploadingDocType === 'STRATEGY_DOCUMENT' ? 'Uploading...' : 'Add Strategy Doc'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={isSubmitted || uploadingDocType === 'STRATEGY_DOCUMENT'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('STRATEGY_DOCUMENT', file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {strategyDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-semibold truncate">{doc.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 4: EXPERIENCE & PARTICIPATION ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Market Experience (Years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    disabled={isSubmitted}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none pr-14"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted font-bold pointer-events-none">
                    Years
                  </span>
                </div>
                {fieldErrors.yearsExperience && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.yearsExperience}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Market Event Experience (Optional, max 2000 chars)
              </label>
              <textarea
                rows={4}
                disabled={isSubmitted}
                value={marketEventExperience}
                onChange={(e) => setMarketEventExperience(e.target.value)}
                placeholder="Share your experience navigating major black swan events, elections, central bank decisions (e.g. SNB 2015, Brexit 2016, COVID 2020)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            {/* Achievements & Certificates */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-heading">
                    Achievements & Professional Certificates (Up to 10)
                  </h3>
                  <p className="text-[11px] text-text-muted">CFA, CMT, prop firm pass certificates, awards (pdf/images).</p>
                </div>

                {certDocs.length < 10 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-surface-tint border border-border hover:bg-gray-100 rounded-xl text-xs font-bold text-text-heading transition">
                    <Upload className="w-3.5 h-3.5 text-blue" />
                    <span>Upload Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={isSubmitted || uploadingDocType === 'CERTIFICATE'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('CERTIFICATE', file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {certDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl text-xs">
                  <span className="font-semibold truncate">{doc.fileName}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Past Results Account Screenshots */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-heading">
                    Past Results Account Screenshots (Up to 10)
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Verified MT4/MT5/cTrader terminal screenshot captures. Admin review required prior to public display.
                  </p>
                </div>

                {screenshotDocs.length < 10 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add Screenshot</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={isSubmitted || uploadingDocType === 'PAST_RESULT_SCREENSHOT'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('PAST_RESULT_SCREENSHOT', file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Disclaimer banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed italic">
                Notice: "Self-reported results. Screenshots can be edited. Past performance is not indicative of future results."
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshotDocs.map((doc) => (
                  <div key={doc.id} className="relative rounded-xl border border-border overflow-hidden bg-white">
                    <img src={doc.fileUrl} alt="Result" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-600 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: TRADING STYLE & INFORMATION ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Preferred Trading Instruments */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Preferred / Special Trading Script (Instruments) <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-text-muted mb-2">Search and select up to 10 trading symbols.</p>
              <MultiSelect
                disabled={isSubmitted}
                options={INSTRUMENT_OPTIONS}
                value={preferredInstruments}
                onChange={(vals) => setPreferredInstruments(vals)}
                placeholder="Search instruments (XAUUSD, EURUSD, BTCUSD...)"
                maxSelected={10}
              />
              {fieldErrors.preferredInstruments && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.preferredInstruments}</p>
              )}
            </div>

            {/* Trading Styles */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Trading Style <span className="text-red-500">*</span> (Select all that apply)
              </label>
              <MultiSelect
                disabled={isSubmitted}
                options={TRADING_STYLE_OPTIONS}
                value={tradingStyles}
                onChange={(vals) => setTradingStyles(vals)}
                placeholder="Select trading styles..."
              />
              {fieldErrors.tradingStyles && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.tradingStyles}</p>
              )}
            </div>

            {/* Accuracy Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Self-Reported Accuracy Level (%) (Check and Fix)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    disabled={isSubmitted}
                    value={accuracyLevel}
                    onChange={(e) => setAccuracyLevel(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 78.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none pr-10"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted font-bold pointer-events-none">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1">Numerical percentage only. Public label: "Self-reported accuracy".</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Accuracy Period Note (Optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  disabled={isSubmitted}
                  value={accuracyPeriodNote}
                  onChange={(e) => setAccuracyPeriodNote(e.target.value)}
                  placeholder="e.g. last 12 months, 480 trades"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Preferred Platforms */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Preferred Trading Platforms <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                disabled={isSubmitted}
                options={PLATFORM_OPTIONS}
                value={preferredPlatforms}
                onChange={(vals) => setPreferredPlatforms(vals)}
                placeholder="Select platforms (MT4, MT5, cTrader...)"
              />
              {preferredPlatforms.includes('OTHER') && (
                <div className="mt-2">
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={otherPlatformName}
                    onChange={(e) => setOtherPlatformName(e.target.value)}
                    placeholder="Specify other platform name (e.g. TradingView, NinjaTrader)"
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Preferred Broker Type */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Preferred Broker Type <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                disabled={isSubmitted}
                options={BROKER_TYPE_OPTIONS}
                value={preferredBrokerTypes}
                onChange={(vals) => setPreferredBrokerTypes(vals)}
                placeholder="Select broker types (ECN, STP, Market Maker)..."
              />
            </div>
          </div>
        )}

        {/* ================= STEP 6: TRADING STRATEGY ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Indicators <span className="text-red-500">*</span> (max 1500 chars)
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={indicators}
                onChange={(e) => setIndicators(e.target.value)}
                placeholder="Specify standard/custom indicators used (e.g. EMA 20/50/200, RSI divergence, Volume Profile, ATR)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              {fieldErrors.indicators && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.indicators}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Technical Analysis Details <span className="text-red-500">*</span> (max 1500 chars)
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={technical}
                onChange={(e) => setTechnical(e.target.value)}
                placeholder="Explain chart structure, price action, liquidity sweeps, order blocks, Fibonacci retracements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              {fieldErrors.technical && <p className="text-[10px] text-red-500 mt-1">{fieldErrors.technical}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Signals / Entry Rules (Optional, max 200 chars)
              </label>
              <input
                type="text"
                disabled={isSubmitted}
                value={signals}
                onChange={(e) => setSignals(e.target.value)}
                placeholder="e.g. Break and retest of key H4 support with RSI confluence"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Fundamental Analysis Integration (Optional, max 1500 chars)
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={fundamentals}
                onChange={(e) => setFundamentals(e.target.value)}
                placeholder="How do macroeconomic data, interest rate differentials, inflation and central bank policies guide trades?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                News Trade Methodology (Optional, max 1500 chars)
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={newsTrade}
                onChange={(e) => setNewsTrade(e.target.value)}
                placeholder="Do you hold through NFP / FOMC / CPI releases, straddle high-impact events, or stay flat?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 7: RISK APPETITE ================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Risk-Reward Ratio <span className="text-red-500">*</span> (e.g. 1:2)
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={riskRewardRatio}
                  onChange={(e) => setRiskRewardRatio(e.target.value)}
                  placeholder="1:2 or 1:2.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
                <p className="text-[10px] text-text-muted mt-1">Format A:B (e.g. 1:2, 1:3)</p>
                {fieldErrors.riskRewardRatio && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.riskRewardRatio}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Risk Tolerance <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={isSubmitted}
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value as RiskTolerance)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                >
                  <option value="LOW">Low (Conservative)</option>
                  <option value="MODERATE">Moderate (Balanced)</option>
                  <option value="HIGH">High (Aggressive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Loss per Trade Ratio (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    max={100}
                    disabled={isSubmitted}
                    value={lossPerTradePercent}
                    onChange={(e) =>
                      setLossPerTradePercent(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="e.g. 1.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none pr-8"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted font-bold pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Trades & Lots (Based on 1000 USD balance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Daily Trades (based on a 1000 USD account balance) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  disabled={isSubmitted}
                  value={dailyTrades}
                  onChange={(e) => setDailyTrades(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Daily Lots (based on a 1000 USD account balance) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={1000}
                  disabled={isSubmitted}
                  value={dailyLots}
                  onChange={(e) => setDailyLots(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="e.g. 0.05"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Daily Stop Loss (in points) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  disabled={isSubmitted}
                  value={dailyStopLossPoints}
                  onChange={(e) =>
                    setDailyStopLossPoints(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                  }
                  placeholder="e.g. 30"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Daily Take Profit (in points) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  disabled={isSubmitted}
                  value={dailyTakeProfitPoints}
                  onChange={(e) =>
                    setDailyTakeProfitPoints(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                  }
                  placeholder="e.g. 60"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Timeframe & Trading Window */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Favourite Timeframe <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={isSubmitted}
                  value={favouriteTimeframe}
                  onChange={(e) => setFavouriteTimeframe(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                >
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Trading Time (IST) From <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  disabled={isSubmitted}
                  value={tradingTimeFrom}
                  onChange={(e) => setTradingTimeFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  {getUtcPreview(tradingTimeFrom)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Trading Time (IST) To <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  disabled={isSubmitted}
                  value={tradingTimeTo}
                  onChange={(e) => setTradingTimeTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                />
                <span className="text-[10px] text-text-muted mt-1 block">
                  {getUtcPreview(tradingTimeTo)}
                </span>
              </div>
            </div>

            {/* Loss Recovery Strategy */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Strategy for Loss Recovering the Account <span className="text-red-500">*</span> (20–2000 chars)
              </label>
              <textarea
                rows={4}
                disabled={isSubmitted}
                value={lossRecoveryStrategy}
                onChange={(e) => setLossRecoveryStrategy(e.target.value)}
                placeholder="Detail your drawdown protocols, lot-size reductions, cool-off periods, and how equity is systematically protected when a sequence of losses occurs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              <p className="text-[10px] text-text-muted mt-1">
                Confidential to compliance and admin evaluation.
              </p>
              {fieldErrors.lossRecoveryStrategy && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.lossRecoveryStrategy}</p>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 8: CLIENTS SETTLEMENTS ================= */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-2">
                Profit-Loss Sharing Settlement Cycle <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-text-muted mb-4">
                How frequently are client profits calculated and settled with you?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  [
                    { value: 'DAILY', label: 'Day', desc: 'Settlement calculated at close of each trading day' },
                    { value: 'WEEKLY', label: 'Week', desc: 'Settlement calculated every Friday / weekend' },
                    { value: 'MONTHLY', label: 'Month', desc: 'Settlement calculated at end of calendar month' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSettlementCycle(c.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition ${
                      settlementCycle === c.value
                        ? 'border-blue bg-blue-50/30'
                        : 'border-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-base font-black text-text-heading">{c.label}</div>
                    <div className="text-xs text-text-muted mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 9: SHARING & SETTLEMENTS ================= */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">
                Security From Trader to Client Funds <span className="text-red-500">*</span> (30–2000 chars)
              </label>
              <textarea
                rows={4}
                disabled={isSubmitted}
                value={clientFundSecurity}
                onChange={(e) => setClientFundSecurity(e.target.value)}
                placeholder="Explain the protections in place: e.g. client retains sole withdrawal access, trader has trading-only credentials, hard stop-losses, no overnight exposure..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
              {fieldErrors.clientFundSecurity && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.clientFundSecurity}</p>
              )}
            </div>

            {/* Broker Suggestion */}
            <div>
              <label className="block text-xs font-bold text-text-heading mb-2">
                Do you suggest a broker to clients, or can any broker be used?{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setRecommendsBroker(true)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    recommendsBroker === true
                      ? 'border-blue bg-blue-50/30'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue" />
                  <div>
                    <div className="text-sm font-bold text-text-heading">I recommend a specific broker</div>
                    <div className="text-[11px] text-text-muted">Optimized spreads, execution, and slippage</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setRecommendsBroker(false)}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    recommendsBroker === false
                      ? 'border-blue bg-blue-50/30'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-green" />
                  <div>
                    <div className="text-sm font-bold text-text-heading">Any Broker can be used</div>
                    <div className="text-[11px] text-text-muted">Client trades on their own broker of choice</div>
                  </div>
                </button>
              </div>

              {recommendsBroker === true && (
                <div className="mt-4 p-4 rounded-2xl bg-surface-tint border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Recommended Broker Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={recommendedBrokerName}
                      onChange={(e) => setRecommendedBrokerName(e.target.value)}
                      placeholder="e.g. IC Markets, Pepperstone, XM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Platform on Recommended Broker <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled={isSubmitted}
                      value={recommendedBrokerPlatform}
                      onChange={(e) => setRecommendedBrokerPlatform(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
                    >
                      <option value="MT5">MetaTrader 5 (MT5)</option>
                      <option value="MT4">MetaTrader 4 (MT4)</option>
                      <option value="CTRADER">cTrader</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sharing Percentages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Manager's Share of Client Profit (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    disabled={isSubmitted}
                    value={profitSharingPercent}
                    onChange={(e) =>
                      setProfitSharingPercent(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="e.g. 20.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none pr-8"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted font-bold pointer-events-none">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  The percentage of generated profit due to you as the manager.
                </p>
                {fieldErrors.profitSharingPercent && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.profitSharingPercent}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-heading mb-1">
                  Manager's Share of Client Loss (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    disabled={isSubmitted}
                    value={lossSharingPercent}
                    onChange={(e) =>
                      setLossSharingPercent(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="e.g. 0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none pr-8"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted font-bold pointer-events-none">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  The percentage of trading losses absorbed by the manager (typically 0%).
                </p>
                {fieldErrors.lossSharingPercent && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.lossSharingPercent}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 10: TERMS, CONDITIONS & AGREEMENTS ================= */}
        {currentStep === 10 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Scroll-to-Read Verification: </span>
              In order to accept each agreement, you must click <span className="font-bold">"Read & Accept"</span> and
              scroll to the bottom of the agreement text. Once all 7 individual agreements have been accepted, the
              Master Terms checkbox will unlock.
            </div>

            {/* List of 7 Agreements */}
            <div className="space-y-3">
              {agreements
                .filter((a) => a.key !== 'PLATFORM_TERMS')
                .map((agr) => {
                  const isAccepted = !!acceptedKeys[agr.key];
                  return (
                    <div
                      key={agr.key}
                      className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isAccepted ? 'bg-green text-white' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isAccepted ? <Check className="w-4 h-4 stroke-[3]" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-heading">{agr.title}</div>
                          <div className="text-[10px] text-text-muted">Version {agr.version}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalAgreement(agr);
                          setModalScrolledToBottom(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          isAccepted
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-blue text-white hover:bg-blue-600'
                        }`}
                      >
                        {isAccepted ? 'Accepted (Re-read)' : 'Read & Accept'}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Master Checkbox */}
            <div
              className={`p-5 rounded-2xl border-2 transition ${
                all7Accepted
                  ? 'border-blue bg-blue-50/20'
                  : 'border-border bg-gray-50/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <label className={`flex items-start gap-3 cursor-pointer ${!all7Accepted ? 'pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  disabled={!all7Accepted || isSubmitted}
                  checked={masterAgreed}
                  onChange={(e) => setMasterAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue focus:ring-blue border-border"
                />
                <div className="text-xs text-text-heading leading-relaxed">
                  <span className="font-bold">
                    I agree to the Master Terms and Conditions of EdutradeFX and confirm that all representations made
                    in this application are truthful and accurate.
                  </span>
                  <div className="text-[11px] text-text-muted mt-1">
                    Acceptance timestamp, IP address, and browser user-agent are logged for audit compliance.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ================= STEP 11: REVIEW & SUBMIT ================= */}
        {currentStep === 11 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-heading">Application Audit & Review</h3>
                <p className="text-xs text-text-muted">
                  Verify that all required sections are completed before submitting for compliance review.
                </p>
              </div>
              <span className="text-sm font-black text-blue">{profile?.completionPercent || 0}% Complete</span>
            </div>

            {/* Field Errors Warning */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>The following required fields must be resolved:</span>
                </div>
                <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                  {Object.entries(fieldErrors).map(([key, msg]) => (
                    <li key={key}>
                      <span className="font-semibold">{key}: </span>
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checklist of 10 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STEPS.slice(0, 10).map((step) => {
                const missingInStep = (profile?.missingFields || []).filter((f) => {
                  if (step.id === 1)
                    return ['entityType', 'companyLegalName', 'photo', 'address', 'countryCode', 'city', 'zipCode', 'contactEmail', 'contactPhone'].includes(f);
                  if (step.id === 2)
                    return ['isRegulated', 'regulatorName', 'regulatorRegistrationNumber', 'regulatorCountry'].includes(f);
                  if (step.id === 3) return ['bio', 'speciality', 'cvResume'].includes(f);
                  if (step.id === 4) return ['yearsExperience'].includes(f);
                  if (step.id === 5)
                    return ['preferredInstruments', 'tradingStyles', 'preferredPlatforms', 'preferredBrokerTypes'].includes(f);
                  if (step.id === 6) return ['indicators', 'technical'].includes(f);
                  if (step.id === 7)
                    return [
                      'riskRewardRatio', 'riskTolerance', 'lossPerTradePercent', 'dailyTrades',
                      'dailyLots', 'dailyStopLossPoints', 'dailyTakeProfitPoints', 'favouriteTimeframe',
                      'tradingTime', 'lossRecoveryStrategy',
                    ].includes(f);
                  if (step.id === 8) return ['settlementCycle'].includes(f);
                  if (step.id === 9)
                    return ['clientFundSecurity', 'recommendsBroker', 'profitSharingPercent', 'lossSharingPercent'].includes(f);
                  if (step.id === 10) return ['agreementsAccepted'].includes(f);
                  return false;
                });

                const isStepComplete = missingInStep.length === 0;

                return (
                  <div
                    key={step.id}
                    className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isStepComplete ? 'bg-green text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {isStepComplete ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-heading">
                          Step {step.id}: {step.title}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {isStepComplete ? 'Complete' : `${missingInStep.length} fields missing`}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className="text-xs font-bold text-blue hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Submission Action Box */}
            <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-200 text-center space-y-3">
              <h4 className="text-sm font-bold text-text-heading">Ready to Submit for Compliance Review?</h4>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Once submitted, your application will be reviewed by the EdutradeFX compliance and verification team.
                Reviews are typically completed within 24 to 48 hours.
              </p>

              <button
                type="button"
                disabled={submitting || isSubmitted || !masterAgreed || !all7Accepted}
                onClick={handleSubmitApplication}
                className="px-6 py-3 bg-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-soft transition inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Profile for Verification'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <StickyActionBar>
        {currentStep > 1 && (
          <button
            type="button"
            disabled={saving || submitting}
            onClick={() => goToStep(currentStep - 1)}
            className="px-4 py-2.5 rounded-xl border border-border bg-white text-text-heading text-xs font-bold hover:bg-surface-tint transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {currentStep < 11 && (
          <>
            <button
              type="button"
              disabled={saving || isSubmitted}
              onClick={() => handleSaveDraft(currentStep)}
              className="px-4 py-2.5 rounded-xl border border-blue text-blue bg-white text-xs font-bold hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              disabled={saving || isSubmitted}
              onClick={() => handleSaveAndNext(currentStep)}
              className="px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-600 text-white text-xs font-bold shadow-soft transition flex items-center gap-1.5"
            >
              <span>Save & Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {currentStep === 11 && (
          <button
            type="button"
            disabled={submitting || isSubmitted || !masterAgreed || !all7Accepted}
            onClick={handleSubmitApplication}
            className="px-6 py-2.5 rounded-xl bg-green hover:bg-green-600 text-white text-xs font-bold shadow-soft transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
          </button>
        )}
      </StickyActionBar>

      {/* Agreement Modal (Scroll to Bottom Gated) */}
      {activeModalAgreement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-border">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-heading">{activeModalAgreement.title}</h3>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                  Version {activeModalAgreement.version} • EdutradeFX Legal Contract
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalAgreement(null)}
                className="p-1.5 rounded-xl hover:bg-surface-tint text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div
              ref={modalScrollContainerRef}
              onScroll={handleModalScroll}
              className="p-6 overflow-y-auto space-y-4 text-xs text-text-heading leading-relaxed flex-1 bg-surface-tint/30"
            >
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                Please scroll to the bottom of this agreement text to enable the acceptance button.
              </div>
              <div className="whitespace-pre-wrap font-sans">{activeModalAgreement.body}</div>
              <div className="pt-8 text-center text-[10px] text-text-muted">
                — End of Agreement —
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-white flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {modalScrolledToBottom ? 'Scrolled to bottom' : 'Scroll down to read entire agreement'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAgreement(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text-heading"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!modalScrolledToBottom}
                  onClick={() =>
                    handleAcceptAgreement(activeModalAgreement.key, activeModalAgreement.version)
                  }
                  className="px-5 py-2 bg-blue hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-soft transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>I Accept This Agreement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountManagerOnboardingPage() {
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
      <AccountManagerOnboardingContent />
    </React.Suspense>
  );
}
