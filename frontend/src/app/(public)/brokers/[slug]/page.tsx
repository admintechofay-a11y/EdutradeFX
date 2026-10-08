'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  Star,
  Globe,
  CheckCircle,
  ExternalLink,
  Scale,
  Bookmark,
  Share2,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  Lock,
  Server,
  Users,
  CreditCard,
  Handshake,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Trophy,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../../lib/api';
import { Broker, BrokerReview } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useCompareStore } from '../../../../store/compareStore';
import { useAuthStore } from '../../../../store/authStore';

export default function BrokerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [broker, setBroker] = useState<Broker | null>(null);
  const [reviews, setReviews] = useState<BrokerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'regulation'
    | 'platforms'
    | 'accounts'
    | 'symbols'
    | 'ib-program'
    | 'banking'
    | 'awards'
    | 'policies'
    | 'reviews'
  >('overview');

  // Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Lead Form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    experience: 'BEGINNER',
    depositBudget: '100 - 500 USD',
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Review Form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { selectedBrokerIds, toggleBroker } = useCompareStore();
  const { user } = useAuthStore();

  const isCompared = broker ? selectedBrokerIds.includes(broker.id) : false;

  useEffect(() => {
    async function loadBroker() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/brokers/${slug}`);
        setBroker(res.data?.data || null);

        // Fetch reviews
        if (res.data?.data?.id) {
          const revRes = await api.get(`/brokers/${res.data.data.id}/reviews`);
          setReviews(revRes.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load broker', err);
      } finally {
        setLoading(false);
      }
    }

    loadBroker();
  }, [slug]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broker) return;
    setLeadSubmitting(true);
    try {
      await api.post(`/brokers/${broker.id}/lead`, leadForm);
      setLeadSuccess(true);
      toast.success('Your inquiry was routed directly to broker representative.');
      setTimeout(() => {
        setIsLeadModalOpen(false);
        setLeadSuccess(false);
        setLeadForm({
          name: '',
          email: '',
          phone: '',
          country: '',
          experience: 'BEGINNER',
          depositBudget: '100 - 500 USD',
        });
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broker) return;
    setReviewSubmitting(true);
    try {
      await api.post(`/brokers/${broker.id}/reviews`, reviewForm);
      setReviewSuccess(true);
      toast.success('Review submitted for moderation.');
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewForm({
          rating: 5,
          title: '',
          comment: '',
          pros: '',
          cons: '',
        });
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!broker) return;
    if (!user) {
      toast.error('Please log in to bookmark brokers to your watchlist.');
      return;
    }
    try {
      const res = await api.post(`/brokers/${broker.id}/save`);
      if (res.data?.data?.saved) {
        toast.success(`${broker.companyName} added to your watchlist.`);
      } else {
        toast.success(`${broker.companyName} removed from watchlist.`);
      }
    } catch {
      toast.error('Could not update watchlist.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-orange mb-4" />
        <h1 className="text-2xl font-black text-navy mb-2">Broker Profile Not Available</h1>
        <p className="text-sm text-text-muted max-w-md mb-6">
          The requested broker is currently pending verification or has been relocated.
        </p>
        <Link
          href="/brokers"
          className="px-6 py-2.5 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover transition"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const licenses = broker.licenses || [];
  const servers = broker.servers || [];
  const accountGroups = broker.accountGroups || [];
  const depositMethods = broker.depositMethodItems || [];
  const withdrawalMethods = broker.withdrawalMethodItems || [];
  const symbolSpecs = broker.symbolSpecs || [];
  const ibPlans = broker.ibPlans || [];
  const awards = broker.awards || [];
  const boardMembers = broker.boardMembers || [];
  const documents = (broker.documents || []).filter((d) => !d.isPrivate);

  return (
    <div className="min-h-screen bg-surface">
      {/* ── TOP HERO HEADER ───────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Logo */}
              <div className="w-24 h-24 rounded-3xl bg-surface-tint border border-border p-3 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {broker.logo ? (
                  <img src={broker.logo} alt={broker.companyName} className="max-w-full max-h-full object-contain" />
                ) : (
                  <Building2 className="w-12 h-12 text-navy" />
                )}
              </div>

              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">{broker.companyName}</h1>
                  {broker.isRegulated && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Regulated Broker
                    </span>
                  )}
                  {broker.businessType && (
                    <span className="px-3 py-1 rounded-full bg-blue/10 text-blue border border-blue/20 text-xs font-bold uppercase tracking-wider">
                      {broker.businessType}
                    </span>
                  )}
                  {broker.isFeatured && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                      ★ Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5 font-bold text-navy">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{broker.avgRating.toFixed(1)}</span>
                    <span className="text-text-muted font-normal">({broker.totalReviews} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>Founded: {broker.yearFounded || 'Established'}</span>
                  <span>•</span>
                  <span>HQ: {broker.headquarters || broker.country || 'Global'}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => toggleBroker(broker.id)}
                className={`px-4 py-2.5 rounded-full border text-xs font-bold transition flex items-center gap-2 ${
                  isCompared
                    ? 'bg-blue text-white border-blue shadow-sm'
                    : 'bg-white border-border text-navy hover:bg-surface-tint'
                }`}
              >
                <Scale className="w-4 h-4" />
                {isCompared ? 'In Compare Matrix' : 'Compare Broker'}
              </button>

              <button
                onClick={toggleWatchlist}
                className="p-2.5 rounded-full bg-white border border-border text-navy hover:bg-surface-tint transition"
                title="Save to watchlist"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-orange hover:bg-orange-hover text-white text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5"
              >
                Open Account / Inquiry
                <ArrowRight className="w-4 h-4" />
              </button>

              {broker.website && (
                <a
                  href={broker.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white border border-border text-navy hover:bg-surface-tint transition"
                  title="Visit official website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
            <div className="p-4 rounded-2xl bg-surface-tint/60 border border-border">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Min Deposit</div>
              <div className="text-lg font-black text-navy mt-0.5">
                {broker.minDeposit ? `$${broker.minDeposit}` : 'No Minimum'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-tint/60 border border-border">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Max Leverage</div>
              <div className="text-lg font-black text-blue mt-0.5">{broker.maxLeverage || '1:500'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-tint/60 border border-border">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Spreads From</div>
              <div className="text-lg font-black text-emerald-600 mt-0.5">{broker.spreadsFrom || '0.0 Pips'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-tint/60 border border-border">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Commission Per Lot</div>
              <div className="text-lg font-black text-navy mt-0.5">{broker.commissions || '$0 / Zero'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 10 TAB NAVIGATION STRIP ─────────────────────────── */}
      <div className="sticky top-16 z-20 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto no-scrollbar py-3 text-xs font-bold">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'regulation', label: `Regulation (${licenses.length})` },
              { id: 'platforms', label: 'Platforms & Servers' },
              { id: 'accounts', label: `Accounts (${accountGroups.length})` },
              { id: 'symbols', label: `Tradable Symbols (${symbolSpecs.length})` },
              { id: 'ib-program', label: 'IB Program' },
              { id: 'banking', label: 'Deposit & Withdrawal' },
              { id: 'awards', label: 'Awards & Highlights' },
              { id: 'policies', label: `Policies (${documents.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap pb-2 pt-1 relative transition ${
                  activeTab === tab.id ? 'text-blue' : 'text-text-muted hover:text-navy'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── MAIN TAB WORKSPACE ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
                <h3 className="text-base font-black text-navy uppercase tracking-wider">
                  About {broker.companyName}
                </h3>
                <p className="text-sm text-text-body leading-relaxed whitespace-pre-line">
                  {broker.description ||
                    `${broker.companyName} is an internationally recognized multi-asset brokerage offering interbank liquidity, raw pricing, and flexible leverage for retail and institutional traders.`}
                </p>
                {broker.platformDescription && (
                  <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-muted leading-relaxed">
                    <strong className="text-navy block mb-1">Execution & Server Architecture:</strong>
                    {broker.platformDescription}
                  </div>
                )}
              </div>

              {/* Board Members */}
              {boardMembers.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
                  <h3 className="text-base font-black text-navy uppercase tracking-wider">
                    Executive Leadership & Board of Directors
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {boardMembers.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-4 rounded-2xl border border-border bg-surface-tint/50 flex items-center gap-3.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue/10 text-blue font-black flex items-center justify-center shrink-0 overflow-hidden">
                          {bm.photoUrl ? (
                            <img src={bm.photoUrl} alt={bm.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy">{bm.fullName}</div>
                          <div className="text-[11px] text-text-muted">{bm.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported Currencies & Instruments */}
              <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
                <h3 className="text-base font-black text-navy uppercase tracking-wider">
                  Supported Account Currencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {broker.accountCurrencies && broker.accountCurrencies.length > 0 ? (
                    broker.accountCurrencies.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1.5 rounded-full bg-surface-tint text-navy text-xs font-bold border border-border"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">USD, EUR, GBP, AUD</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Overview Snapshot */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
                <h4 className="text-xs font-black text-navy uppercase tracking-wider">Corporate Snapshot</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Legal Entity</span>
                    <span className="font-bold text-navy text-right">{broker.registeredName || broker.companyName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Country</span>
                    <span className="font-bold text-navy">{broker.country || 'Global'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">City / Address</span>
                    <span className="font-bold text-navy text-right">{broker.city || broker.headquarters || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Negative Balance Protection</span>
                    <span className="font-bold text-emerald-600">
                      {broker.negativeBalanceProtection !== false ? 'Active ✓' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Tradable Symbols</span>
                    <span className="font-bold text-navy">{broker.totalTradableSymbols || '500+'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-text-muted">Customer Support</span>
                    <span className="font-bold text-navy">{broker.supportAvailability || '24/5 Live Chat'}</span>
                  </div>
                </div>
              </div>

              {/* Funds Security Policy */}
              {broker.fundsSecurity && (
                <div className="p-6 rounded-3xl bg-blue/10 border border-blue/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue" />
                    <h4 className="text-xs font-black uppercase text-navy tracking-wider">Funds Security</h4>
                  </div>
                  <p className="text-xs text-navy leading-relaxed">{broker.fundsSecurity}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGULATION & LICENSES */}
        {activeTab === 'regulation' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <h3 className="text-base font-black text-navy uppercase tracking-wider">
                Regulatory Authorisations & Licenses
              </h3>
              <p className="text-xs text-text-muted">
                EdutradeFX tracks and verifies official licenses issued by financial conduct authorities.
              </p>

              {licenses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {licenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="p-5 rounded-2xl border border-border bg-surface-tint/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-navy flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue" />
                          {lic.regulatoryBody}
                        </span>
                        {lic.verifiedByAdmin ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            Verified by Admin ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Under Audit
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-muted">License / Reg #:</span>
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
                            Regulator Registry Entry
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
                            View License PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-muted">
                  No independent licenses currently filed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORMS & SERVERS */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-navy uppercase tracking-wider">Supported Trading Platforms</h3>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {(broker.availablePlatforms && broker.availablePlatforms.length > 0
                    ? broker.availablePlatforms
                    : ['MetaTrader 4', 'MetaTrader 5', 'WebTrader']
                  ).map((p) => (
                    <span
                      key={p}
                      className="px-3.5 py-1.5 rounded-full bg-blue text-white text-xs font-bold shadow-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-base font-black text-navy uppercase tracking-wider">Supported Hardware & Devices</h3>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {(broker.deviceSupport && broker.deviceSupport.length > 0
                    ? broker.deviceSupport
                    : ['Windows PC', 'macOS', 'iOS', 'Android']
                  ).map((d) => (
                    <span
                      key={d}
                      className="px-3.5 py-1.5 rounded-full bg-surface-tint border border-border text-navy text-xs font-bold"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Servers */}
              {servers.length > 0 && (
                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="text-base font-black text-navy uppercase tracking-wider">Trading Server Clusters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {servers.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-2xl border border-border bg-surface-tint/50 flex items-center gap-3"
                      >
                        <Server className="w-5 h-5 text-blue shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-navy">{s.name}</div>
                          <div className="text-[10px] text-text-muted">{s.location || 'Equinix Datacenter'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TRADING ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountGroups.map((group) => (
                <div
                  key={group.id}
                  className="p-6 rounded-3xl border border-border bg-white shadow-sm flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue">
                          {group.currency || 'USD'} Account
                        </span>
                        <h4 className="text-lg font-black text-navy mt-0.5">{group.name}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-surface-tint text-navy text-[10px] font-bold border border-border">
                        {group.spreadType}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-text-muted">Spreads:</span>
                        <span className="font-bold text-emerald-600">{group.spreadFrom || '0.0 pips'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-text-muted">Min Deposit:</span>
                        <span className="font-bold text-navy">
                          {group.minDeposit ? `$${group.minDeposit}` : 'No Minimum'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-text-muted">Max Leverage:</span>
                        <span className="font-bold text-blue">{group.leverageUpTo || '1:500'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-text-muted">Commission:</span>
                        <span className="font-bold text-navy">{group.feesPerLot || '$0'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-text-muted">Execution:</span>
                        <span className="font-bold text-navy">{group.orderExecution || 'Market'}</span>
                      </div>
                    </div>

                    {/* Permission Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {group.eaAllowed && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          EAs Allowed
                        </span>
                      )}
                      {group.hedgingAllowed && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Hedging
                        </span>
                      )}
                      {group.scalpingAllowed && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Scalping
                        </span>
                      )}
                      {group.swapFree && (
                        <span className="px-2 py-0.5 rounded-md bg-blue/10 text-blue text-[10px] font-bold">
                          Swap-Free
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full py-2.5 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover transition"
                  >
                    Open {group.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TRADABLE SYMBOL SPECS */}
        {activeTab === 'symbols' && (
          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
            <h3 className="text-base font-black text-navy uppercase tracking-wider">
              Benchmark Symbol Specifications
            </h3>
            <p className="text-xs text-text-muted">
              Live spreads, contract sizes, and margin requirements across key instruments.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-tint border-b border-border text-navy font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Asset Category</th>
                    <th className="p-3">Contract Size</th>
                    <th className="p-3">Average Spread</th>
                    <th className="p-3">Decimals / Precision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-navy">
                  {symbolSpecs.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-tint/50">
                      <td className="p-3 font-bold text-blue">{s.symbol}</td>
                      <td className="p-3">{s.category}</td>
                      <td className="p-3">{s.contractSize || 'Standard Lot'}</td>
                      <td className="p-3 font-bold text-emerald-600">{s.spreadAvg || '0.1 pips'}</td>
                      <td className="p-3">{s.precision ?? 5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: IB PROGRAM */}
        {activeTab === 'ib-program' && (
          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-navy uppercase tracking-wider">
                Introducing Broker (IB) & Affiliate Programs
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Monetize trading communities with competitive rebates and multi-tier sub-IB payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ibPlans.map((plan) => (
                <div key={plan.id} className="p-5 rounded-2xl border border-border bg-surface-tint/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-navy">{plan.planName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue text-white text-[10px] font-bold uppercase">
                      {plan.settlementCycle}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Commission / Lot:</span>
                      <span className="font-bold text-navy">{plan.commissionPerLot || 'Custom'}</span>
                    </div>
                    {plan.rebatePercentage && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Rebate Share:</span>
                        <span className="font-bold text-emerald-600">{plan.rebatePercentage}%</span>
                      </div>
                    )}
                    {plan.subIbCommission && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Sub-IB Tier:</span>
                        <span className="font-bold text-navy">{plan.subIbCommission}</span>
                      </div>
                    )}
                  </div>
                  {plan.notes && (
                    <div className="text-[11px] text-text-muted pt-2 border-t border-border">{plan.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BANKING (DEPOSITS & WITHDRAWALS) */}
        {activeTab === 'banking' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Deposits */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <h3 className="text-base font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                Deposit Payment Gateways
              </h3>
              <div className="space-y-3">
                {depositMethods.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-border bg-surface-tint/40 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy">{m.name}</div>
                      <div className="text-[10px] text-text-muted">Currency: {m.currency}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">
                        {m.feePct === 0 ? 'Zero Fee (0%)' : `${m.feePct}%`}
                      </div>
                      <div className="text-[10px] text-text-muted">{m.processingTime || 'Instant'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawals */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
              <h3 className="text-base font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-blue" />
                Withdrawal Payment Rails
              </h3>
              <div className="space-y-3">
                {withdrawalMethods.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-border bg-surface-tint/40 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy">{m.name}</div>
                      <div className="text-[10px] text-text-muted">Min: ${m.minWithdrawal || 20}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy">{m.feePct === 0 ? 'Free' : `${m.feePct}%`}</div>
                      <div className="text-[10px] text-text-muted">{m.processingTime || '1-3 Days'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AWARDS & PROS/CONS */}
        {activeTab === 'awards' && (
          <div className="space-y-8">
            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths (Pros)
                </h4>
                <div className="space-y-2 text-xs text-navy font-semibold">
                  {(broker.prosList && broker.prosList.length > 0
                    ? broker.prosList
                    : ['Raw interbank spreads from 0.0 pips', 'Regulated in major financial centres']
                  ).map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Trade-offs (Cons)
                </h4>
                <div className="space-y-2 text-xs text-navy font-semibold">
                  {(broker.consList && broker.consList.length > 0
                    ? broker.consList
                    : ['Inactivity fee after extended duration', 'Regional restrictions apply']
                  ).map((c, i) => (
                    <div key={i}>• {c}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Awards */}
            {awards.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
                <h3 className="text-base font-black text-navy uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Industry Awards & Accreditations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {awards.map((awd) => (
                    <div
                      key={awd.id}
                      className="p-4 rounded-2xl border border-border bg-surface-tint/50 flex items-start gap-3"
                    >
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">
                        {awd.year}
                      </span>
                      <div>
                        <div className="text-xs font-black text-navy">{awd.awardFor}</div>
                        <div className="text-[11px] text-text-muted">
                          {awd.expo} {awd.expoLocation ? `• ${awd.expoLocation}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: POLICIES & LEGAL DISCLOSURES */}
        {activeTab === 'policies' && (
          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-4">
            <h3 className="text-base font-black text-navy uppercase tracking-wider">
              Legal Documents & Platform Disclosures
            </h3>
            <p className="text-xs text-text-muted">Official verified PDF disclosures available for download.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-border bg-surface-tint/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue" />
                    <div>
                      <div className="text-xs font-bold text-navy">{doc.docType.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-text-muted">{doc.fileName || 'PDF Document'}</div>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-white border border-border text-xs font-bold text-blue hover:bg-blue hover:text-white transition"
                  >
                    View PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: REVIEWS & RATINGS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-navy uppercase tracking-wider">Community Reviews</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Verified feedback from registered traders on EdutradeFX.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover transition shadow-sm"
              >
                Write a Review
              </button>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-6 rounded-3xl bg-white border border-border shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue/10 text-blue font-bold flex items-center justify-center text-sm">
                          {rev.user?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-black text-navy">{rev.user?.name || 'Verified Trader'}</div>
                          <div className="text-[10px] text-text-muted">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h5 className="text-xs font-black text-navy">{rev.title}</h5>
                    <p className="text-xs text-text-body leading-relaxed">{rev.comment}</p>

                    {/* Broker Response */}
                    {rev.brokerResponse && (
                      <div className="p-3.5 rounded-2xl bg-surface-tint border border-border text-xs space-y-1">
                        <div className="font-black text-blue text-[11px] uppercase tracking-wider">
                          Official Broker Response:
                        </div>
                        <p className="text-text-muted">{rev.brokerResponse}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 rounded-3xl bg-white border border-border text-center text-xs text-text-muted">
                  No published reviews yet. Be the first to share your experience with {broker.companyName}!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── LEAD INQUIRY MODAL ─────────────────────────────── */}
      <Modal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        maxWidth="md"
        title="Open Account / Direct Inquiry"
        subtitle={`Direct contact with ${broker.companyName}`}
      >
        <form onSubmit={handleLeadSubmit} className="space-y-3.5">
          <input
            type="text"
            required
            value={leadForm.name}
            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
            placeholder="Full Name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />
          <input
            type="email"
            required
            value={leadForm.email}
            onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
            placeholder="Email Address"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />
          <input
            type="tel"
            value={leadForm.phone}
            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
            placeholder="Phone / WhatsApp"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />
          <input
            type="text"
            value={leadForm.country}
            onChange={(e) => setLeadForm({ ...leadForm, country: e.target.value })}
            placeholder="Residence Country"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLeadModalOpen(false)}
              className="px-4 py-2 rounded-full border border-border text-xs font-bold text-navy hover:bg-surface-tint"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={leadSubmitting}
              className="px-5 py-2 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover disabled:opacity-40"
            >
              {leadSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── WRITE REVIEW MODAL ─────────────────────────────── */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        maxWidth="md"
        title={`Review ${broker.companyName}`}
        subtitle="Share your verified trading experience"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-navy block mb-1">Your Rating</label>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) || 5 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue bg-white"
            >
              <option value={5}>★★★★★ (5 Stars - Excellent)</option>
              <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
              <option value={3}>★★★☆☆ (3 Stars - Average)</option>
              <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
              <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
            </select>
          </div>

          <input
            type="text"
            required
            value={reviewForm.title}
            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
            placeholder="Review Headline"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />

          <textarea
            required
            rows={3}
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            placeholder="Detailed review commentary..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-navy focus:outline-none focus:border-blue"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 rounded-full border border-border text-xs font-bold text-navy hover:bg-surface-tint"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-5 py-2 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover disabled:opacity-40"
            >
              {reviewSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
