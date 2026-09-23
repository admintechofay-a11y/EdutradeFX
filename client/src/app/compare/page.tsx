'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  Star,
  ExternalLink,
  X,
  Plus,
  Check,
  AlertTriangle,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { MOCK_BROKERS } from '@/lib/mockData';
import RatingStars from '@/components/shared/RatingStars';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';

export default function ComparePage() {
  const { compareList, removeFromCompare } = useCompare();

  // Pick up to 3 brokers
  const defaultSlugs =
    compareList.length > 0
      ? compareList.map((cb) => cb.slug).slice(0, 3)
      : MOCK_BROKERS.slice(0, 3).map((b) => b?.slug).filter(Boolean);

  const [selectedSlugs, setSelectedSlugs] = useState<(string | null)[]>([
    defaultSlugs[0] || null,
    defaultSlugs[1] || null,
    defaultSlugs[2] || null,
  ]);

  const [activeDropdownSlot, setActiveDropdownSlot] = useState<number | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const activeBrokers = selectedSlugs.map((slug) =>
    slug ? MOCK_BROKERS.find((b) => b.slug === slug || b._id === slug) || null : null
  );

  const handleSelectBroker = (slotIndex: number, brokerSlug: string) => {
    const updated = [...selectedSlugs];
    updated[slotIndex] = brokerSlug;
    setSelectedSlugs(updated);
    setActiveDropdownSlot(null);
    setDropdownSearch('');
  };

  const handleRemoveSlot = (slotIndex: number) => {
    const updated = [...selectedSlugs];
    updated[slotIndex] = null;
    setSelectedSlugs(updated);
  };

  // Find lowest spread and lowest deposit to highlight "Winner"
  const validBrokers = activeBrokers.filter(Boolean) as typeof MOCK_BROKERS;
  const bestSafety = validBrokers.length > 0 ? Math.max(...validBrokers.map((b) => b.safetyScore)) : 0;
  const bestSpread = validBrokers.length > 0 ? Math.min(...validBrokers.map((b) => b.eurUsdSpread)) : 0;
  const bestDeposit = validBrokers.length > 0 ? Math.min(...validBrokers.map((b) => b.minDeposit)) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-off-white">
      {/* Page Header: dark strip same pattern as directory pages */}
      <header className="bg-navy-deep border-b border-navy-border text-text-on-dark py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] text-text-muted-dark mb-3">
            <Link href="/" className="hover:text-gold-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Compare</span>
          </nav>

          <h1 className="font-serif text-[32px] sm:text-[36px] leading-tight text-white font-normal">
            Side-by-Side Broker Comparison
          </h1>
          <p className="font-sans text-[14px] text-text-muted-dark mt-1 max-w-[68ch]">
            Benchmark regulatory tiers, live EUR/USD spreads, maximum leverage, and audited safety scores across up to 3 Forex brokers simultaneously.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full space-y-8">
        {/* Broker Selector Row: 3 dashed boxes side by side (desktop) / stacked (mobile) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((slotIdx) => {
            const broker = activeBrokers[slotIdx];
            const isDropdownOpen = activeDropdownSlot === slotIdx;

            if (broker) {
              return (
                <div
                  key={slotIdx}
                  className="relative bg-white border border-[#E2E8F0] rounded-md p-6 shadow-card flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slotIdx)}
                    className="absolute top-3 right-3 p-1 rounded-full text-text-secondary hover:text-danger hover:bg-[#FEE2E2] transition-colors"
                    title="Remove Broker"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] p-2 flex items-center justify-center shrink-0">
                      <img
                        src={broker.logo}
                        alt={broker.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-[18px] text-text-primary font-normal">
                        {broker.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <RatingStars rating={broker.rating} size="sm" showNumber />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                      {broker.regulation[0]} Regulated
                    </span>
                    <Link
                      href={`/brokers/${broker.slug}`}
                      className="text-[13px] font-bold text-gold-primary hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div key={slotIdx} className="relative">
                <div
                  onClick={() => {
                    setActiveDropdownSlot(isDropdownOpen ? null : slotIdx);
                    setDropdownSearch('');
                  }}
                  className="border-2 border-dashed border-[#CBD5E0] bg-white rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold-primary transition-colors min-h-[160px] shadow-sm group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] group-hover:bg-gold-primary/10 flex items-center justify-center text-text-secondary group-hover:text-gold-primary transition-colors mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <strong className="font-sans text-[15px] text-text-primary font-semibold block">
                    Add Broker
                  </strong>
                  <span className="text-[12px] text-text-secondary mt-0.5">
                    Click to select slot #{slotIdx + 1}
                  </span>
                </div>

                {/* Inline Search Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-[#E2E8F0] rounded-md shadow-modal p-3 space-y-2 animate-in fade-in zoom-in-95">
                    <div className="relative">
                      <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search brokers..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[13px] text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {MOCK_BROKERS.filter(
                        (b) =>
                          !selectedSlugs.includes(b.slug) &&
                          b.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                      ).map((b) => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleSelectBroker(slotIdx, b.slug)}
                          className="w-full text-left p-2.5 flex items-center justify-between hover:bg-[#F8FAFC] rounded-md transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={b.logo}
                              alt={b.name}
                              className="w-6 h-6 object-contain"
                            />
                            <span className="font-sans text-[13px] font-semibold text-text-primary">
                              {b.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-secondary">
                            {b.regulation[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Comparison Table */}
        {validBrokers.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-md p-12 text-center space-y-3 shadow-card">
            <Scale className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="font-serif text-[24px] text-text-primary">No Brokers Selected</h3>
            <p className="font-sans text-[14px] text-text-secondary max-w-md mx-auto">
              Please click "Add Broker" above to choose brokers to compare side-by-side.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-[#E2E8F0] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                {/* Header Row */}
                <thead>
                  <tr className="bg-navy-deepest border-b border-navy-border">
                    <th className="sticky left-0 bg-navy-deepest z-10 p-4 w-[240px] text-text-muted-dark font-sans text-[13px] font-semibold uppercase tracking-wide">
                      Parameters
                    </th>
                    {selectedSlugs.map((slug, idx) => {
                      const broker = slug
                        ? MOCK_BROKERS.find((b) => b.slug === slug || b._id === slug)
                        : null;
                      return (
                        <th key={idx} className="p-4 text-white font-serif text-[18px] font-normal w-[280px]">
                          {broker ? broker.name : `Slot #${idx + 1} (Empty)`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2E8F0] text-[15px]">
                  {/* Category 1: Trust & Safety */}
                  <tr className="bg-navy-deepest">
                    <td
                      colSpan={4}
                      className="p-3 text-text-muted-dark font-sans text-[13px] font-semibold uppercase tracking-wider pl-4"
                    >
                      Trust & Regulatory Safety
                    </td>
                  </tr>

                  {/* Safety Score */}
                  <tr className="bg-white hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Safety & Trust Score
                    </td>
                    {activeBrokers.map((b, i) => {
                      if (!b) return <td key={i} className="p-4 text-text-secondary">—</td>;
                      const isWinner = b.safetyScore === bestSafety;
                      return (
                        <td
                          key={i}
                          className={`p-4 font-bold text-text-primary ${
                            isWinner ? 'border-l-4 border-gold-primary bg-gold-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] font-serif text-text-primary">
                              {b.safetyScore}/100
                            </span>
                            {b.safetyScore >= 90 && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46]">
                                Tier 1
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Regulations */}
                  <tr className="bg-[#F8FAFC] hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-[#F8FAFC] font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Regulatory Licenses
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4 text-text-primary">
                        {b ? b.regulation.join(', ') : '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Anti-Scam Audit */}
                  <tr className="bg-white hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Mediation Audit Status
                    </td>
                    {activeBrokers.map((b, i) => {
                      if (!b) return <td key={i} className="p-4 text-text-secondary">—</td>;
                      return (
                        <td key={i} className="p-4">
                          {b.scamWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FEF2F2] text-[#991B1B]">
                              <AlertTriangle className="w-3.5 h-3.5" /> Caution Alert
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#ECFDF5] text-[#065F46]">
                              <Check className="w-3.5 h-3.5" /> Clean Audit
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Category 2: Trading Costs & Conditions */}
                  <tr className="bg-navy-deepest">
                    <td
                      colSpan={4}
                      className="p-3 text-text-muted-dark font-sans text-[13px] font-semibold uppercase tracking-wider pl-4"
                    >
                      Trading Costs & Conditions
                    </td>
                  </tr>

                  {/* Spread Model */}
                  <tr className="bg-white hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Spread Model
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4 text-text-primary font-medium">
                        {b ? b.spreadType : '—'}
                      </td>
                    ))}
                  </tr>

                  {/* EUR/USD Typical Spread */}
                  <tr className="bg-[#F8FAFC] hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-[#F8FAFC] font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      EUR/USD Typical Spread
                    </td>
                    {activeBrokers.map((b, i) => {
                      if (!b) return <td key={i} className="p-4 text-text-secondary">—</td>;
                      const isWinner = b.eurUsdSpread === bestSpread;
                      return (
                        <td
                          key={i}
                          className={`p-4 font-bold text-text-primary ${
                            isWinner ? 'border-l-4 border-gold-primary bg-gold-primary/5' : ''
                          }`}
                        >
                          {b.eurUsdSpread} pips
                          {isWinner && (
                            <span className="ml-2 text-[11px] font-bold text-gold-primary uppercase">
                              Lowest
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Min Initial Deposit */}
                  <tr className="bg-white hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Minimum Deposit
                    </td>
                    {activeBrokers.map((b, i) => {
                      if (!b) return <td key={i} className="p-4 text-text-secondary">—</td>;
                      const isWinner = b.minDeposit === bestDeposit;
                      return (
                        <td
                          key={i}
                          className={`p-4 font-bold text-text-primary ${
                            isWinner ? 'border-l-4 border-gold-primary bg-gold-primary/5' : ''
                          }`}
                        >
                          ${b.minDeposit}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Max Leverage */}
                  <tr className="bg-[#F8FAFC] hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-[#F8FAFC] font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Max Leverage
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4 text-text-primary font-semibold">
                        {b ? b.maxLeverage : '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Trading Platforms */}
                  <tr className="bg-white hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Trading Platforms
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4 text-text-primary">
                        {b ? (
                          <div className="flex flex-wrap gap-1.5">
                            {b.tradingPlatforms.map((pl) => (
                              <span
                                key={pl}
                                className="px-2.5 py-1 rounded-full text-[12px] bg-[#F1F5F9] border border-[#E2E8F0]"
                              >
                                {pl}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Withdrawal Speed */}
                  <tr className="bg-[#F8FAFC] hover:bg-[#FAFAFA]">
                    <td className="sticky left-0 bg-[#F8FAFC] font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Withdrawal Speed
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4 text-text-primary">
                        {b ? b.withdrawalTime || 'Same Day' : '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Bottom CTA Row */}
                  <tr className="bg-white">
                    <td className="sticky left-0 bg-white font-semibold text-text-secondary text-[14px] p-4 border-r border-[#E2E8F0]">
                      Official Broker Links
                    </td>
                    {activeBrokers.map((b, i) => (
                      <td key={i} className="p-4">
                        {b ? (
                          <div className="space-y-2">
                            <a
                              href={b.affiliateUrl || b.websiteUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full h-[40px] px-4 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              Visit Broker
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <Link
                              href={`/brokers/${b.slug}`}
                              className="block text-center text-[13px] font-semibold text-text-secondary hover:text-text-primary py-1"
                            >
                              View Full Review
                            </Link>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ListingDisclaimer />
      </main>
    </div>
  );
}

