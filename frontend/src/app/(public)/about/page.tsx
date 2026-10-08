'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  ArrowRight,
  Scale,
  ShieldAlert,
  AlertTriangle,
  Compass,
  LineChart,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const HOW_TO_USE_STEPS = [
  {
    step: '01',
    title: 'Master Technical & Risk Fundamentals',
    desc: 'Begin with our structured Learning Management System (LMS). Progress from beginner market mechanics through liquidity concepts, order flow, and institutional risk management.',
    link: '/courses',
    linkText: 'Explore Courses',
    icon: GraduationCap,
  },
  {
    step: '02',
    title: 'Audit & Compare Regulated Brokers',
    desc: 'Use our real-time broker comparison matrix. Filter by tier-1 regulation (FCA, ASIC, CySEC), execution type (ECN/STP), live spreads, and minimum deposit thresholds.',
    link: '/brokers/compare',
    linkText: 'Launch Compare Engine',
    icon: Scale,
  },
  {
    step: '03',
    title: 'Discover Audited Managers & Signals',
    desc: 'Access verified directory profiles of PAMM/MAM account managers and copy-trading signal providers with audited track records, win rates, and maximum drawdown limits.',
    link: '/account-managers',
    linkText: 'Browse Managers',
    icon: LineChart,
  },
  {
    step: '04',
    title: 'Safeguard Funds via Complaint Desk',
    desc: 'Encountered arbitrary withdrawal delays, sudden spread widening, or unauthorized PAMM losses? Submit a case to our Complaint Box for forensic mediation and public registry warning.',
    link: '/complaint-box',
    linkText: 'File a Dispute',
    icon: ShieldAlert,
  },
];

const CORE_VALUES = [
  {
    title: 'Radical Transparency',
    desc: 'No paid fake reviews, no hidden sponsored placements disguised as organic rankings. Every broker rating is grounded in empirical verification.',
  },
  {
    title: 'Trader-First Advocacy',
    desc: 'We operate as an uncompromising watchdog for the retail trading community against offshore bucket shops and deceptive marketing.',
  },
  {
    title: 'Institutional Standards',
    desc: 'We demystify retail Forex by promoting institutional liquidity understanding, prudent leverage limits, and capital preservation.',
  },
  {
    title: 'Neutral Mediation',
    desc: 'When trade execution disputes or withdrawal friction arise, we provide an impartial bridge to facilitate fact-based resolutions.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 text-text-body bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-tint border border-blue/20 text-xs font-bold uppercase tracking-[0.15em] text-blue mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mission, Vision & Principles</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-heading mb-6 leading-tight tracking-tight">
            Elevating Transparency in the Global Forex Ecosystem
          </h1>
          <p className="text-base sm:text-lg text-text-body leading-relaxed">
            EduTradeFX was established to empower retail currency traders with independently audited broker intelligence, institutional-grade education, verified professional directories, and a dedicated dispute mediation desk.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-white border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-heading">Regulatory Truth</h3>
            <p className="text-sm text-text-body leading-relaxed">
              We proactively verify licensing credentials with Tier-1 statutory regulators (FCA, CySEC, ASIC, BaFin) to eliminate offshore shell entities and safeguard trader deposits.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-heading">Institutional Education</h3>
            <p className="text-sm text-text-body leading-relaxed">
              Cut through social media trading hype. Our academy features rigorous, milestone-driven curriculums covering liquidity mechanics, institutional order blocks, and risk management.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-border shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-green">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-heading">Audited Accountability</h3>
            <p className="text-sm text-text-body leading-relaxed">
              From PAMM managers to signal providers, we require transparent historical drawdown disclosures, verified trading records, and public dispute case history.
            </p>
          </div>
        </div>

        {/* How to Use EduTradeFX */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint border border-blue/20 text-blue text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Trader Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              How to Use EduTradeFX
            </h2>
            <p className="text-sm text-text-body mt-2">
              A 4-step framework designed to take you from foundational understanding to secure market execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_TO_USE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="p-6 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between hover:shadow-lift transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-blue">{step.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-surface-tint border border-border flex items-center justify-center text-blue">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-text-heading leading-snug">{step.title}</h3>
                    <p className="text-xs text-text-body leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="pt-6 border-t border-border mt-6">
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue hover:text-blue-hover transition"
                    >
                      <span>{step.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-tint border border-border shadow-soft">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-heading mb-8 text-center">
              Our Core Operating Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CORE_VALUES.map((val, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue shrink-0" />
                    <h3 className="text-base font-bold text-text-heading">{val.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-body pl-7 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure & Warning Callout */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-50 border border-amber-200 mb-16 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-orange font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Regulatory Disclosures & Neutrality Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            EduTradeFX is not a registered broker-dealer, financial advisor, asset manager, or securities exchange under the Financial Conduct Authority (FCA), Commodity Futures Trading Commission (CFTC), or Australian Securities and Investments Commission (ASIC). Directory inclusions, comparison tables, and reviews do not constitute an offer, recommendation, or solicitation to invest capital. Always read our <Link href="/risk-disclaimer" className="underline font-bold text-orange hover:text-orange-hover">High-Risk Investment Warning</Link> before trading live market funds.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center py-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/brokers" variant="primary" size="lg" withArrow>
            Explore Regulated Directory
          </Button>
          <Button href="/complaint-box" variant="secondary" size="lg">
            Visit Complaint Box
          </Button>
        </div>
      </div>
    </div>
  );
}
