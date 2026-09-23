'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Compass,
  Scale,
  Award,
  BookOpen,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          The EduTradeFX Standard
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Bringing <span className="gold-gradient-text">Institutional Transparency</span> to Retail Forex
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Founded in 2024, EduTradeFX was engineered to eliminate the information asymmetry between retail traders and offshore brokerage entities. We provide independent spread verification, audited manager directories, institutional education, and dispute resolution.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl glass-card border border-slate-800 p-8 sm:p-10 space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Our Mission</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To protect and empower global retail traders by providing uncorrupted, real-time spread data, objective regulatory audits, structured institutional education, and an uncompromising dispute mediation desk that holds bad actors accountable.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Independent multi-feed tick verification
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Zero paid rating adjustments or broker bias
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Direct access to regulatory ombudsman channels
            </li>
          </ul>
        </div>

        <div className="rounded-3xl glass-card border border-slate-800 p-8 sm:p-10 space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Our Vision</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To become the undisputed international benchmark for financial market integrity, where every broker’s claims are mathematically verified, every manager’s track record is provable on-chain or through audited statements, and every trader has the knowledge to survive and thrive.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Global standard for PAMM & Signal auditing
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Free institutional trading academy for all
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Real-time scam warning radar protecting millions
            </li>
          </ul>
        </div>
      </div>

      {/* Platform Pillars */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">The Four Pillars of EduTradeFX</h2>
          <p className="text-xs text-slate-400">
            An integrated ecosystem designed to guide your entire trading journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Broker Auditing & Comparison</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We test live spreads during high-impact news releases, verify license registries across Tier-1 regulators (FCA, ASIC, CySEC), and inspect overnight swap markups.
            </p>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Audited Managers & Signals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No fabricated Myfxbook screenshots. We verify trade frequency, maximum drawdown, and live trading performance before listing any manager or signal provider.
            </p>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Forex Academy LMS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              From currency pair mechanics to algorithmic EA development. Interactive quizzes, video masterclasses, and verified completion certificates.
            </p>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dispute Mediation Desk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a broker delays withdrawals or engages in manipulative slippage, our legal desk steps in to mediate and issue public scam warnings.
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Risk Disclaimer */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5" />
          High-Risk Investment Warning & Regulatory Disclaimer
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) on margin involves a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange or allocate capital to PAMM account managers or signal providers, you should carefully consider your investment objectives, level of experience, and risk appetite.
        </p>

        <p className="text-xs text-slate-400 leading-relaxed">
          The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with foreign exchange trading and seek advice from an independent financial advisor if you have any doubts.
        </p>

        <p className="text-xs text-slate-500 leading-relaxed">
          EduTradeFX is an independent financial analysis and educational portal. EduTradeFX is not a broker, dealer, or investment adviser, and does not hold client funds or provide personalized financial recommendations.
        </p>
      </div>
    </div>
  );
}
