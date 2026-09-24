import React from 'react';
import Link from 'next/link';
import { Shield, FileText, AlertTriangle, Scale, Lock, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | EduTradeFX',
  description: 'Read the official terms and conditions governing the use of EduTradeFX educational resources, broker directories, and trading tools.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: January 1, 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Highlighted Warning Box */}
        <div className="mb-10 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-brand-amber font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Important Summary & Educational Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            EduTradeFX is strictly an educational community, independent directory, and dispute facilitation platform. EduTradeFX is <strong>not</strong> a broker-dealer, financial advisor, investment manager, or custodian of customer trading funds. Trading Foreign Exchange (Forex), Contracts for Difference (CFDs), and leveraged derivatives carries extreme financial risk.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed bg-brand-navy-card border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or registering an account on EduTradeFX ("the Platform", "we", "us", or "our"), you agree to be legally bound by these Terms of Service, our Privacy Policy, and our High-Risk Investment Disclaimer. If you do not agree to all provisions of these terms, you must discontinue your use of our platform immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">2.</span> Scope of Services & Educational Nature
            </h2>
            <p>
              EduTradeFX provides a unified hub for financial market participants, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Comprehensive directory listings, comparison matrices, and user reviews for retail Forex/CFD brokerages.</li>
              <li>A marketplace and directory connecting traders with independent Account Managers (PAMM/MAM operators) and Signal Providers.</li>
              <li>An educational Learning Management System (LMS) offering trading courses, webinars, quizzes, and mentor coaching.</li>
              <li>An independent trader grievance and dispute resolution facilitation desk ("Complaint Box").</li>
            </ul>
            <p className="text-xs text-slate-400">
              None of the content, signals, directory scores, course lectures, or reviews published on the Platform constitute individualized financial advice or an endorsement of any particular investment vehicle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">3.</span> User Registration & Account Security
            </h2>
            <p>
              To access specific features, such as course enrollment, review submissions, or dispute filing, you may be required to register an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Provide accurate, current, and complete legal information during registration.</li>
              <li>Maintain the confidentiality of your login credentials and accept responsibility for all activities under your account.</li>
              <li>Immediately notify EduTradeFX at support@edutradefx.com of any unauthorized security breach or compromise.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">4.</span> Third-Party Brokers & Advertisers
            </h2>
            <p>
              EduTradeFX displays links, commercial banners, and comparison profiles for third-party brokerage institutions. Clicking on external broker links redirects you to third-party domains governed by their own regulatory licenses, terms, and privacy protocols. EduTradeFX is not liable for broker solvency, order execution latency, slippage, liquidity failure, or withdrawal disputes arising with third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">5.</span> Account Managers & Signal Providers
            </h2>
            <p>
              Independent Account Managers and Signal Providers listed on EduTradeFX operate as independent third-party contractors. Past performance metrics, historical profit-and-loss charts, and win-rates displayed are historical indicators and do not guarantee future profitable trading. You assume full risk when copying trades, connecting API keys, or subscribing to PAMM/MAM allocations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">6.</span> Learning Management System & Intellectual Property
            </h2>
            <p>
              All course materials, video lectures, quizzes, and documentation provided on the EduTradeFX LMS are protected by international copyright laws. Enrolled students receive a limited, revocable, non-transferable license for personal educational use only. Reselling, recording, re-broadcasting, or commercially distributing course curriculum without express written permission is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">7.</span> Dispute Facilitation & Public Grievance Desk
            </h2>
            <p>
              The EduTradeFX Complaint Box serves as a voluntary community dispute facilitator. EduTradeFX is not a court of law, ombudsman, or statutory regulatory commission. By submitting a complaint, you grant EduTradeFX permission to contact the counterparty and publish non-confidential case summaries to warn fellow community traders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">8.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, EduTradeFX, its officers, employees, tutors, and affiliates shall not be liable for any direct, indirect, incidental, punitive, or consequential losses—including loss of capital, missed trade executions, market crashes, or broker liquidation—arising out of your use of the Platform or reliance on information presented herein.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-brand-blue">9.</span> Termination & Modifications
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that engage in fraudulent reviews, spam, abusive language, or violation of applicable trading laws. We may amend these Terms at any time by posting the revised version on this page with an updated Effective Date.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">Questions & Legal Contact</h2>
            <p>
              If you have any questions or require legal clarification regarding these Terms of Service, please reach out to our legal department at:
            </p>
            <div className="text-xs font-mono text-brand-blue">
              legal@edutradefx.com • Level 24, One Financial Tower, Canary Wharf, London, UK
            </div>
          </section>

        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/risk-disclaimer" className="hover:text-white transition">Risk Disclaimer</Link>
          <span>•</span>
          <Link href="/complaint-box" className="hover:text-white transition">Complaint Box</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
        </div>

      </div>
    </div>
  );
}
