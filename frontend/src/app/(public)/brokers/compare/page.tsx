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
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Broker } from '../../../../types';
import { useCompareStore } from '../../../../store/compareStore';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function BrokerComparePage() {
  const { selectedBrokerIds, addBroker, removeBroker, toggleBroker, clearBrokers } = useCompareStore();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [availableBrokers, setAvailableBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Fetch directory catalog for the quick broker picker
  useEffect(() => {
    async function loadCatalog() {
      setLoadingCatalog(true);
      try {
        const res = await api.get('/brokers?limit=12');
        setAvailableBrokers(res.data?.data?.brokers || res.data?.data || []);
      } catch (err) {
        console.error('Failed to load broker catalog for comparison', err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  // Fetch comparison data for selected broker IDs
  useEffect(() => {
    async function loadComparison() {
      if (selectedBrokerIds.length === 0) {
        setBrokers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const ids = selectedBrokerIds.join(',');
        const res = await api.get(`/brokers/compare?brokerIds=${ids}&ids=${ids}`);
        setBrokers(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load comparison data', err);
        // Fallback: match from available catalog if compare endpoint has filtered status
        setBrokers((prev) => {
          const matched = availableBrokers.filter((b) => selectedBrokerIds.includes(b.id));
          return matched.length > 0 ? matched : prev;
        });
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [selectedBrokerIds, availableBrokers]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-slate-100 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Forex Broker Comparison Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Side-by-Side Broker Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare spreads, regulation, leverage, and fees across top regulated brokers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
            Selected: <span className="font-bold text-blue-400">{selectedBrokerIds.length}</span> / 4
          </div>
          {selectedBrokerIds.length > 0 && (
            <button
              onClick={clearBrokers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <Link
            href="/brokers"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
          >
            <span>Browse All Brokers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Loading State ────────────────────────────────────────── */}
      {loading && selectedBrokerIds.length >= 2 && (
        <div className="space-y-6 py-8">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}

      {/* ─── Comparison Matrix (when at least 2 brokers selected) ─── */}
      {!loading && brokers.length >= 2 && (
        <div className="space-y-12">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#0F172A]/90 shadow-2xl backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-6 w-60 text-xs font-bold uppercase tracking-wider text-slate-400 sticky left-0 bg-[#0F172A] z-20">
                    Technical Specifications
                  </th>
                  {brokers.map((b) => (
                    <th key={b.id} className="p-6 min-w-[260px] text-center border-l border-slate-800/80 align-top">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => removeBroker(b.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mx-auto mb-3 flex items-center justify-center p-2 shadow-inner">
                        {b.logo ? (
                          <img src={b.logo} alt={b.companyName} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-blue-400">{b.companyName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{b.companyName}</h3>
                      <div className="flex items-center justify-center gap-1.5 text-xs mb-4">
                        <StarRating rating={b.avgRating || 5.0} size={14} />
                        <span className="font-semibold text-slate-200">({(b.avgRating || 5.0).toFixed(1)})</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/brokers/${b.slug}`}
                          className="block w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                        >
                          View Full Profile
                        </Link>
                        {b.website && (
                          <a
                            href={b.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
                          >
                            <span>Official Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </th>
                  ))}

                  {/* Add Broker Slot (if fewer than 4 are compared) */}
                  {brokers.length < 4 && (
                    <th className="p-6 min-w-[200px] text-center border-l border-slate-800/80 border-dashed align-middle">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-400">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-slate-300 mb-2">Compare another broker</p>
                        <p className="text-[11px] text-slate-400">Pick from directory below ({brokers.length}/4)</p>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                {/* Row: Regulatory Licenses */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Regulatory Licenses
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
                          <span className="text-slate-400">Tier-1 Registered</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Min Deposit */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Minimum Deposit
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-white text-base">
                      {b.minDeposit !== null && b.minDeposit !== undefined && b.minDeposit > 0 ? `$${b.minDeposit}` : '$0 (No Minimum)'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Max Leverage */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Maximum Leverage
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-amber-400">
                      {b.maxLeverage || '1:500'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Spreads */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    EUR/USD Raw Spreads
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center font-bold text-emerald-400">
                      {b.spreadsFrom || 'From 0.0 Pips'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Commission */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Trading Commission
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center text-slate-200">
                      {b.commissions || '$0 / Zero Commission'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Trading Platforms */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Supported Platforms
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center">
                      <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                        {b.tradingPlatforms && b.tradingPlatforms.length > 0 ? (
                          b.tradingPlatforms.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">MT4, MT5, WebTrader</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Account Types */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Available Account Types
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center text-xs text-slate-300">
                      {b.accountTypes && b.accountTypes.length > 0 ? b.accountTypes.join(', ') : 'Standard, ECN, Raw'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Deposit Methods */}
                <tr>
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Payment & Deposit Methods
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center text-xs text-slate-300">
                      {b.depositMethods && b.depositMethods.length > 0
                        ? b.depositMethods.join(', ')
                        : 'Credit Card, Bank Wire, Crypto'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>

                {/* Row: Direct CTA */}
                <tr className="bg-slate-900/90">
                  <td className="p-5 font-bold text-slate-300 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Action
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-slate-800 text-center">
                      <Link
                        href={`/brokers/${b.slug}`}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                      >
                        <span>Trade with {b.companyName.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-slate-800 bg-slate-900/20"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Broker Selection Picker (Shown when < 2 selected or as quick adder) ─── */}
      <div className={`mt-10 ${brokers.length >= 2 ? 'pt-10 border-t border-slate-800' : ''}`}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {brokers.length >= 2 ? 'Add or Swap Brokers in Comparison' : 'Select Brokers to Compare'}
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Select at least 2 brokers (up to 4) to generate a detailed feature-by-feature technical analysis.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-400">
            {selectedBrokerIds.length < 2 ? (
              <span className="text-amber-400">Select {2 - selectedBrokerIds.length} more broker(s) to view matrix</span>
            ) : (
              <span className="text-emerald-400 font-semibold">Ready for comparison ({selectedBrokerIds.length} selected)</span>
            )}
          </div>
        </div>

        {loadingCatalog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableBrokers.map((b) => {
              const isSelected = selectedBrokerIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                        {b.logo ? (
                          <img src={b.logo} alt={b.companyName} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-blue-400">{b.companyName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-white">{(b.avgRating || 4.8).toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1 line-clamp-1">{b.companyName}</h3>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {b.regulation && b.regulation.length > 0 ? (
                        b.regulation.slice(0, 2).map((reg, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {reg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400">Regulated</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 mb-4">
                      <div>
                        <div className="text-slate-400">Min Deposit</div>
                        <div className="font-bold text-white">{b.minDeposit ? `$${b.minDeposit}` : '$0'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Max Leverage</div>
                        <div className="font-bold text-amber-400">{b.maxLeverage || '1:500'}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBroker(b.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Comparison</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Compare</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
