'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Target,
  Award,
  Globe2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-navy-light border border-slate-700 text-xs font-semibold text-brand-blue mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Elevating Transparency in the Global Forex Ecosystem
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            EdutradeFX was established to empower retail currency traders with independently audited broker intelligence, institutional-grade education, and transparent professional directories.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Regulatory Truth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We proactively verify regulatory records with tier-1 bodies (FCA, CySEC, ASIC) to eliminate unregulated bucket shops and safeguard client funds.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Institutional Education</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cut through social media trading hype. Our academy features rigorous, milestone-driven curriculums covering liquidity concepts and risk management.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Audited Accountability</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              From PAMM managers to trade signal providers, we track performance metrics, maximum drawdowns, and real customer dispute resolutions.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-navy-card border border-slate-800 mb-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Built by Traders, for Traders
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              Over the last decade, retail Forex trading has exploded, but with it came misleading marketing, hidden spreads, unregulated offshore entities, and get-rich-quick courses.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              EdutradeFX exists to shift the balance of power back to the individual market participant. Every broker in our directory is subjected to quantitative auditing, and our community dispute process ensures that traders have an impartial advocate when execution disputes arise.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/25"
          >
            <span>Explore Regulated Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
