'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  X,
  Plus,
  ShieldCheck,
  Star,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Broker } from '../../../../types';
import { useCompareStore } from '../../../../store/compareStore';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function BrokerComparePage() {
  const { selectedBrokerIds, removeBroker, clearBrokers } = useCompareStore();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrokers() {
      if (selectedBrokerIds.length === 0) {
        setBrokers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/brokers/compare?ids=${selectedBrokerIds.join(',')}`);
        setBrokers(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load comparison data', err);
      } finally {
        setLoading(false);
      }
    }

    loadBrokers();
  }, [selectedBrokerIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (brokers.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-navy-light border border-slate-700 flex items-center justify-center text-brand-blue mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Compare Regulated Forex Brokers
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8">
          You need at least 2 brokers selected to run a side-by-side technical comparison.
          Currently selected: {brokers.length}.
        </p>
        <Link
          href="/brokers"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          <span>Browse Broker Directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              Side-by-Side Analysis
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Broker Comparison Matrix
            </h1>
          </div>
          <button
            onClick={clearBrokers}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy-light hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        </div>

        {/* ─── Comparison Matrix Table ─────────────────────────────── */}
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-brand-navy-card/80 shadow-2xl backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-navy-light/40">
                <th className="p-6 w-56 text-xs font-bold uppercase tracking-wider text-slate-400 sticky left-0 bg-brand-navy-card z-10">
                  Feature / Specification
                </th>
                {brokers.map((b) => (
                  <th key={b.id} className="p-6 min-w-[240px] text-center border-l border-slate-800/80">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => removeBroker(b.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-brand-navy-light border border-slate-700 mx-auto mb-3 flex items-center justify-center p-2">
                      {b.logo ? (
                        <img src={b.logo} alt={b.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-lg font-bold text-slate-300">{b.companyName[0]}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{b.companyName}</h3>
                    <div className="flex items-center justify-center gap-1 text-xs mb-3">
                      <StarRating rating={b.avgRating} />
                      <span className="font-semibold text-slate-200">({b.avgRating.toFixed(1)})</span>
                    </div>
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="block w-full py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      View Profile
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              {/* Row: Regulatory Licenses */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Regulatory Bodies
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {b.regulation && b.regulation.length > 0 ? (
                        b.regulation.map((reg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
                          >
                            {reg}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Min Deposit */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Minimum Deposit
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-white">
                    {b.minDeposit ? `$${b.minDeposit}` : 'No Minimum'}
                  </td>
                ))}
              </tr>

              {/* Row: Max Leverage */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Maximum Leverage
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-brand-amber">
                    {b.maxLeverage || '1:500'}
                  </td>
                ))}
              </tr>

              {/* Row: Spreads */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  EUR/USD Raw Spreads
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-emerald-400">
                    {b.spreadsFrom || '0.0 Pips'}
                  </td>
                ))}
              </tr>

              {/* Row: Commission */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Commission per Lot
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center text-slate-200">
                    {b.commissions || '$0 / Zero'}
                  </td>
                ))}
              </tr>

              {/* Row: Platforms */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Supported Platforms
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center">
                    <div className="flex flex-wrap justify-center gap-1 text-xs">
                      {b.tradingPlatforms && b.tradingPlatforms.length > 0 ? (
                        b.tradingPlatforms.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-brand-navy-light text-slate-300">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">MT4, MT5</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Account Types */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Account Types
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center text-xs text-slate-300">
                    {b.accountTypes && b.accountTypes.length > 0
                      ? b.accountTypes.join(', ')
                      : 'Standard, ECN'}
                  </td>
                ))}
              </tr>

              {/* Row: Deposit Methods */}
              <tr>
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Deposit Gateways
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center text-xs text-slate-300">
                    {b.depositMethods && b.depositMethods.length > 0
                      ? b.depositMethods.join(', ')
                      : 'Wire, Card, Crypto'}
                  </td>
                ))}
              </tr>

              {/* Row: Direct Link CTA */}
              <tr className="bg-brand-navy-light/20">
                <td className="p-5 font-semibold text-slate-300 sticky left-0 bg-brand-navy-card z-10">
                  Direct Action
                </td>
                {brokers.map((b) => (
                  <td key={b.id} className="p-5 border-l border-slate-800 text-center">
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition"
                    >
                      <span>Open Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
