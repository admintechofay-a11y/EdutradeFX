'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Users,
  Radio,
  ArrowRight,
  Star,
  CheckCircle2,
  Search,
  Sparkles,
  Award,
  Zap,
  ChevronRight,
  BookOpen,
  Scale,
  ShieldAlert,
  Megaphone,
  LineChart,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api';
import { Broker, Course, BlogPost, AccountManager, SignalProvider } from '../../types';
import { BrokerCard } from '../../components/broker/BrokerCard';
import { AMCard } from '../../components/am/AMCard';
import { SPCard } from '../../components/sp/SPCard';
import { Skeleton } from '../../components/common/Skeleton';
import { AIAssistant } from '../../components/common/AIAssistant';

export default function HomePage() {
  const [featuredBrokers, setFeaturedBrokers] = useState<Broker[]>([]);
  const [featuredAMs, setFeaturedAMs] = useState<AccountManager[]>([]);
  const [featuredSPs, setFeaturedSPs] = useState<SignalProvider[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [brokersRes, amRes, spRes, coursesRes] = await Promise.allSettled([
          api.get('/brokers?limit=3&sortBy=avgRating'),
          api.get('/account-managers?limit=3'),
          api.get('/signal-providers?limit=3'),
          api.get('/courses?limit=3&sortBy=rating'),
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
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-brand-blue selection:text-white">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-brand-amber/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-navy-light/90 border border-slate-700/80 text-xs font-semibold text-brand-blue mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber animate-pulse" />
              <span>Next-Gen Forex Intelligence & Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Trade Smarter with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Verified Brokers
              </span>{' '}
              & Masterclass Education
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare tier-1 regulated Forex brokers, learn structured institutional strategies from veteran mentors, connect with audited account managers, and safeguard your capital.
            </p>

            {/* Universal Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/brokers?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="relative flex items-center shadow-2xl"
              >
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brokers (e.g. Exness, IC Markets), regulations, or courses..."
                  className="w-full pl-12 pr-36 py-4 bg-brand-navy-light border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue transition text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-5 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link href="/compare" className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-blue text-slate-300 hover:text-white transition flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-brand-blue" />
                <span>Side-by-Side Comparison</span>
              </Link>
              <Link href="/complaint-box" className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-white transition flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Complaint Box & Dispute Desk</span>
              </Link>
              <Link href="/courses" className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-amber text-slate-300 hover:text-white transition flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-amber" />
                <span>Free Academy Courses</span>
              </Link>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Link
              href="/brokers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-brand-blue/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-blue transition-colors">
                Regulated Brokers
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Tier-1 verified licenses (FCA, CySEC, ASIC), live spread monitoring, deposit minimums, and trader reviews.
              </p>
              <div className="text-xs font-semibold text-brand-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Explore directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/courses"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-brand-amber/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-amber transition-colors">
                Forex Academy
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Structured video courses from beginner price action to institutional Smart Money Concepts with certificates.
              </p>
              <div className="text-xs font-semibold text-brand-amber flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>View courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/account-managers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                Account Managers
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Connect with accredited MAM/PAMM portfolio specialists, verify trading strategies, and inspect historical track records.
              </p>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Find managers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/signal-providers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Signals & Analytics
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Real-time trade signals with audited win rates, stop-loss ratios, risk categories, and direct execution alerts.
              </p>
              <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Browse signals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured Brokers Showcase ───────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              Top Rated & Audited
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Regulated Brokers
            </h2>
          </div>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-blue-400 transition"
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
          <div className="p-12 text-center bg-brand-navy-card rounded-2xl border border-slate-800">
            <p className="text-slate-400">Brokers will appear here once registered.</p>
          </div>
        )}
      </section>

      {/* ─── Broker Comparison Matrix Teaser ─────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-navy-card to-blue-950/40 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/15 text-brand-blue text-xs font-bold border border-brand-blue/30">
              <Scale className="w-3.5 h-3.5" />
              <span>Empirical Side-by-Side Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Can't Decide Between Multiple Brokerages?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch our side-by-side comparison engine to analyze up to 4 brokers simultaneously. Compare real raw spreads, ECN/STP execution models, maximum leverage, regulatory licensing bodies, and funding methods.
            </p>
          </div>
          <Link
            href="/compare"
            className="px-8 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition shrink-0 flex items-center gap-2"
          >
            <span>Launch Comparison Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Featured Account Managers Showcase ──────────────────── */}
      {featuredAMs.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Audited Portfolio Specialists
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Verified Account Managers (PAMM / MAM)
              </h2>
            </div>
            <Link
              href="/account-managers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
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

      {/* ─── Featured Signal Providers Showcase ──────────────────── */}
      {featuredSPs.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                Quantitative Trading Calls
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Audited Signal Providers
              </h2>
            </div>
            <Link
              href="/signal-providers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition"
            >
              <span>View all signal providers</span>
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

      {/* ─── How EduTradeFX Works (4-Step Roadmap) ────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Trader Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How EduTradeFX Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A comprehensive, transparent pathway designed to protect your capital and accelerate your trading journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-3">
            <span className="text-2xl font-black font-mono text-brand-blue">01</span>
            <h3 className="text-base font-bold text-white">Learn Institutional Edge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Study risk sizing, order blocks, and market microstructure through our interactive Academy courses and quizzes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-3">
            <span className="text-2xl font-black font-mono text-brand-blue">02</span>
            <h3 className="text-base font-bold text-white">Audit & Select Brokers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Examine tier-1 licensing, ECN execution models, raw spread markups, and verified real trader reviews.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-3">
            <span className="text-2xl font-black font-mono text-brand-blue">03</span>
            <h3 className="text-base font-bold text-white">Discover Managers & Signals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access audited PAMM/MAM managers and signal providers with empirical drawdown statistics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-3">
            <span className="text-2xl font-black font-mono text-brand-blue">04</span>
            <h3 className="text-base font-bold text-white">Grievance Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encountered withdrawal delays or slippage? Log an official dispute case to our forensic Complaint Box for mediation.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Top Courses Preview ──────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-brand-amber uppercase tracking-wider mb-1">
              Learn From Certified Mentors
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Institutional Forex Courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-amber hover:text-amber-400 transition"
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
                className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 rounded-xl bg-slate-800/80 mb-4 overflow-hidden relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-brand-navy-light/90 text-brand-amber text-xs font-bold border border-slate-700">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {course.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-lg font-extrabold text-brand-amber">
                    {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="px-4 py-2 rounded-lg bg-brand-navy-lighter hover:bg-slate-700 text-xs font-semibold text-white transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-brand-navy-card rounded-2xl border border-slate-800">
            <p className="text-slate-400">New academy masterclasses will be published shortly.</p>
          </div>
        )}
      </section>

      {/* ─── Dedicated Complaint Box Banner ──────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/40 via-brand-navy-card to-rose-950/30 border border-red-500/30 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Official Trader Dispute & Grievance Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Encountered a Rogue Broker or Withheld Withdrawal?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Submit a formal dispute case. EduTradeFX conducts compliance inquiries, demands mediation from accused institutions, and publishes non-confidential findings to our global community scam watch.
            </p>
          </div>
          <Link
            href="/complaint-box"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/30 transition shrink-0 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>File a Dispute Case</span>
          </Link>
        </div>
      </section>

      {/* ─── Advertise With Us Banner ────────────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-brand-navy-card border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              <span>Institutional Media Kit</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Reach 120,000+ Active Retail & Professional Traders
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Showcase your brokerage, liquidity solution, or trading software with sponsored directory placements, high-CTR hero banners, and newsletter features.
            </p>
          </div>
          <Link
            href="/advertise"
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-gold text-white font-semibold text-xs sm:text-sm transition shrink-0 flex items-center gap-2"
          >
            <span>View Advertising Options</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── High-Risk Warning Footer Note ───────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
          <span>
            <strong>High-Risk Investment Warning:</strong> CFDs and Forex are complex leveraged financial instruments carrying a high risk of losing capital rapidly. Between 74% and 89% of retail investor accounts lose money trading CFDs. EduTradeFX operates strictly as an educational community and directory. Read our <Link href="/risk-disclaimer" className="underline font-bold text-white hover:text-brand-amber">Risk Disclaimer</Link> and <Link href="/terms" className="underline font-bold text-white hover:text-brand-amber">Terms of Service</Link>.
          </span>
        </div>
      </section>

      {/* ─── Floating AI Assistant Widget ────────────────────────── */}
      <AIAssistant />
    </div>
  );
}
