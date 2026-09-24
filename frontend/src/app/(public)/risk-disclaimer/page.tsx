import React from 'react';
import Link from 'next/link';
import { AlertOctagon, TrendingDown, ShieldAlert, Award, AlertTriangle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'High-Risk Investment Warning & Disclaimer | EduTradeFX',
  description: 'Understand the critical risks associated with leveraged Forex trading, CFDs, PAMM account managers, and third-party copy-trading signals.',
};

export default function RiskDisclaimerPage() {
  return (
    <div className="min-h-screen py-16 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Statutory Risk Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            High-Risk Investment Disclaimer
          </h1>
          <p className="text-sm text-slate-400">
            Please read this risk disclosure carefully before engaging in live financial market trading or utilizing third-party services.
          </p>
        </div>

        {/* Regulatory High-Risk Banner */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-red-950/40 border border-red-500/40 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-red-400 font-extrabold text-base sm:text-lg">
            <AlertOctagon className="w-6 h-6 shrink-0" />
            <span>Retail Investor Loss Warning (CFDs & Leveraged FX)</span>
          </div>
          <p className="text-sm sm:text-base text-red-200 leading-relaxed font-medium">
            <strong>CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.</strong> Between <strong>74% and 89%</strong> of retail investor accounts lose money when trading CFDs and Forex with retail providers. You should consider whether you understand how leveraged derivatives work and whether you can afford to take the high risk of losing your invested capital.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed bg-brand-navy-card border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-red-400 font-mono">01.</span> The Double-Edged Nature of Leverage
            </h2>
            <p>
              Leveraged trading (such as 1:30, 1:100, or 1:500 margin ratios) allows traders to control larger market positions with a relatively small initial deposit. While leverage significantly amplifies potential returns on winning trades, it equally amplifies losses on adverse price swings. A minor market fluctuation against your position can wipe out your entire account balance within milliseconds or trigger a margin call liquidation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-red-400 font-mono">02.</span> Past Performance Is Not Predictive
            </h2>
            <p>
              Any historical win-rates, audited Myfxbook statements, return percentages, or backtested simulations displayed for Brokers, Account Managers, or Signal Providers on EduTradeFX represent historical data under specific market regimes. <strong>Past performance is neither a guarantee nor a reliable indicator of future profitability.</strong> Market conditions change rapidly, and trading algorithms that excelled in previous months can experience catastrophic drawdowns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-red-400 font-mono">03.</span> Account Managers & PAMM/MAM Risks
            </h2>
            <p>
              Allocating investment capital to independent Account Managers or PAMM (Percentage Allocation Management Module) accounts involves handing trade execution authority to third parties. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>EduTradeFX does not manage money, custody deposits, or guarantee the risk controls of listed account managers.</li>
              <li>Managers may utilize martingale, grid, or high-risk hedging strategies that expose accounts to sudden 100% loss.</li>
              <li>Traders retain the exclusive legal responsibility to verify manager credentials, maximum drawdown historical limits, and stop-loss enforcement before delegating capital.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-red-400 font-mono">04.</span> Signal Provider Latency & Execution Variance
            </h2>
            <p>
              Copying signals from third-party signal providers is subject to execution latency, broker spread differences, slippage, and requotes. The price at which a signal provider enters a trade may differ substantially from the fill price achieved on your individual brokerage account. EduTradeFX accepts no liability for disparities in trade fills or execution slippage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-red-400 font-mono">05.</span> Educational Content & Non-Advisory Status
            </h2>
            <p>
              All video lessons, interactive quizzes, analytical blog articles, mentor feedback, and directory rankings published by EduTradeFX are provided solely for general informational and educational purposes. Nothing on this website constitutes personal financial advice, tax guidance, or an offer or solicitation to purchase or sell any currency pair, CFD, equity, or commodity.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">Prudent Risk Management Recommendation</h2>
            <p>
              Never trade with funds you cannot afford to lose. We strongly advise beginner and intermediate traders to master risk management principles, paper trade extensively on simulated demo accounts, and consult an independent, qualified financial advisor before committing real capital to speculative financial markets.
            </p>
          </section>

        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/complaint-box" className="hover:text-white transition">Complaint Box</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
        </div>

      </div>
    </div>
  );
}
