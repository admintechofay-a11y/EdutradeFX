'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Star,
  Flag,
  Search,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Scale,
  Award,
  Lock,
  FileText,
  AlertTriangle,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  MOCK_BROKERS,
  MOCK_ACCOUNT_MANAGERS,
  MOCK_SIGNAL_PROVIDERS,
  MOCK_COURSES,
} from '@/lib/mockData';
import BrokerCard from '@/components/ui/BrokerCard';
import ManagerCard from '@/components/ui/ManagerCard';
import CourseCard from '@/components/ui/CourseCard';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [activeSearchTab, setActiveSearchTab] = useState<'brokers' | 'managers' | 'signals' | 'courses'>('brokers');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [brokersList, setBrokersList] = useState<any[]>(MOCK_BROKERS);
  const [managersList, setManagersList] = useState<any[]>(MOCK_ACCOUNT_MANAGERS);
  const [signalsList, setSignalsList] = useState<any[]>(MOCK_SIGNAL_PROVIDERS);
  const [coursesList, setCoursesList] = useState<any[]>(MOCK_COURSES);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const [b, m, s, c] = await Promise.all([
          api.getBrokers(),
          api.getAccountManagers(),
          api.getSignalProviders(),
          api.getCourses({ approvalStatus: 'all', status: 'all' }),
        ]);
        if (!isMounted) return;
        if (Array.isArray(b) && b.length > 0) setBrokersList(b);
        if (Array.isArray(m) && m.length > 0) setManagersList(m);
        if (Array.isArray(s) && s.length > 0) setSignalsList(s);
        if (Array.isArray(c) && c.length > 0) setCoursesList(c);
      } catch (err) {
        console.error('Failed to load featured data:', err);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const currentTabEl = tabRefs.current[activeSearchTab];
    const containerEl = tabsContainerRef.current;
    if (currentTabEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const tabRect = currentTabEl.getBoundingClientRect();
      setTabIndicatorStyle({
        left: tabRect.left - containerRect.left + containerEl.scrollLeft,
        width: tabRect.width,
      });
    }
  }, [activeSearchTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = encodeURIComponent(searchQuery.trim());
    if (activeSearchTab === 'brokers') router.push(`/brokers?search=${q}`);
    else if (activeSearchTab === 'managers') router.push(`/account-managers?search=${q}`);
    else if (activeSearchTab === 'signals') router.push(`/signal-providers?search=${q}`);
    else if (activeSearchTab === 'courses') router.push(`/education?search=${q}`);
  };

  // Featured slices
  const featuredBrokers = brokersList.slice(0, 6);
  const featuredManagers = managersList.slice(0, 3);
  const featuredSignals = signalsList.slice(0, 3);
  const featuredCourses = coursesList.slice(0, 3);

  // Mock broker for hero preview
  const heroBrokerPrimary = brokersList[0] || MOCK_BROKERS[0] || {
    name: 'Pepperstone',
    slug: 'pepperstone',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
    country: 'Australia',
    regulation: ['ASIC', 'FCA'],
    rating: 4.8,
    totalReviews: 342,
    maxLeverage: '1:500',
    minDeposit: 0,
    eurUsdSpread: 0.1,
    tradingPlatforms: ['MT4', 'MT5', 'cTrader'],
    featured: true,
  };

  const heroBrokerSecondary = MOCK_BROKERS[1] || {
    name: 'IC Markets',
    slug: 'ic-markets',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
    country: 'Australia',
    regulation: ['ASIC', 'CySEC'],
    rating: 4.7,
    totalReviews: 289,
    maxLeverage: '1:500',
    minDeposit: 200,
    eurUsdSpread: 0.0,
    tradingPlatforms: ['MT4', 'MT5'],
    featured: true,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============================================================ */}
      {/* SECTION 1 — HERO                                            */}
      {/* ============================================================ */}
      <section className="relative bg-navy-deepest min-h-[600px] lg:h-screen lg:min-h-[720px] flex items-center overflow-hidden">
        {/* Subtle texture: SVG grid pattern at 4% opacity */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-0 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content: 55% split on desktop, 1-col centered on mobile & tablet */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Eyebrow line */}
              <p className="hero-fade-1 font-sans text-[12px] font-semibold text-gold-primary uppercase tracking-widest mx-auto lg:mx-0">
                INDEPENDENT FOREX INTELLIGENCE PLATFORM
              </p>

              {/* Headline: DM Serif Display 56px --color-white line-height 1.05 */}
              <h1 className="hero-fade-2 font-serif text-[38px] sm:text-[48px] lg:text-[56px] text-white leading-[1.05] tracking-tight mx-auto lg:mx-0">
                Compare Brokers. Verify Managers. Trade Smarter.
              </h1>

              {/* Subheadline: Inter 18px --color-text-muted-dark line-height 1.6 max-width 480px */}
              <p className="hero-fade-3 font-sans text-[16px] sm:text-[18px] text-text-muted-dark leading-[1.6] max-w-[480px] mx-auto lg:mx-0">
                The independent trust authority empowering retail traders with audited spreads, verified manager track records, and formal dispute mediation.
              </p>

              {/* Two CTA buttons: full-width stacked on mobile, side-by-side on sm+ */}
              <div className="hero-fade-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto">
                {/* Primary Button */}
                <Link href="/brokers" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-[44px] px-[28px] bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold rounded-md hover:-translate-y-[1px] active:translate-y-0 transition-[transform,background-color] duration-150 ease-out"
                  >
                    Explore Brokers
                  </button>
                </Link>

                {/* Secondary (ghost) Button */}
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-[44px] px-[28px] bg-white/[0.06] border border-white/[0.12] text-text-on-dark font-sans text-[14px] font-medium rounded-md hover:bg-white/[0.10] hover:-translate-y-[1px] active:translate-y-0 transition-[transform,background-color] duration-150 ease-out"
                  >
                    How It Works
                  </button>
                </a>
              </div>

              {/* 3 Trust Signals */}
              <div className="hero-fade-5 pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-text-muted-dark font-sans text-[13px]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>500+ Verified Brokers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>12,000+ Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gold-primary shrink-0" />
                  <span>40+ Countries</span>
                </div>
              </div>
            </div>

            {/* Right content (desktop only): 45% split, hidden on mobile & tablet */}
            <div className="hidden lg:block lg:col-span-5 relative">
              {/* Subtle glow: radial-gradient gold-primary at 6% opacity centered on cards */}
              <div
                className="absolute inset-0 -m-12 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(6,13,31,0) 70%)',
                }}
              />

              {/* Offset rotated background card */}
              <div className="absolute top-6 left-6 w-full -rotate-3 opacity-60 pointer-events-none transform">
                <BrokerCard broker={heroBrokerSecondary} />
              </div>

              {/* Foreground card mockup */}
              <div className="relative z-10 w-full shadow-2xl">
                <BrokerCard broker={heroBrokerPrimary} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — SEARCH / DISCOVERY BAR                          */}
      {/* ============================================================ */}
      <section className="bg-white py-[40px] border-b border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative z-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* 4 Tabs with sliding underline: [Brokers] [Account Managers] [Signal Providers] [Courses] */}
          <div ref={tabsContainerRef} className="relative flex items-center gap-4 sm:gap-6 border-b border-[#E2E8F0] pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'brokers', label: 'Brokers' },
              { id: 'managers', label: 'Account Managers' },
              { id: 'signals', label: 'Signal Providers' },
              { id: 'courses', label: 'Courses' },
            ].map((tab) => {
              const isActive = activeSearchTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  type="button"
                  onClick={() => setActiveSearchTab(tab.id as any)}
                  className={`pb-2 text-[14px] sm:text-[15px] whitespace-nowrap min-h-[44px] flex items-center transition-colors duration-150 ${
                    isActive
                      ? 'text-text-primary font-bold'
                      : 'text-text-secondary font-medium hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Sliding underline indicator (200ms ease) */}
            <span
              className="absolute bottom-0 h-[2px] bg-gold-primary tab-slider-underline pointer-events-none"
              style={{
                left: `${tabIndicatorStyle.left}px`,
                width: `${tabIndicatorStyle.width}px`,
              }}
            />
          </div>

          {/* Search Input Box: Height 56px, left icon, right Primary Search button */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-text-secondary absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search verified ${
                activeSearchTab === 'brokers'
                  ? 'Forex brokers by name, regulation, or asset...'
                  : activeSearchTab === 'managers'
                  ? 'PAMM & MAM account managers...'
                  : activeSearchTab === 'signals'
                  ? 'Telegram & EA signal providers...'
                  : 'LMS courses and video lessons...'
              }`}
              className="w-full h-[56px] pl-12 pr-28 sm:pr-32 rounded-md bg-white border border-[#CBD5E0] text-[15px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 h-[42px] px-5 sm:px-6 bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[13px] sm:text-[14px] font-bold rounded-md transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Filter Chips: Country | Regulation | Min Deposit | Platform */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mr-1">
              Quick Filters:
            </span>
            {[
              { label: 'United Kingdom (FCA)', href: '/brokers?country=United+Kingdom' },
              { label: 'Australia (ASIC)', href: '/brokers?country=Australia' },
              { label: 'Zero Spread (ECN)', href: '/brokers?spread=raw' },
              { label: 'Min Deposit < $50', href: '/brokers?maxDeposit=50' },
              { label: 'MetaTrader 5', href: '/brokers?platform=MT5' },
              { label: 'cTrader', href: '/brokers?platform=cTrader' },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="bg-[#F1F5F9] border border-[#E2E8F0] text-text-secondary hover:text-text-primary hover:border-gold-primary/50 text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap min-h-[32px] flex items-center"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — FEATURED BROKERS (Off-White, 40px mob / 80px dsk)*/}
      {/* ============================================================ */}
      <section className="bg-off-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header Pattern */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[28px] sm:text-[30px] font-normal text-text-primary leading-tight">
                Forex Brokers
              </h2>
              <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary mt-1">
                Browse and compare regulated Forex brokers
              </p>
            </div>
            <Link
              href="/brokers"
              className="font-sans text-[14px] font-semibold text-gold-primary hover:text-gold-light transition-colors flex items-center gap-1 shrink-0"
            >
              View All Brokers →
            </Link>
          </div>

          {/* Grid: 3 cols desktop / 2 tablet / 1 mobile, Gap: 24px, 6 cards */}
          {featuredBrokers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {featuredBrokers.map((broker) => (
                <BrokerCard key={broker.slug} broker={broker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-md p-6">
              <p className="font-sans text-[14px] text-text-secondary">
                No brokers listed yet. Verified broker evaluations will appear here once published.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — ACCOUNT MANAGERS (White, 40px mob / 80px dsk)    */}
      {/* ============================================================ */}
      <section className="bg-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[28px] sm:text-[30px] font-normal text-text-primary leading-tight">
                Account Managers
              </h2>
              <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary mt-1">
                Vetted institutional traders managing capital with strict risk rules
              </p>
            </div>
            <Link
              href="/account-managers"
              className="font-sans text-[14px] font-semibold text-gold-primary hover:text-gold-light transition-colors flex items-center gap-1 shrink-0"
            >
              View All Managers →
            </Link>
          </div>

          {featuredManagers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {featuredManagers.map((manager) => (
                <ManagerCard key={manager._id} manager={manager} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-off-white border border-[#E2E8F0] rounded-md p-6">
              <p className="font-sans text-[14px] text-text-secondary">
                No account managers listed yet. Vetted profiles will appear here once verified.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — SIGNAL PROVIDERS (Off-White, 40px mob / 80px dsk)*/}
      {/* ============================================================ */}
      <section className="bg-off-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[28px] sm:text-[30px] font-normal text-text-primary leading-tight">
                Signal Providers
              </h2>
              <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary mt-1">
                Real-time verified technical trade alerts across major pairs
              </p>
            </div>
            <Link
              href="/signal-providers"
              className="font-sans text-[14px] font-semibold text-gold-primary hover:text-gold-light transition-colors flex items-center gap-1 shrink-0"
            >
              View All Providers →
            </Link>
          </div>

          {featuredSignals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {featuredSignals.map((sig) => (
                <ManagerCard key={sig._id} manager={sig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-md p-6">
              <p className="font-sans text-[14px] text-text-secondary">
                No signal providers listed yet. Verified providers will appear here once audited.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — BROKER COMPARISON CTA (Navy-Mid, 40px mob / 80px) */}
      {/* ============================================================ */}
      <section className="bg-navy-mid py-10 md:py-20 text-text-on-dark border-b border-navy-border">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <div className="max-w-[640px] mx-auto space-y-6">
            {/* Overlapping broker sample logos */}
            <div className="flex items-center justify-center -space-x-3 pb-2">
              {MOCK_BROKERS.slice(0, 3).map((b, idx) => (
                <div
                  key={b.slug}
                  className="w-12 h-12 rounded-full bg-white border-2 border-navy-mid p-1.5 shadow-lg shrink-0 flex items-center justify-center"
                  style={{ zIndex: 3 - idx }}
                >
                  <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>

            {/* Headline: DM Serif Display 36px --color-white centered */}
            <h2 className="font-serif text-[28px] sm:text-[36px] font-normal text-white leading-tight">
              Compare Multiple Brokers Side by Side
            </h2>

            {/* Subtext: Inter 16px --color-text-muted-dark centered, max-width 480px */}
            <p className="font-sans text-[15px] sm:text-[16px] text-text-muted-dark leading-relaxed max-w-[480px] mx-auto">
              Inspect raw spreads, maximum leverage, execution speed, and regulatory jurisdictions in one comprehensive comparison grid.
            </p>

            <div>
              <Link href="/compare">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[44px] px-[28px] bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold rounded-md transition-colors"
                >
                  Start Comparing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — EDUCATION / COURSES (White, 40px mob / 80px dsk) */}
      {/* ============================================================ */}
      <section className="bg-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[28px] sm:text-[30px] font-normal text-text-primary leading-tight">
                Education & LMS Academy
              </h2>
              <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary mt-1">
                Structured courses, module quizzes, and institutional trading certificates
              </p>
            </div>
            <Link
              href="/education"
              className="font-sans text-[14px] font-semibold text-gold-primary hover:text-gold-light transition-colors flex items-center gap-1 shrink-0"
            >
              View All Courses →
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {featuredCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-off-white border border-[#E2E8F0] rounded-md p-6">
              <p className="font-sans text-[14px] text-text-secondary">
                No courses published yet. Browse our upcoming Forex education modules.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — COMPLAINT BOX CTA (Navy-Deepest, 32px mob/64px)  */}
      {/* ============================================================ */}
      <section className="bg-navy-deepest py-8 md:py-16 text-text-on-dark border-b border-navy-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left text */}
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <h2 className="font-serif text-[28px] sm:text-[36px] font-normal text-white leading-tight">
                Been Scammed or Misled?
              </h2>
              <p className="font-sans text-[15px] sm:text-[16px] text-text-muted-dark leading-relaxed max-w-2xl mx-auto lg:mx-0">
                If you have experienced unjustified withdrawal delays, unauthorized trading, or deceptive bonus terms, submit your complaint to our independent dispute resolution desk.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto">
                <Link href="/complaint-box" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-[44px] px-[28px] bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold rounded-md transition-colors"
                  >
                    Submit Complaint
                  </button>
                </Link>
                <Link href="/complaints" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto min-h-[44px] px-[28px] bg-white/[0.06] border border-white/[0.12] text-text-on-dark font-sans text-[14px] font-medium rounded-md hover:bg-white/[0.10] transition-colors"
                  >
                    Learn More
                  </button>
                </Link>
              </div>
              <p className="font-sans text-[11px] text-text-muted-dark pt-1">
                EduTradeFX is an independent mediation platform and does not guarantee financial recovery.
              </p>
            </div>

            {/* Right shield illustration */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-navy-surface border border-navy-border flex items-center justify-center text-gold-primary shadow-2xl">
                <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-gold-primary opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — WHY EDUTRADE FX (Off-White, 40px mob / 80px dsk) */}
      {/* ============================================================ */}
      <section className="bg-off-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Centered Editorial Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-[30px] sm:text-[36px] font-normal text-text-primary">
              Why EduTradeFX
            </h2>
            <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary">
              Built on transparency, rigorous data audits, and trader protection
            </p>
          </div>

          {/* 5 reasons: NO numbered markers, 5-col desktop / 2-col tablet / 1-col mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Regulatory Audits',
                desc: 'All listed brokers verified against FCA, ASIC, CySEC databases.',
              },
              {
                icon: Scale,
                title: 'Live Spread Data',
                desc: 'Real tick data verification to reveal true trading costs.',
              },
              {
                icon: Award,
                title: 'Verified Results',
                desc: 'Manager performance audited through read-only investor access.',
              },
              {
                icon: Lock,
                title: 'Dispute Desk',
                desc: 'Formal mediation channel between retail traders and brokers.',
              },
              {
                icon: FileText,
                title: 'No Conflict',
                desc: 'Unbiased ratings independent of broker advertising partnerships.',
              },
            ].map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] rounded-md p-5 sm:p-6 shadow-card text-left space-y-3"
                >
                  <div className="w-[56px] h-[56px] rounded-lg bg-navy-mid flex items-center justify-center text-gold-primary shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-sans text-[17px] font-bold text-text-primary">
                    {reason.title}
                  </h3>
                  <p className="font-sans text-[14px] text-text-secondary leading-snug line-clamp-2">
                    {reason.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — HOW IT WORKS (White, 40px mob / 80px dsk)       */}
      {/* ============================================================ */}
      <section id="how-it-works" className="bg-white py-10 md:py-20 border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section header left-aligned */}
          <div className="text-left space-y-1">
            <h2 className="font-serif text-[28px] sm:text-[30px] font-normal text-text-primary">
              How It Works
            </h2>
            <p className="font-sans text-[15px] sm:text-[16px] text-text-secondary">
              Three straightforward steps to safer, informed Forex trading
            </p>
          </div>

          {/* 3 steps in a row connected by a dashed line (desktop), 3-col tablet, 1-col mobile */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {/* Connecting dashed line on desktop */}
            <div className="hidden md:block absolute top-12 left-20 right-20 h-[2px] border-t-2 border-dashed border-[#E2E8F0] z-0" />

            {[
              {
                num: '1',
                title: 'Search & Compare',
                desc: 'Filter by regulation, leverage, and real spread data to find brokers matching your strategy.',
              },
              {
                num: '2',
                title: 'Verify & Learn',
                desc: 'Review community feedback, check historical manager drawdowns, and complete LMS modules.',
              },
              {
                num: '3',
                title: 'Trade with Protection',
                desc: 'Open accounts with confidence knowing EduTradeFX dispute mediation is behind you.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative z-10 bg-white border border-[#E2E8F0] rounded-md p-5 sm:p-6 shadow-card text-left space-y-3"
              >
                {/* Large step number: DM Serif Display 48px --color-navy-border */}
                <div className="font-serif text-[48px] text-navy-border font-normal leading-none">
                  {step.num}
                </div>
                <h3 className="font-sans text-[18px] font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11 — ADVERTISE WITH US (Gold Gradient, 32px mob/60px) */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-r from-gold-muted to-gold-primary py-8 md:py-15 text-navy-deepest text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-normal leading-tight">
            Partner With EduTradeFX
          </h2>
          <p className="font-sans text-[15px] sm:text-[16px] text-navy-deepest/70 max-w-lg mx-auto">
            Reach serious retail Forex traders looking for regulated brokers, professional account management, and verified execution.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[44px] px-[28px] bg-navy-deepest hover:bg-navy-deep text-white font-sans text-[14px] font-bold rounded-md transition-colors"
              >
                Get In Touch
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
