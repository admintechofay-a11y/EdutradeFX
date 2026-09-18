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
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Broker, BrokerReview } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { useCompareStore } from '../../../../store/compareStore';
import { useAuthStore } from '../../../../store/authStore';

export default function BrokerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [broker, setBroker] = useState<Broker | null>(null);
  const [reviews, setReviews] = useState<BrokerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'regulation' | 'trading' | 'payment' | 'reviews'>('overview');

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

  const { selectedBrokerIds, addBroker, removeBroker } = useCompareStore();
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
      await api.post(`/brokers/${broker.id}/leads`, leadForm);
      setLeadSuccess(true);
      setTimeout(() => {
        setIsLeadModalOpen(false);
        setLeadSuccess(false);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
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
      // Reload reviews
      const revRes = await api.get(`/brokers/${broker.id}/reviews`);
      setReviews(revRes.data?.data || []);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewForm({ rating: 5, title: '', comment: '', pros: '', cons: '' });
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review. Please ensure you are logged in.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-12 w-96 rounded-xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Broker Not Found</h2>
        <p className="text-slate-400 mb-6">The requested broker profile does not exist or has been removed.</p>
        <Link
          href="/brokers"
          className="px-6 py-2.5 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-slate-100">
      {/* ─── Profile Header / Hero ───────────────────────────────── */}
      <div className="bg-brand-navy-card/80 border-b border-slate-800 backdrop-blur-md pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-navy-light border border-slate-700 flex items-center justify-center p-3 overflow-hidden shadow-xl shrink-0">
                {broker.logo ? (
                  <img src={broker.logo} alt={broker.companyName} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{broker.companyName}</h1>
                  {broker.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber text-xs font-bold border border-brand-amber/30">
                      FEATURED
                    </span>
                  )}
                  {broker.regulation && broker.regulation.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Regulated
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={broker.avgRating} />
                    <span className="font-bold text-white ml-1">{broker.avgRating.toFixed(1)}</span>
                    <span>({broker.totalReviews} reviews)</span>
                  </div>
                  {broker.headquarters && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {broker.headquarters}
                    </span>
                  )}
                  {broker.yearFounded && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Est. {broker.yearFounded}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => (isCompared ? removeBroker(broker.id) : addBroker(broker.id))}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                  isCompared
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-brand-navy-light text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>

              {broker.website && (
                <a
                  href={broker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-navy-light text-slate-300 border border-slate-700 hover:border-slate-500 transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}

              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-blue to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <span>Open Live Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-brand-navy-light/60 border border-slate-800">
              <div className="text-xs text-slate-400 mb-0.5">Min Deposit</div>
              <div className="text-base font-bold text-white">
                {broker.minDeposit ? `$${broker.minDeposit}` : 'No Minimum'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-navy-light/60 border border-slate-800">
              <div className="text-xs text-slate-400 mb-0.5">Max Leverage</div>
              <div className="text-base font-bold text-brand-amber">
                {broker.maxLeverage || '1:500'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-navy-light/60 border border-slate-800">
              <div className="text-xs text-slate-400 mb-0.5">Spreads From</div>
              <div className="text-base font-bold text-emerald-400">
                {broker.spreadsFrom || '0.0 Pips'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-navy-light/60 border border-slate-800">
              <div className="text-xs text-slate-400 mb-0.5">Commissions</div>
              <div className="text-base font-bold text-white">
                {broker.commissions || '$0 / Zero'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-brand-navy-card/40 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto no-scrollbar py-3">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'regulation', label: 'Regulations & Licenses' },
              { id: 'trading', label: 'Trading & Fees' },
              { id: 'payment', label: 'Deposit & Withdrawal' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-sm font-semibold whitespace-nowrap transition-colors relative py-2 ${
                  activeTab === tab.id ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Tab Contents ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">About {broker.companyName}</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                  {broker.description ||
                    `${broker.companyName} is an internationally recognized multi-asset Forex and CFD broker offering institutional liquidity, ultra-low raw spreads, and flexible leverage options. Established in ${broker.yearFounded || 2012}, the company serves retail and professional clients worldwide with Tier-1 regulatory protection.`}
                </p>
              </div>

              {/* Instruments Matrix */}
              <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">Tradable Instruments</h3>
                <div className="flex flex-wrap gap-2">
                  {broker.instruments && broker.instruments.length > 0 ? (
                    broker.instruments.map((inst, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-brand-navy-light text-slate-200 text-xs font-semibold border border-slate-700"
                      >
                        {inst}
                      </span>
                    ))
                  ) : (
                    ['Forex Majors', 'Forex Minors', 'Indices', 'Commodities', 'Cryptos', 'Precious Metals'].map(
                      (inst, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-brand-navy-light text-slate-200 text-xs font-semibold border border-slate-700"
                        >
                          {inst}
                        </span>
                      )
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Quick Summary Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Trading Snapshot
                </h4>
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Headquarters</span>
                    <span className="font-semibold text-white">{broker.headquarters || 'London, UK'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Year Founded</span>
                    <span className="font-semibold text-white">{broker.yearFounded || 2010}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Min Deposit</span>
                    <span className="font-semibold text-white">${broker.minDeposit || 10}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Max Leverage</span>
                    <span className="font-semibold text-brand-amber">{broker.maxLeverage || '1:500'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Scalping / Hedging</span>
                    <span className="font-semibold text-emerald-400">Permitted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Islamic / Swap-Free</span>
                    <span className="font-semibold text-emerald-400">Available</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="w-full mt-6 py-3 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-500/20"
                >
                  Contact Broker Rep
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regulation Tab */}
        {activeTab === 'regulation' && (
          <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Verified Regulatory Licenses</h3>
              <p className="text-sm text-slate-400">
                EdutradeFX conducts quarterly verification checks on all regulatory declarations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {broker.regulation && broker.regulation.length > 0 ? (
                broker.regulation.map((reg, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-brand-navy-light/70 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{reg}</div>
                        <div className="text-xs text-slate-400">Official Regulatory Authorization</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-brand-navy-light border border-slate-700 text-slate-400 text-sm">
                  Standard regulatory records pending verification.
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-brand-amber mt-0.5" />
              <span>
                Risk Warning: Trading Forex and Leveraged Financial Instruments carries substantial risk of loss. Always trade under your local regulatory jurisdiction.
              </span>
            </div>
          </div>
        )}

        {/* Trading Accounts & Fees Tab */}
        {activeTab === 'trading' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Supported Trading Platforms</h3>
              <div className="flex flex-wrap gap-3">
                {broker.tradingPlatforms && broker.tradingPlatforms.length > 0 ? (
                  broker.tradingPlatforms.map((plat, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-brand-navy-light border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-brand-blue" />
                      <span>{plat}</span>
                    </div>
                  ))
                ) : (
                  ['MetaTrader 4 (MT4)', 'MetaTrader 5 (MT5)', 'cTrader', 'WebTrader'].map((plat, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-brand-navy-light border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-brand-blue" />
                      <span>{plat}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Account Types Available</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {broker.accountTypes && broker.accountTypes.length > 0 ? (
                  broker.accountTypes.map((type, i) => (
                    <div key={i} className="p-4 rounded-xl bg-brand-navy-light border border-slate-700">
                      <div className="text-sm font-bold text-white mb-1">{type}</div>
                      <div className="text-xs text-slate-400">Leverage up to {broker.maxLeverage || '1:500'}</div>
                    </div>
                  ))
                ) : (
                  ['Standard STP', 'Raw ECN', 'Islamic Swap-Free'].map((type, i) => (
                    <div key={i} className="p-4 rounded-xl bg-brand-navy-light border border-slate-700">
                      <div className="text-sm font-bold text-white mb-1">{type}</div>
                      <div className="text-xs text-slate-400">Leverage up to {broker.maxLeverage || '1:500'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment & Banking Tab */}
        {activeTab === 'payment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">Deposit Gateways</h3>
              <div className="flex flex-wrap gap-2">
                {broker.depositMethods && broker.depositMethods.length > 0 ? (
                  broker.depositMethods.map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      {m}
                    </span>
                  ))
                ) : (
                  ['Bank Wire', 'Visa / Mastercard', 'Crypto (USDT/BTC)', 'Skrill', 'Neteller'].map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      {m}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4">Withdrawal Gateways</h3>
              <div className="flex flex-wrap gap-2">
                {broker.withdrawMethods && broker.withdrawMethods.length > 0 ? (
                  broker.withdrawMethods.map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      {m}
                    </span>
                  ))
                ) : (
                  ['Bank Wire', 'Visa / Mastercard', 'Crypto (USDT)', 'Skrill', 'Neteller'].map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      {m}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Community Trader Reviews</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Real experiences from verified live accounts.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition shadow"
              >
                Write a Review
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
                          {rev.user?.name ? rev.user.name[0].toUpperCase() : 'T'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{rev.user?.name || 'Verified Trader'}</span>
                            {rev.isVerified && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Verified Trader
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-200">{rev.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{rev.comment}</p>

                    {(rev.pros || rev.cons) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                        {rev.pros && (
                          <div className="flex items-start gap-1.5 text-emerald-400">
                            <ThumbsUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>
                              <strong>Pros:</strong> {rev.pros}
                            </span>
                          </div>
                        )}
                        {rev.cons && (
                          <div className="flex items-start gap-1.5 text-rose-400">
                            <ThumbsDown className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>
                              <strong>Cons:</strong> {rev.cons}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {rev.brokerResponse && (
                      <div className="mt-4 p-3.5 rounded-xl bg-brand-navy-light/60 border border-slate-800 text-xs space-y-1">
                        <div className="font-semibold text-brand-blue flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{broker.companyName} Official Response</span>
                        </div>
                        <p className="text-slate-300">{rev.brokerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-brand-navy-card rounded-2xl border border-slate-800">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">No Reviews Yet</h4>
                <p className="text-sm text-slate-400 mb-6">
                  Be the first verified trader to share an honest review about {broker.companyName}.
                </p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-semibold"
                >
                  Submit First Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modal 1: Lead Capture Form ──────────────────────────── */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-brand-navy-card border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {leadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Enquiry Sent Successfully!</h3>
                <p className="text-sm text-slate-300">
                  An institutional representative from {broker.companyName} will contact you directly within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Connect with {broker.companyName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fast-track your VIP onboarding, lowest raw spreads, and swap-free setup.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="+1 555 019 283"
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={leadForm.country}
                      onChange={(e) => setLeadForm({ ...leadForm, country: e.target.value })}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Target</label>
                    <select
                      value={leadForm.depositBudget}
                      onChange={(e) => setLeadForm({ ...leadForm, depositBudget: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      <option value="100 - 500 USD">100 - 500 USD</option>
                      <option value="500 - 2,000 USD">500 - 2,000 USD</option>
                      <option value="2,000 - 10,000 USD">2,000 - 10,000 USD</option>
                      <option value="10,000+ USD VIP">10,000+ USD (VIP Tier)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={leadSubmitting}
                    className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {leadSubmitting ? 'Sending Request...' : 'Submit & Open Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal 2: Review Form ────────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-brand-navy-card border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-1">Review Submitted!</h3>
                <p className="text-xs text-slate-300">
                  Thank you for contributing to transparency in retail Forex.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Review {broker.companyName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Share your execution and deposit/withdrawal experience.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
                              ? 'text-brand-amber fill-brand-amber'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g. Tight spreads on EURUSD and fast crypto payouts"
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Describe slippage during news, customer support responsiveness, and withdrawal times..."
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">Pros</label>
                    <input
                      type="text"
                      value={reviewForm.pros}
                      onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                      placeholder="e.g. 0.0 pip spreads, cTrader"
                      className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1">Cons</label>
                    <input
                      type="text"
                      value={reviewForm.cons}
                      onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                      placeholder="e.g. Wire transfer fee"
                      className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition"
                >
                  {reviewSubmitting ? 'Posting Review...' : 'Publish Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
