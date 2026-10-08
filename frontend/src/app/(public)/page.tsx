'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Radio,
  ArrowRight,
  Search,
  Sparkles,
  Scale,
  ShieldAlert,
  Megaphone,
  AlertTriangle,
  Play,
  Calendar,
  CheckCircle2,
  Bot,
  LineChart,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Broker, Course, AccountManager, SignalProvider } from '../../types';
import { BrokerCard } from '../../components/broker/BrokerCard';
import { AMCard } from '../../components/am/AMCard';
import { SPCard } from '../../components/sp/SPCard';
import { Skeleton } from '../../components/common/Skeleton';
import { AIAssistant } from '../../components/common/AIAssistant';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { IconTile } from '../../components/ui/IconTile';
import { StatBar } from '../../components/ui/StatBar';

export default function HomePage() {
  const [featuredBrokers, setFeaturedBrokers] = useState<Broker[]>([]);
  const [featuredAMs, setFeaturedAMs] = useState<AccountManager[]>([]);
  const [featuredSPs, setFeaturedSPs] = useState<SignalProvider[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [brokersRes, amRes, spRes, coursesRes, blogsRes] = await Promise.allSettled([
          api.get('/brokers?limit=3&sortBy=avgRating'),
          api.get('/account-managers?limit=3'),
          api.get('/signal-providers?limit=3'),
          api.get('/courses?limit=3&sortBy=rating'),
          api.get('/blog?limit=3'),
        ]);

        if (brokersRes.status === 'fulfilled') {
          setFeaturedBrokers(brokersRes.value.data?.data || []);
        }
        if (amRes.status === 'fulfilled') {
          setFeaturedAMs(amRes.value.data?.data || []);
        }
        if (spRes.status === 'fulfilled') {
          setFeaturedSPs(spRes.value.data?.data || []);
        }
        if (coursesRes.status === 'fulfilled') {
          setFeaturedCourses(coursesRes.value.data?.data || []);
        }
        if (blogsRes.status === 'fulfilled') {
          setRecentBlogs(blogsRes.value.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  // Trigger floating assistant to open
  const triggerAIAssistant = () => {
    const btn = document.querySelector('button[aria-label="Open AI Assistant"]') as HTMLButtonElement | null;
    if (btn) btn.click();
  };

  return (
    <div className="min-h-screen bg-white text-text-body selection:bg-blue selection:text-white">
      {/* ─── 1. HERO SECTION (Navy -> Blue Gradient, Left-Aligned) ─── */}
      <section className="relative bg-gradient-to-br from-[#0A2A6B] via-[#0C3280] to-[#1F5BFF] text-white pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-orange/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-[0.15em] text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-orange" />
                <span>Next-Gen Forex Intelligence & LMS</span>
              </div>

              {/* Big Headline with Two-Tone Words */}
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.15]">
                Trade Smarter with{' '}
                <span className="text-orange">Verified Brokers</span> &{' '}
                <span className="text-emerald-300">Masterclass Education</span>
              </h1>

              {/* Short Paragraph */}
              <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl">
                Compare tier-1 regulated Forex brokerages, learn institutional price action strategies from veteran mentors, connect with audited account managers, and safeguard your capital.
              </p>

              {/* 2 CTAs (Orange Pill + White Outline Pill) */}
              <div className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-3 sm:gap-4 pt-2">
                <Button href="/brokers" variant="primary" size="lg" withArrow className="w-full xs:w-auto justify-center">
                  Explore Regulated Brokers
                </Button>
                <Button href="/courses" variant="outline-white" size="lg" className="w-full xs:w-auto justify-center">
                  Browse Academy Courses
                </Button>
              </div>

              {/* 3 Small Icon Features */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Tier-1 FCA/ASIC Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Live Spread Matrix</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>24/7 AI Trading Mentor</span>
                </div>
              </div>

              {/* Universal Search Bar (Moved below CTAs) */}
              <div className="pt-2 max-w-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/brokers?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="relative flex items-center bg-white rounded-full p-1 sm:p-1.5 shadow-lift"
                >
                  <Search className="absolute left-3.5 sm:left-5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brokers, regulations, courses..."
                    className="w-full pl-9 sm:pl-12 pr-22 sm:pr-32 py-2.5 sm:py-3 bg-transparent text-text-heading placeholder-slate-400 text-xs sm:text-sm focus:outline-none rounded-full"
                  />
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-orange hover:bg-orange-hover text-white font-bold rounded-full text-xs transition shadow-sm shrink-0 min-h-[38px]"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>

            {/* Right Themed Illustration Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-lg lg:max-w-none">
                <Image
                  src="/images/hero-illustration.svg"
                  alt="Forex Trading Intelligence"
                  width={560}
                  height={440}
                  priority
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Glass Stats Bar with 3 stats (blue / orange / green numbers) */}
          <div className="mt-14 sm:mt-16">
            <StatBar isDark={true} />
          </div>
        </div>
      </section>

      {/* ─── 2. BROKER LOGO STRIP ─── */}
      <section className="bg-surface-tint border-y border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue" />
            <span>Audited Top Regulated Brokerages:</span>
          </div>

          {/* Broker Badges Carousel / Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-text-heading">
            {featuredBrokers.length > 0 ? (
              featuredBrokers.map((b) => (
                <Link
                  key={b.id}
                  href={`/brokers/${b.slug}`}
                  className="flex items-center gap-2 hover:text-blue transition px-3 py-1.5 rounded-lg hover:bg-white"
                >
                  {b.logo ? (
                    <img src={b.logo} alt={b.companyName} className="w-5 h-5 object-contain rounded-full" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                  <span>{b.companyName}</span>
                </Link>
              ))
            ) : (
              <>
                <span className="px-3 py-1 bg-white rounded-lg border border-border shadow-sm">IC Markets</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-border shadow-sm">Exness</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-border shadow-sm">Pepperstone</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-border shadow-sm">XM Global</span>
              </>
            )}
          </div>

          <Link
            href="/brokers"
            className="text-xs font-bold text-blue hover:text-blue-hover flex items-center gap-1 shrink-0"
          >
            <span>View all brokers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ─── 3. WHAT WE OFFER (5 Equal Feature Cards) ─── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Marketplace Pillars"
          title="What We Offer"
          subtitle="Everything modern traders need to analyze liquidity providers, learn risk discipline, and verify managers."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* 1: Regulated Brokers */}
          <div className="group p-6 rounded-2xl bg-white border border-border hover:border-blue/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <IconTile icon={<ShieldCheck />} color="blue" />
              <h3 className="text-base font-bold text-text-heading mt-4 mb-2">Brokers Directory</h3>
              <p className="text-xs text-text-body leading-relaxed mb-4">
                Tier-1 verified licenses (FCA, CySEC, ASIC), live spreads, and authentic reviews.
              </p>
            </div>
            <Link
              href="/brokers"
              className="text-xs font-bold text-blue flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>Explore brokers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2: Account Managers */}
          <div className="group p-6 rounded-2xl bg-white border border-border hover:border-green/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <IconTile icon={<Users />} color="green" />
              <h3 className="text-base font-bold text-text-heading mt-4 mb-2">Account Managers</h3>
              <p className="text-xs text-text-body leading-relaxed mb-4">
                Accredited MAM/PAMM portfolio specialists with audited track records.
              </p>
            </div>
            <Link
              href="/account-managers"
              className="text-xs font-bold text-green flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>Find managers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3: Signal Providers */}
          <div className="group p-6 rounded-2xl bg-white border border-border hover:border-orange/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <IconTile icon={<Radio />} color="orange" />
              <h3 className="text-base font-bold text-text-heading mt-4 mb-2">Signal Providers</h3>
              <p className="text-xs text-text-body leading-relaxed mb-4">
                Quantitative signals with verified win rates, risk parameters, and stop-loss targets.
              </p>
            </div>
            <Link
              href="/signal-providers"
              className="text-xs font-bold text-orange flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>Browse signals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4: Comparison Engine */}
          <div className="group p-6 rounded-2xl bg-white border border-border hover:border-blue/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <IconTile icon={<Scale />} color="navy" />
              <h3 className="text-base font-bold text-text-heading mt-4 mb-2">Comparison Matrix</h3>
              <p className="text-xs text-text-body leading-relaxed mb-4">
                Side-by-side empirical comparison of spreads, leverage, and fees across 4 brokers.
              </p>
            </div>
            <Link
              href="/brokers/compare"
              className="text-xs font-bold text-blue flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>Compare brokers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5: Academy Courses */}
          <div className="group p-6 rounded-2xl bg-white border border-border hover:border-orange/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <IconTile icon={<GraduationCap />} color="orange" />
              <h3 className="text-base font-bold text-text-heading mt-4 mb-2">Trading Academy</h3>
              <p className="text-xs text-text-body leading-relaxed mb-4">
                Structured video masterclasses from beginner price action to advanced order flow.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-orange flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>View academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4. SOFT-BLUE AI ASSISTANT BANNER (#EEF4FF) ─── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-tint border border-blue/20 shadow-soft flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue text-white flex items-center justify-center shrink-0 shadow-soft">
              <Bot size={32} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue uppercase tracking-wider">
                Instant Forex Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
                Have Questions About Brokers, Spreads, or Strategies?
              </h3>
              <p className="text-sm text-text-body max-w-xl">
                Chat with our AI Trading Mentor trained on thousands of verified brokerage fee structures, currency pair mechanics, and risk guidelines.
              </p>
              <div className="pt-2">
                <Button onClick={triggerAIAssistant} variant="primary" size="md" withArrow>
                  Ask AI Trading Mentor
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Preview Card on the right */}
          <div className="w-full lg:w-80 p-4 rounded-2xl bg-white border border-border shadow-soft text-xs space-y-2.5 shrink-0">
            <div className="flex items-center gap-2 pb-2 border-b border-border font-bold text-text-heading">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Mentor Live Preview</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-tint text-text-heading">
              "What is the difference between ECN and STP execution for day trading?"
            </div>
            <div className="p-2.5 rounded-xl bg-blue text-white">
              "ECN directly routes orders to tier-1 liquidity providers with raw spreads and fixed commissions..."
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURED BROKERS (White Cards, Shadow-Soft) ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <SectionHeading
            eyebrow="Top Rated & Audited"
            title="Featured Regulated Brokers"
            subtitle="Independently tested for execution latency, raw spread consistency, and licensing authenticity."
            className="mb-0"
          />
          <Link
            href="/brokers"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:text-blue-hover transition shrink-0"
          >
            <span>View all brokers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : featuredBrokers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBrokers.map((broker) => (
              <BrokerCard key={broker.id} broker={broker} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-tint rounded-2xl border border-border">
            <p className="text-text-muted">Brokers will appear here once registered.</p>
          </div>
        )}
      </section>

      {/* ─── FEATURED ACCOUNT MANAGERS ─── */}
      {featuredAMs.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <SectionHeading
              eyebrow="Audited Specialists"
              title="Verified Account Managers"
              subtitle="PAMM and MAM portfolio managers with empirically tracked drawdowns."
              className="mb-0"
            />
            <Link
              href="/account-managers"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-green hover:underline transition shrink-0"
            >
              <span>View all managers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAMs.map((am) => (
              <AMCard key={am.id} am={am} />
            ))}
          </div>
        </section>
      )}

      {/* ─── FEATURED SIGNAL PROVIDERS ─── */}
      {featuredSPs.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <SectionHeading
              eyebrow="Quantitative Calls"
              title="Audited Signal Providers"
              subtitle="Algorithmic and discretionary trading signal feeds with audited win rates."
              className="mb-0"
            />
            <Link
              href="/signal-providers"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange hover:underline transition shrink-0"
            >
              <span>View all providers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSPs.map((sp) => (
              <SPCard key={sp.id} provider={sp} />
            ))}
          </div>
        </section>
      )}

      {/* ─── FEATURED COURSES (Dark Gradient Cards with Level Badge & Play Button) ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <SectionHeading
            eyebrow="Learn From Certified Mentors"
            title="Institutional Forex Masterclasses"
            subtitle="Interactive curriculum with verified certificates and practical order flow exercises."
            className="mb-0"
          />
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange hover:text-orange-hover transition shrink-0"
          >
            <span>View all courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="group rounded-2xl bg-gradient-to-b from-[#0A2A6B] to-[#071B4D] text-white p-5 border border-navy/30 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 rounded-xl bg-[#07153B] mb-4 overflow-hidden relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <GraduationCap className="w-12 h-12" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-navy/40 flex items-center justify-center group-hover:bg-navy/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-orange text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={20} className="ml-1 fill-white" />
                      </div>
                    </div>
                    {/* Level Badge */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-navy/90 text-orange text-xs font-bold border border-white/20 backdrop-blur-sm">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-lg font-extrabold font-mono text-orange">
                    {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white hover:text-navy text-xs font-bold text-white transition-all"
                  >
                    View Curriculum
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-tint rounded-2xl border border-border">
            <p className="text-text-muted">Masterclasses will be published shortly.</p>
          </div>
        )}
      </section>

      {/* ─── 6. FULL-WIDTH BLUE -> ORANGE CTA BANNER (Dual Purpose: Complaint Box & Media Kit) ─── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue via-indigo-600 to-orange text-white shadow-lift flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-200" />
              <span>Trader Safeguard & Partnership Network</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Protect Your Capital or Grow Your Brokerage Audience
            </h2>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              Encountered an unregulated broker or withdrawal delay? Submit a formal dispute case. Want to showcase your tier-1 liquidity solution to 120,000+ traders? Access our media kit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
            <Button href="/complaint-box" variant="outline-white" size="lg" withArrow className="w-full sm:w-auto justify-center">
              File a Dispute Case
            </Button>
            <Button href="/advertise" variant="navy" size="lg" className="w-full sm:w-auto justify-center">
              Media Kit & Advertising
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 7. LATEST INSIGHTS (3 Horizontal Blog Cards) ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <SectionHeading
            eyebrow="Market Intelligence"
            title="Latest Forex Insights & Analysis"
            subtitle="Stay informed on central bank policy decisions, regulatory warnings, and technical breakdowns."
            className="mb-0"
          />
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue hover:text-blue-hover transition shrink-0"
          >
            <span>View all articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentBlogs.length > 0 ? (
            recentBlogs.slice(0, 3).map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group p-4 rounded-2xl bg-white border border-border hover:border-blue/30 shadow-soft hover:shadow-lift transition-all duration-300 flex gap-4 items-center"
              >
                <div className="w-24 h-24 rounded-xl bg-surface-tint shrink-0 overflow-hidden relative">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue">
                      <LineChart size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-1">
                    <Calendar size={12} />
                    <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-heading group-hover:text-blue transition line-clamp-2">
                    {blog.title}
                  </h4>
                  <div className="mt-2 text-xs font-semibold text-blue flex items-center gap-1">
                    <span>Read article</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Fallback default insights
            [
              {
                title: 'Understanding ECN vs Market Maker Spreads',
                category: 'Market Structure',
                date: 'Oct 04, 2026',
                href: '/blog',
              },
              {
                title: 'Risk Management Protocols for High-Leverage CFDs',
                category: 'Risk Discipline',
                date: 'Sep 28, 2026',
                href: '/blog',
              },
              {
                title: 'How Tier-1 Regulators Handle Segregated Client Funds',
                category: 'Regulation',
                date: 'Sep 21, 2026',
                href: '/blog',
              },
            ].map((insight, idx) => (
              <Link
                key={idx}
                href={insight.href}
                className="group p-5 rounded-2xl bg-white border border-border hover:border-blue/30 shadow-soft hover:shadow-lift transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange">
                    {insight.category}
                  </span>
                  <h4 className="text-base font-bold text-text-heading group-hover:text-blue transition mt-1.5 mb-2">
                    {insight.title}
                  </h4>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted font-medium">
                  <span>{insight.date}</span>
                  <span className="text-blue font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ─── 8. HOW IT WORKS & REGULATORY RISK NOTE ─── */}
      <section className="py-20 bg-surface-tint border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trader Roadmap"
            title="How EduTradeFX Works"
            subtitle="A transparent, step-by-step pathway built to protect your capital and elevate your trading career."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-2xl bg-white border border-border shadow-soft space-y-3">
              <span className="text-3xl font-black font-mono text-blue">01</span>
              <h3 className="text-base font-bold text-text-heading">Learn Institutional Edge</h3>
              <p className="text-xs text-text-body leading-relaxed">
                Study risk sizing, liquidity sweeps, and market microstructure through our interactive Academy lessons.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-border shadow-soft space-y-3">
              <span className="text-3xl font-black font-mono text-blue">02</span>
              <h3 className="text-base font-bold text-text-heading">Audit & Compare Brokers</h3>
              <p className="text-xs text-text-body leading-relaxed">
                Examine tier-1 licensing, ECN execution models, raw spread markups, and verified real trader reviews.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-border shadow-soft space-y-3">
              <span className="text-3xl font-black font-mono text-blue">03</span>
              <h3 className="text-base font-bold text-text-heading">Discover Managers & Signals</h3>
              <p className="text-xs text-text-body leading-relaxed">
                Access audited PAMM/MAM managers and signal providers with empirical drawdown statistics.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-border shadow-soft space-y-3">
              <span className="text-3xl font-black font-mono text-blue">04</span>
              <h3 className="text-base font-bold text-text-heading">Grievance Protection</h3>
              <p className="text-xs text-text-body leading-relaxed">
                Encountered unfair slippage or withdrawal holds? Log a formal dispute case to our Complaint Box for mediation.
              </p>
            </div>
          </div>

          {/* High-Risk Regulatory Warning Note */}
          <div className="mt-14 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-orange shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">High-Risk Investment Warning:</strong> CFDs and Forex are complex leveraged financial instruments carrying a high risk of losing capital rapidly. Between 74% and 89% of retail investor accounts lose money trading CFDs. EduTradeFX operates strictly as an educational community and directory. Read our{' '}
              <Link href="/risk-disclaimer" className="underline font-bold text-orange hover:text-orange-hover">
                Risk Disclaimer
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="underline font-bold text-orange hover:text-orange-hover">
                Terms of Service
              </Link>.
            </span>
          </div>
        </div>
      </section>

      {/* Floating AI Assistant Widget */}
      <AIAssistant />
    </div>
  );
}
