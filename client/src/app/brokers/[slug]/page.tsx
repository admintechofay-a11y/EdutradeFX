'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Layers,
  Building,
  Calendar,
  CreditCard,
  Monitor,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { MOCK_BROKERS } from '@/lib/mockData';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import RatingStars from '@/components/shared/RatingStars';
import { Badge } from '@/components/ui/badge';
import LegalNoticeBlock from '@/components/shared/LegalNoticeBlock';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';
import { api } from '@/lib/api';

export default function BrokerDetailPage({ params }: { params: { slug: string } }) {
  const initialBroker = MOCK_BROKERS.find((b) => b.slug === params.slug || b._id === params.slug) || MOCK_BROKERS[0];
  const [broker, setBroker] = useState<any>(initialBroker);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getBrokerBySlug(params.slug);
        if (isMounted && data) {
          setBroker(data);
        }
      } catch (err) {
        console.error('Failed to load broker:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  const { isInCompare, toggleCompare } = useCompare();
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'reviews' | 'risk'>('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState<any[]>([]);

  const [tabIndicatorStyle, setTabIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const currentTabEl = tabRefs.current[activeTab];
    const containerEl = tabsContainerRef.current;
    if (currentTabEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const tabRect = currentTabEl.getBoundingClientRect();
      setTabIndicatorStyle({
        left: tabRect.left - containerRect.left + containerEl.scrollLeft,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  if (!broker) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-off-white text-center">
        <h2 className="font-serif text-[32px] text-text-primary">Broker Not Found</h2>
        <p className="font-sans text-[14px] text-text-secondary mt-2">
          The broker listing you requested does not exist or has been de-listed.
        </p>
        <Link
          href="/brokers"
          className="mt-6 inline-flex items-center justify-center h-[44px] px-6 rounded-md bg-gold-primary text-navy-deepest text-[14px] font-bold uppercase tracking-wider"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const compared = isInCompare(broker.slug);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    const newRev = {
      _id: 'rev-' + Date.now(),
      userName: user ? user.name : 'Verified Trader',
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      createdAt: 'Just now',
    };

    setSubmittedReviews([newRev, ...submittedReviews]);
    setReviewTitle('');
    setReviewComment('');
  };

  // Breakdown counts for reviews
  const reviewBreakdown = [
    { stars: 5, pct: 78, count: Math.round((broker.totalReviews || 120) * 0.78) },
    { stars: 4, pct: 15, count: Math.round((broker.totalReviews || 120) * 0.15) },
    { stars: 3, pct: 4, count: Math.round((broker.totalReviews || 120) * 0.04) },
    { stars: 2, pct: 2, count: Math.round((broker.totalReviews || 120) * 0.02) },
    { stars: 1, pct: 1, count: Math.round((broker.totalReviews || 120) * 0.01) },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-off-white">
      {/* Header Zone: --color-navy-deep, padding 40px 0 */}
      <header className="bg-navy-deep border-b border-navy-border text-text-on-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb: Home > Brokers > [Name] */}
          <nav className="flex items-center gap-1.5 text-[13px] text-text-muted-dark">
            <Link href="/" className="hover:text-gold-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/brokers" className="hover:text-gold-primary transition-colors">
              Brokers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">{broker.name}</span>
          </nav>

          {/* Scam alert header if applicable */}
          {broker.scamWarning && (
            <LegalNoticeBlock title="Regulatory Caution & High-Risk Alert">
              {broker.scamDetails ||
                'Multiple complaints regarding withdrawal delays or unauthorized trade actions have been logged against this entity.'}
            </LegalNoticeBlock>
          )}

          {/* Broker Main Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Logo */}
              <div className="w-[72px] h-[72px] rounded-lg bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={broker.logo}
                  alt={broker.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-[32px] text-white font-normal leading-tight">
                    {broker.name}
                  </h1>
                  <Badge variant="verified">
                    {broker.regulation[0] || 'Regulated'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-[13px] text-text-muted-dark">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-gold-primary" />
                    {broker.headquarters}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-primary" />
                    Est. {broker.foundedYear}
                  </span>
                  <div className="flex items-center gap-1.5 text-gold-primary font-semibold">
                    <RatingStars rating={broker.rating} size="sm" showNumber />
                    <span className="text-text-muted-dark font-normal">
                      ({broker.totalReviews + submittedReviews.length} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  toggleCompare({
                    _id: broker._id,
                    name: broker.name,
                    slug: broker.slug,
                    logo: broker.logo,
                    rating: broker.rating,
                    safetyScore: broker.safetyScore,
                    eurUsdSpread: broker.eurUsdSpread,
                    minDeposit: broker.minDeposit,
                    maxLeverage: broker.maxLeverage,
                    spreadType: broker.spreadType,
                    regulation: broker.regulation,
                    tradingPlatforms: broker.tradingPlatforms,
                  })
                }
                className={`w-full sm:w-auto min-h-[44px] px-4 rounded-md text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-colors ${
                  compared
                    ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                    : 'bg-navy-surface border-navy-border text-text-on-dark hover:border-gold-primary/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                {compared ? 'In Comparison' : 'Compare'}
              </button>

              <a
                href={broker.affiliateUrl || broker.websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[44px] px-6 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[14px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Visit Broker Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Tab Navigation: bg --color-white, border-bottom 1px #E2E8F0 */}
      <nav className="sticky top-[60px] md:top-[68px] z-30 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={tabsContainerRef} className="relative flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1">
            {(['overview', 'details', 'reviews', 'risk'] as const).map((tab) => {
              const labelMap = {
                overview: 'Overview',
                details: 'Key Details',
                reviews: `Reviews (${broker.totalReviews + submittedReviews.length})`,
                risk: 'Risk Info',
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  ref={(el) => {
                    tabRefs.current[tab] = el;
                  }}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`snap-start min-h-[44px] shrink-0 py-3 sm:py-4 px-2 sm:px-0 text-[14px] whitespace-nowrap min-h-[44px] font-medium flex items-center transition-colors duration-150 ${
                    isActive
                      ? 'text-text-primary font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}

            {/* Sliding underline indicator (200ms ease) */}
            <span
              className="absolute bottom-1 h-[2px] bg-gold-primary tab-slider-underline pointer-events-none"
              style={{
                left: `${tabIndicatorStyle.left}px`,
                width: `${tabIndicatorStyle.width}px`,
              }}
            />
          </div>
        </div>
      </nav>

      {/* Tab Content Body */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 65% Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Description Box */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card space-y-4">
                <h2 className="font-serif text-[24px] text-text-primary font-normal">
                  About {broker.name}
                </h2>
                <p className="font-sans text-[15px] text-text-secondary leading-relaxed max-w-[68ch]">
                  {broker.description}
                </p>
              </div>

              {/* Key Stats Data Table: clean data table (no alternating stripes — use left border on each row instead) */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card space-y-4">
                <h3 className="font-serif text-[20px] text-text-primary font-normal">
                  Key Institutional Metrics
                </h3>
                <div className="divide-y divide-[#E2E8F0]">
                  {[
                    { label: 'Trust & Safety Score', value: `${broker.safetyScore}/100 (Tier-1 Audited)` },
                    { label: 'Primary Regulators', value: broker.regulation.join(', ') },
                    { label: 'Trading Execution Model', value: broker.spreadType },
                    { label: 'Typical EUR/USD Spread', value: `${broker.eurUsdSpread} pips` },
                    { label: 'Minimum Initial Deposit', value: `$${broker.minDeposit}` },
                    { label: 'Maximum Leverage Limit', value: broker.maxLeverage },
                    { label: 'Withdrawal Processing Time', value: broker.withdrawalTime || 'Same Day' },
                    { label: 'Headquarters Jurisdiction', value: broker.headquarters },
                    { label: 'Founded Year', value: broker.foundedYear },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 pl-4 border-l-4 border-gold-primary flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <span className="font-sans text-[14px] font-semibold text-text-secondary">
                        {row.label}
                      </span>
                      <span className="font-sans text-[15px] font-bold text-text-primary">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Types */}
              {broker.accountTypes && broker.accountTypes.length > 0 && (
                <div className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card space-y-4">
                  <h3 className="font-serif text-[20px] text-text-primary font-normal">
                    Available Account Tiers
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-text-secondary text-[12px] uppercase tracking-wide">
                          <th className="p-3 font-semibold">Account Name</th>
                          <th className="p-3 font-semibold">Min Deposit</th>
                          <th className="p-3 font-semibold">Max Leverage</th>
                          <th className="p-3 font-semibold">Spread Model</th>
                          <th className="p-3 font-semibold">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {broker.accountTypes.map((acc, i) => (
                          <tr key={i} className="hover:bg-[#FAFAFA]">
                            <td className="p-3 font-bold text-text-primary">{acc.name}</td>
                            <td className="p-3 font-medium text-text-secondary">${acc.minDeposit}</td>
                            <td className="p-3 font-medium text-text-secondary">{acc.leverage}</td>
                            <td className="p-3 font-semibold text-gold-muted">{acc.spread}</td>
                            <td className="p-3 text-text-secondary">{acc.commission}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right 35% Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Stats Card */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 shadow-card space-y-4">
                <h3 className="font-sans text-[16px] font-bold text-text-primary uppercase tracking-wide">
                  Quick Stats
                </h3>
                <div className="space-y-3 divide-y divide-[#E2E8F0] text-[14px]">
                  <div className="flex justify-between pt-2">
                    <span className="text-text-secondary">Leverage</span>
                    <span className="font-bold text-text-primary">{broker.maxLeverage}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-text-secondary">Min Deposit</span>
                    <span className="font-bold text-text-primary">${broker.minDeposit}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-text-secondary">Spreads</span>
                    <span className="font-bold text-text-primary">{broker.spreadType}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-text-secondary">Execution</span>
                    <span className="font-bold text-text-primary">ECN / STP Direct</span>
                  </div>
                </div>
              </div>

              {/* Platforms Card */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 shadow-card space-y-3">
                <h3 className="font-sans text-[16px] font-bold text-text-primary uppercase tracking-wide">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {broker.tradingPlatforms.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F1F5F9] border border-[#E2E8F0] text-text-primary"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment Methods Card */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 shadow-card space-y-3">
                <h3 className="font-sans text-[16px] font-bold text-text-primary uppercase tracking-wide">
                  Payment Methods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(broker.depositMethods || ['Bank Wire', 'Credit Card', 'Skrill', 'Neteller', 'Crypto']).map(
                    (m) => (
                      <span
                        key={m}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#F1F5F9] border border-[#E2E8F0] text-text-primary"
                      >
                        {m}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* CTA: Visit Broker Website */}
              <a
                href={broker.affiliateUrl || broker.websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[48px] rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[14px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Visit Broker Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Key Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="font-serif text-[24px] text-text-primary font-normal">
              Full Regulatory & Specification Sheet
            </h2>
            <div className="divide-y divide-[#E2E8F0]">
              {[
                { category: 'Licensing & Entities', rows: [
                  ['Regulating Authorities', broker.regulation.join(', ')],
                  ['Trust Tier', broker.safetyScore >= 90 ? 'Tier 1 (Highest Level of Trust)' : 'Tier 2 (Reliable)'],
                  ['Segregated Client Funds', 'Yes (AA-rated banks)'],
                  ['Negative Balance Protection', 'Yes (Standard retail accounts)'],
                ]},
                { category: 'Trading Conditions', rows: [
                  ['Execution Speed', 'Under 40ms avg latency'],
                  ['Hedging Allowed', 'Yes'],
                  ['Scalping Allowed', 'Yes'],
                  ['EA / Algorithmic Trading', 'Supported on all MT4/MT5 accounts'],
                  ['Islamic / Swap-Free Option', 'Available on request'],
                ]},
                { category: 'Fees & Finance', rows: [
                  ['Deposit Fees', '0% fee across major funding gateways'],
                  ['Withdrawal Processing', broker.withdrawalTime || 'Within 24 business hours'],
                  ['Inactivity Fee', '$10/month after 90 days of dormancy'],
                  ['Minimum Withdrawal', '$10'],
                ]},
              ].map((section, sIdx) => (
                <div key={sIdx} className="py-6 space-y-3">
                  <h3 className="font-sans text-[16px] font-bold text-text-primary uppercase tracking-wide">
                    {section.category}
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {section.rows.map(([k, v], rIdx) => (
                      <div
                        key={rIdx}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[14px]"
                      >
                        <span className="text-text-secondary font-medium">{k}</span>
                        <span className="font-semibold text-text-primary">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Aggregate Score & Breakdown */}
            <div className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Large star display + score + count */}
                <div className="md:col-span-5 text-center md:border-r md:border-[#E2E8F0] md:pr-8">
                  <span className="font-serif text-[64px] font-normal text-text-primary leading-none block">
                    {(broker.rating || 4.8).toFixed(1)}
                  </span>
                  <div className="flex justify-center my-3">
                    <RatingStars rating={broker.rating || 4.8} size="lg" />
                  </div>
                  <span className="font-sans text-[14px] text-text-secondary block">
                    Based on {(broker.totalReviews || 120) + submittedReviews.length} verified trader reviews
                  </span>
                </div>

                {/* Breakdown bars */}
                <div className="md:col-span-7 space-y-2">
                  {reviewBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-[13px]">
                      <span className="w-12 text-text-secondary font-medium">
                        {row.stars} ★
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                          className="h-full bg-gold-primary rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-text-secondary font-medium">
                        {row.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write a Review form (Visible only to auth users) / Login prompt */}
            {isAuthenticated ? (
              <div id="review-form-section" className="bg-white rounded-md border border-[#E2E8F0] p-6 sm:p-8 shadow-card space-y-4">
                <h3 className="font-serif text-[20px] text-text-primary font-normal">
                  Write a Review
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setReviewRating(num)}
                          className={`w-10 h-10 rounded-md border text-[14px] font-bold flex items-center justify-center transition-colors ${
                            reviewRating >= num
                              ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                              : 'border-[#D1D5DB] text-text-secondary hover:border-gold-primary'
                          }`}
                        >
                          {num} ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Review Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Transparent ECN spreads on EUR/USD"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Detailed Experience
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Discuss execution quality, slippage during news, withdrawal speed..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full p-3.5 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-[44px] px-6 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[14px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-md border border-[#E2E8F0] bg-white p-6 text-center shadow-card space-y-2">
                <Lock className="w-6 h-6 text-gold-primary mx-auto" />
                <h4 className="font-serif text-[18px] text-text-primary">
                  Sign in to leave a review
                </h4>
                <p className="font-sans text-[14px] text-text-secondary max-w-md mx-auto">
                  Only verified platform members can submit audited broker reviews to protect community integrity.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-[40px] px-6 rounded-md bg-gold-primary text-navy-deepest text-[13px] font-bold uppercase tracking-wider mt-2"
                >
                  Login to leave a review
                </Link>
              </div>
            )}

            {/* Review Cards List */}
            {broker.totalReviews === 0 && submittedReviews.length === 0 ? (
              <div className="bg-white rounded-md border border-[#E2E8F0] p-12 text-center shadow-card space-y-4">
                <p className="font-sans text-[14px] text-text-secondary">
                  No reviews yet. Be the first to review this broker.
                </p>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('review-form-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="min-h-[44px] px-6 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            ) : (
            <div className="space-y-4">
              {submittedReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white rounded-md border border-[#E2E8F0] p-6 shadow-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-mid text-gold-primary flex items-center justify-center font-bold text-[14px]">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <strong className="font-sans text-[14px] font-bold text-text-primary block">
                          {rev.userName}
                        </strong>
                        <span className="font-sans text-[12px] text-text-secondary">
                          {rev.createdAt}
                        </span>
                      </div>
                    </div>
                    <RatingStars rating={rev.rating} size="sm" showNumber />
                  </div>
                  <h4 className="font-sans text-[15px] font-bold text-text-primary pt-1">
                    {rev.title}
                  </h4>
                  <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}

              {/* Seed Review */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-6 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-mid text-gold-primary flex items-center justify-center font-bold text-[14px]">
                      D
                    </div>
                    <div>
                      <strong className="font-sans text-[14px] font-bold text-text-primary block">
                        David K., Verified Trader
                      </strong>
                      <span className="font-sans text-[12px] text-text-secondary">
                        2 months ago
                      </span>
                    </div>
                  </div>
                  <RatingStars rating={5} size="sm" showNumber />
                </div>
                <h4 className="font-sans text-[15px] font-bold text-text-primary pt-1">
                  Flawless ECN execution on EUR/USD
                </h4>
                <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
                  Execution on cTrader is virtually instantaneous with zero slippage outside tier-1 high impact news events.
                  Withdrawals processed within 3 hours directly to Skrill. Highly recommended for scalpers.
                </p>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Tab 4: Risk Info */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <LegalNoticeBlock title="High-Risk Investment & Regulatory Warning Notice">
              <p className="mb-2">
                Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) on margin carries a high level of risk and may not be suitable for all investors. Between 74% and 89% of retail investor accounts lose money when trading CFDs with regulated providers.
              </p>
              <p className="mb-2">
                The high degree of leverage offered by brokers can work against you as well as for you. Before deciding to trade with {broker.name} or any financial intermediary, evaluate your investment objectives, level of experience, and risk appetite. You could sustain a loss of some or all of your initial investment.
              </p>
              <p>
                EduTradeFX operates solely as an independent comparison, verification, and education authority. EduTradeFX is not a broker, does not accept customer deposits, and does not provide financial or investment advice. Regulatory status and fee structures are audited periodically; confirm live terms directly with the regulated entity.
              </p>
            </LegalNoticeBlock>
          </div>
        )}

        <ListingDisclaimer />
      </main>
    </div>
  );
}

