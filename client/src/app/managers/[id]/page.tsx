'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  ArrowDownRight,
  Send,
  ArrowLeft,
  DollarSign,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { MOCK_MANAGERS } from '@/lib/mockData';

export default function ManagerDetailPage({ params }: { params: { id: string } }) {
  const manager = MOCK_MANAGERS.find((m) => m._id === params.id) || MOCK_MANAGERS[0];
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [accountBalance, setAccountBalance] = useState('10000');
  const [brokerName, setBrokerName] = useState('IC Markets');
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setConnectModalOpen(false);
      setInquirySent(false);
    }, 2000);
  };

  // Generate SVG points for the equity curve
  const points = manager.equityCurve || [
    { date: 'Jan', equity: 10000 },
    { date: 'Feb', equity: 11450 },
    { date: 'Mar', equity: 13200 },
    { date: 'Apr', equity: 15400 },
    { date: 'May', equity: 17950 },
    { date: 'Jun', equity: 21100 },
  ];

  const minEquity = Math.min(...points.map((p) => p.equity));
  const maxEquity = Math.max(...points.map((p) => p.equity));
  const range = maxEquity - minEquity || 1;

  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 20;

  const coordinates = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1)) * (svgWidth - padding * 2);
    const y =
      svgHeight -
      padding -
      ((p.equity - minEquity) / range) * (svgHeight - padding * 2);
    return { x, y, ...p };
  });

  const pathD = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${svgHeight - padding} L ${coordinates[0].x} ${svgHeight - padding} Z`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        href="/managers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Signal Providers
      </Link>

      {/* Header Profile */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={manager.avatar}
              alt={manager.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50"
            />
            {manager.verified && (
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-brand-darkest rounded-full p-1 shadow-lg"
                title="Verified Track Record"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{manager.name}</h1>
              <span className="badge-gold text-xs">{manager.tradingStyle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{manager.title}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="badge-regulation">{manager.category}</span>
              <span className="text-emerald-400 font-bold">
                Risk Rating: {manager.riskScore || 3}/10 (Conservative)
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {manager.telegramLink && (
            <a
              href={manager.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-700 bg-brand-surface hover:border-amber-400 text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <Send className="w-4 h-4 text-sky-400" />
              Telegram
            </a>
          )}

          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-brand-darkest transition-all shadow-glow-green"
          >
            Connect Account / Subscribe
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card border border-slate-800 p-5 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Win Rate</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            {manager.winRate}%
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Verified Execution</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Avg Monthly ROI</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
            +{manager.monthlyRoi}%
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Compound Growth</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Max Drawdown</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-200 mt-1 block">
            {manager.maxDrawdown}%
          </span>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">Strict Risk Cap</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Pips</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            +{manager.totalPips?.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Cumulative</span>
        </div>
      </div>

      {/* Interactive Equity Curve & Monthly History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equity Curve SVG Chart */}
        <div className="lg:col-span-2 rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Verified Equity Curve ($)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Simulated growth starting with $10,000 capital balance.</p>
            </div>
            <span className="badge-green text-xs font-bold">Live Feed Verified</span>
          </div>

          <div className="w-full overflow-hidden pt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path d={areaD} fill="url(#equityGrad)" />

              {/* Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {coordinates.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    className="fill-emerald-400 stroke-brand-darkest stroke-2"
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-semibold"
                  >
                    {pt.date}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-white font-bold"
                  >
                    ${pt.equity.toLocaleString()}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Monthly Returns Breakdown</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Return</th>
                  <th className="pb-2">Pips</th>
                  <th className="pb-2">Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {manager.monthlyHistory?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-semibold text-white">
                      {row.month} {row.year}
                    </td>
                    <td className="py-2.5 font-bold text-emerald-400">
                      +{row.returnPercentage}%
                    </td>
                    <td className="py-2.5 text-amber-400">+{row.pips}</td>
                    <td className="py-2.5 text-slate-400">{row.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p><strong>Fee Model:</strong> {manager.pricingModel === 'profit_share' ? `${manager.profitSharePercentage}% High-Water Mark` : `$${manager.subscriptionPrice}/month`}</p>
            <p><strong>Recommended Broker:</strong> IC Markets or Pepperstone (Raw ECN)</p>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-card border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Connect with {manager.name}</h3>
              <button onClick={() => setConnectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Inquiry Sent Successfully</h4>
                <p className="text-xs text-slate-400">The provider has been notified and will contact you via Telegram or Email with account linking instructions.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Your Trading Broker</label>
                  <input
                    type="text"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Account Balance ($ USD)</label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    required
                    min="500"
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 leading-relaxed text-[11px]">
                  <strong>Risk Notice:</strong> You retain 100% control of your trading funds. Funds remain deposited in your own broker account; trades are replicated via MAM / CopyTrade software.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConnectModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold uppercase tracking-wider bg-emerald-500 text-brand-darkest rounded-xl shadow-glow-green"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
