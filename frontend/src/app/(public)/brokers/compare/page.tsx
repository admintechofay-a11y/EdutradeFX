'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  X,
  Plus,
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
  const { selectedBrokerIds, removeBroker, toggleBroker, clearBrokers } = useCompareStore();
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-text-body max-w-7xl mx-auto bg-white">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint border border-blue/20 text-blue text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Forex Broker Comparison Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-heading tracking-tight">
            Side-by-Side Broker Matrix
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Compare spreads, regulation, leverage, and fees across top regulated brokers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-surface-tint border border-border text-xs font-semibold text-text-heading">
            Selected: <span className="font-bold text-blue">{selectedBrokerIds.length}</span> / 4
          </div>
          {selectedBrokerIds.length > 0 && (
            <button
              onClick={clearBrokers}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <Link
            href="/brokers"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue hover:bg-blue-hover text-white text-xs font-bold transition shadow-soft"
          >
            <span>Browse All Brokers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Loading State ────────────────────────────────────────── */}
      {loading && selectedBrokerIds.length >= 2 && (
        <div className="space-y-6 py-8">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}

      {/* ─── Comparison Matrix (when at least 2 brokers selected) ─── */}
      {!loading && brokers.length >= 2 && (
        <div className="space-y-12">
          <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-tint">
                  <th className="p-6 w-60 text-xs font-bold uppercase tracking-wider text-text-muted sticky left-0 bg-white z-20 border-r border-border">
                    Specifications
                  </th>
                  {brokers.map((b) => (
                    <th key={b.id} className="p-6 min-w-[260px] text-center border-l border-border align-top">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => removeBroker(b.id)}
                          className="p-1 rounded-full text-text-muted hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-white border border-border mx-auto mb-3 flex items-center justify-center p-2 shadow-sm">
                        {b.logo ? (
                          <img src={b.logo} alt={b.companyName} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold font-mono text-blue">{b.companyName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-text-heading mb-1 line-clamp-1">{b.companyName}</h3>
                      <div className="flex items-center justify-center gap-1.5 text-xs mb-4">
                        <StarRating rating={b.avgRating || 5.0} size={14} />
                        <span className="font-semibold text-text-muted">({(b.avgRating || 5.0).toFixed(1)})</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/brokers/${b.slug}`}
                          className="block w-full py-2.5 bg-orange hover:bg-orange-hover text-white rounded-full text-xs font-bold transition shadow-soft"
                        >
                          View Full Profile
                        </Link>
                        {b.website && (
                          <a
                            href={b.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 py-2 bg-surface-tint hover:bg-blue-50 text-blue rounded-full text-xs font-bold transition border border-border"
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
                    <th className="p-6 min-w-[200px] text-center border-l border-border border-dashed align-middle bg-surface-tint/50">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center mx-auto mb-2 text-text-muted shadow-sm">
                          <Plus className="w-6 h-6 text-blue" />
                        </div>
                        <p className="text-xs font-bold text-text-heading mb-1">Add another broker</p>
                        <p className="text-[11px] text-text-muted">Pick from catalog below ({brokers.length}/4)</p>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs sm:text-sm">
                {/* Row: Regulatory Licenses */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Regulatory Licenses
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {b.regulation && b.regulation.length > 0 ? (
                          b.regulation.map((reg, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full bg-green-50 text-green border border-green-200 text-xs font-bold"
                            >
                              {reg}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted">Tier-1 Registered</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Business Model */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Business Model
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center font-semibold text-text-heading text-xs">
                      {b.businessType || 'STP / ECN'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Negative Balance Protection */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Negative Balance Protection
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center font-bold text-xs text-emerald-600">
                      {b.negativeBalanceProtection !== false ? 'Active ✓' : 'No'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Min Deposit */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Minimum Deposit
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center font-bold text-text-heading text-base font-mono">
                      {b.minDeposit !== null && b.minDeposit !== undefined && b.minDeposit > 0 ? `$${b.minDeposit}` : '$0 (No Minimum)'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Max Leverage */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Maximum Leverage
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center font-bold text-blue font-mono">
                      {b.maxLeverage || '1:500'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Spreads */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    EUR/USD Raw Spreads
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center font-bold text-green font-mono">
                      {b.spreadsFrom || 'From 0.0 Pips'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Commission */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Trading Commission
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center text-text-body font-medium">
                      {b.commissions || '$0 / Zero Commission'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Trading Platforms */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Supported Platforms
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center">
                      <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                        {b.tradingPlatforms && b.tradingPlatforms.length > 0 ? (
                          b.tradingPlatforms.map((p, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full bg-surface-tint border border-border text-text-body font-semibold">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted">MT4, MT5, WebTrader</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Account Types */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Available Account Types
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center text-xs text-text-body">
                      {b.accountTypes && b.accountTypes.length > 0 ? b.accountTypes.join(', ') : 'Standard, ECN, Raw'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Deposit Methods */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Payment & Deposit Methods
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center text-xs text-text-body">
                      {b.depositMethods && b.depositMethods.length > 0
                        ? b.depositMethods.join(', ')
                        : 'Credit Card, Bank Wire, Crypto'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Base Currencies */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Base Currencies
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {b.accountCurrencies && b.accountCurrencies.length > 0 ? (
                          b.accountCurrencies.map((curr, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-tint border border-border text-xs font-semibold text-text-heading"
                            >
                              {curr}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted text-xs">USD, EUR, GBP</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Supported Languages */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Supported Languages
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center text-xs text-text-body">
                      {b.languagesSupported && b.languagesSupported.length > 0
                        ? b.languagesSupported.slice(0, 5).join(', ') + (b.languagesSupported.length > 5 ? ` +${b.languagesSupported.length - 5} more` : '')
                        : 'English, Multilingual'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Chart Timeframes */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Chart Timeframes
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center text-xs text-text-body">
                      {b.availableTimeframes && b.availableTimeframes.length > 0
                        ? b.availableTimeframes.join(', ')
                        : 'M1 to MN (Standard 9 Timeframes)'}
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Deposit Bonus */}
                <tr>
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Deposit Bonus Up To
                  </td>
                  {brokers.map((b) => {
                    const maxBonus = b.accountGroups?.reduce((max, g) => {
                      const bonus = g.depositBonusNum ?? (g.depositBonusPctUpTo ? Number(g.depositBonusPctUpTo) : 0);
                      return bonus > max ? bonus : max;
                    }, 0);
                    return (
                      <td key={b.id} className="p-5 border-l border-border text-center font-bold text-orange text-xs">
                        {maxBonus && maxBonus > 0 ? `${maxBonus}% Bonus` : 'Available on promo'}
                      </td>
                    );
                  })}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>

                {/* Row: Direct CTA */}
                <tr className="bg-surface-tint">
                  <td className="p-5 font-bold text-text-heading sticky left-0 bg-white z-10 border-r border-border">
                    Action
                  </td>
                  {brokers.map((b) => (
                    <td key={b.id} className="p-5 border-l border-border text-center">
                      <Link
                        href={`/brokers/${b.slug}`}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-orange hover:bg-orange-hover text-white rounded-full text-xs font-bold shadow-soft transition"
                      >
                        <span>Trade with {b.companyName.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  ))}
                  {brokers.length < 4 && <td className="border-l border-border bg-surface-tint/20"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Broker Selection Picker ─── */}
      <div className={`mt-12 ${brokers.length >= 2 ? 'pt-10 border-t border-border' : ''}`}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue" />
              <h2 className="text-lg sm:text-xl font-bold text-text-heading">
                {brokers.length >= 2 ? 'Add or Swap Brokers in Comparison' : 'Select Brokers to Compare'}
              </h2>
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Select at least 2 brokers (up to 4) to generate a detailed feature-by-feature technical analysis.
            </p>
          </div>
          <div className="text-xs font-semibold">
            {selectedBrokerIds.length < 2 ? (
              <span className="text-orange">Select {2 - selectedBrokerIds.length} more broker(s) to view matrix</span>
            ) : (
              <span className="text-green">Ready for comparison ({selectedBrokerIds.length} selected)</span>
            )}
          </div>
        </div>

        {loadingCatalog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {availableBrokers.map((b) => {
              const isSelected = selectedBrokerIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white shadow-soft ${
                    isSelected
                      ? 'border-blue ring-1 ring-blue/30 shadow-lift'
                      : 'border-border hover:border-blue/30 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-tint border border-border p-1.5 flex items-center justify-center shrink-0">
                        {b.logo ? (
                          <img src={b.logo} alt={b.companyName} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-sm font-bold font-mono text-blue">{b.companyName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <StarRating rating={b.avgRating || 4.8} size={13} />
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-text-heading mb-1 line-clamp-1">{b.companyName}</h3>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {b.regulation && b.regulation.length > 0 ? (
                        b.regulation.slice(0, 2).map((reg, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green border border-green-200">
                            {reg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-text-muted">Regulated</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-tint p-2.5 rounded-xl border border-border mb-4 font-mono">
                      <div>
                        <div className="text-text-muted font-sans font-medium text-[10px]">Min Deposit</div>
                        <div className="font-bold text-text-heading">{b.minDeposit ? `$${b.minDeposit}` : '$0'}</div>
                      </div>
                      <div>
                        <div className="text-text-muted font-sans font-medium text-[10px]">Max Leverage</div>
                        <div className="font-bold text-blue">{b.maxLeverage || '1:500'}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBroker(b.id)}
                    className={`w-full py-2.5 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                      isSelected
                        ? 'bg-blue hover:bg-blue-hover text-white'
                        : 'bg-white hover:bg-surface-tint text-text-heading border border-border hover:border-blue/30'
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
