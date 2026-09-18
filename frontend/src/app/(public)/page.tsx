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
} from 'lucide-react';
import { api } from '../../lib/api';
import { Broker, Course, BlogPost } from '../../types';
import { BrokerCard } from '../../components/broker/BrokerCard';
import { Skeleton } from '../../components/common/Skeleton';
import { AIAssistant } from '../../components/common/AIAssistant';

export default function HomePage() {
  const [featuredBrokers, setFeaturedBrokers] = useState<Broker[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [brokersRes, coursesRes, blogsRes] = await Promise.allSettled([
          api.get('/brokers?limit=3&sortBy=avgRating'),
          api.get('/courses?limit=3&sortBy=rating'),
          api.get('/blog?limit=3'),
        ]);

        if (brokersRes.status === 'fulfilled') {
          setFeaturedBrokers(brokersRes.value.data?.data || []);
        }
        if (coursesRes.status === 'fulfilled') {
          setFeaturedCourses(coursesRes.value.data?.data || []);
        }
        if (blogsRes.status === 'fulfilled') {
          setLatestBlogs(blogsRes.value.data?.data || []);
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
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
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

            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compare tier-1 regulated Forex brokers, learn structured institutional strategies from veteran mentors, and discover audited signal providers.
            </p>

            {/* Universal Search Bar */}
            <div className="max-w-xl mx-auto mb-10">
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

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/brokers"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Find Regulated Broker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="px-7 py-3.5 rounded-xl bg-brand-navy-light/90 hover:bg-brand-navy-lighter border border-slate-700 text-slate-200 font-semibold hover:border-slate-500 transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-brand-amber" />
                <span>Explore Academy</span>
              </Link>
            </div>
          </div>

          {/* Live Trust / Metrics Bar */}
          <div className="mt-16 sm:mt-20 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-brand-navy-card/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Verified Brokers</div>
            </div>
            <div className="p-4 rounded-xl bg-brand-navy-card/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-amber">45,000+</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Active Students</div>
            </div>
            <div className="p-4 rounded-xl bg-brand-navy-card/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.8%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Audited Compliance</div>
            </div>
            <div className="p-4 rounded-xl bg-brand-navy-card/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-blue">24/7</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">AI Forex Mentor</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Platform Pillars Grid ──────────────────────────── */}
      <section className="py-16 bg-brand-navy/60 relative border-t border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              An All-in-One Professional Trading Ecosystem
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Whether you are a beginner seeking structured guidance or an experienced trader comparing raw spreads, we provide trusted infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Broker Directory */}
            <Link
              href="/brokers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-brand-blue/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-brand-blue mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-blue transition-colors">
                Regulated Brokers
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Transparent ratings, FCA/CySEC licenses, raw spread analysis, and side-by-side comparison matrix.
              </p>
              <div className="text-xs font-semibold text-brand-blue flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Explore directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 2: LMS Academy */}
            <Link
              href="/courses"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-brand-amber/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-brand-amber mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-amber transition-colors">
                Forex Academy
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Structured video courses from beginner price action to institutional Smart Money Concepts with verified completion certificates.
              </p>
              <div className="text-xs font-semibold text-brand-amber flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>View courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 3: Account Managers */}
            <Link
              href="/account-managers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                Account Managers
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Connect with accredited MAM/PAMM portfolio specialists, verify trading strategies, and manage risk parameters.
              </p>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Find managers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 4: Signal Providers */}
            <Link
              href="/signal-providers"
              className="group p-6 rounded-2xl bg-brand-navy-card border border-slate-800/80 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Signals & Analytics
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Real-time trade signals with audited pips, win rates, stop-loss ratios, and direct Telegram channel alerts.
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
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
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
            <span>View all 500+ brokers</span>
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

      {/* ─── AI Trading Assistant Interactive Feature Box ─────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/40 via-brand-navy-card to-indigo-950/40 border border-brand-blue/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold mb-4 border border-brand-blue/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Financial Education</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Have Questions About Risk, Spreads or Technical Indicators?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Ask our 24/7 AI Forex Mentor. Get instant explanations on position sizing, margin calls, interest rate parity, and institutional order blocks.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const trigger = document.getElementById('ai-assistant-toggle');
                  if (trigger) trigger.click();
                }}
                className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-brand-amber" />
                <span>Launch Assistant Now</span>
              </button>
              <Link
                href="/courses"
                className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
              >
                Browse Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Top Courses Preview ──────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
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

      {/* ─── Trust, Security & Complaints Banner ──────────────────── */}
      <section className="py-16 bg-brand-navy-card/40 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Independent Verification</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We cross-verify regulatory licenses across FCA, CySEC, ASIC, and FSCA registries to protect traders from unregulated scams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Trader Dispute Resolution</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Experienced withdrawal delays or slippage? Submit a formal ticket through our transparent Complaints Board.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-brand-amber shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Authentic Community Reviews</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Reviews are strictly verified with live trading proofs to prevent astroturfing and biased broker marketing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating AI Assistant Widget ────────────────────────── */}
      <AIAssistant />
    </div>
  );
}
