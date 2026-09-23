'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Building2,
  Star,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Scale,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function SavedBrokersPage() {
  const [savedBrokers, setSavedBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedBrokers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/saved-brokers');
      if (res.data?.success) {
        setSavedBrokers(res.data.data?.brokers || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load saved brokers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedBrokers();
  }, []);

  const handleRemove = async (brokerId: string) => {
    try {
      await api.delete(`/users/saved-brokers/${brokerId}`);
      setSavedBrokers((prev) => prev.filter((b) => b.id !== brokerId && b.brokerId !== brokerId));
    } catch (err) {
      console.error('Failed to remove broker from saved', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-blue" />
            Saved Brokers & Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare and monitor your bookmarked brokerages, regulatory status, and spreads.
          </p>
        </div>
        <Link
          href="/brokers"
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
        >
          <Building2 className="w-4 h-4" />
          <span>Explore All Brokers</span>
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl bg-slate-800/40" />
          ))}
        </div>
      ) : savedBrokers.length === 0 ? (
        <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-white">Your Watchlist is Empty</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
            Bookmark top-tier forex brokers from our regulated directory to compare spreads, commissions, and execution speeds side by side.
          </p>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition"
          >
            Browse Regulated Brokers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedBrokers.map((item) => {
            const broker = item.broker || item;
            return (
              <div
                key={broker.id}
                className="bg-brand-navy-card border border-slate-800 hover:border-slate-750 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-navy-light border border-slate-800 flex items-center justify-center font-bold text-white text-sm">
                        {broker.logo ? (
                          <img
                            src={broker.logo}
                            alt={broker.companyName}
                            className="w-8 h-8 object-contain rounded-xl"
                          />
                        ) : (
                          broker.companyName?.[0] || 'B'
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-brand-blue transition">
                          {broker.companyName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{broker.avgRating?.toFixed(1) || '4.8'}</span>
                          <span className="text-slate-500">
                            ({broker.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(broker.id)}
                      title="Remove from watchlist"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-brand-navy-light/40 border border-slate-800/80 text-[11px] mb-4">
                    <div>
                      <span className="text-slate-500 block">Min Deposit:</span>
                      <span className="font-mono font-bold text-white">
                        ${broker.minDeposit || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Leverage:</span>
                      <span className="font-mono font-bold text-white">
                        {broker.maxLeverage || '1:500'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Spreads From:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {broker.spreadsFrom || '0.0 pips'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Regulation:</span>
                      <span className="font-bold text-slate-300 truncate block">
                        {Array.isArray(broker.regulation)
                          ? broker.regulation.slice(0, 2).join(', ')
                          : broker.regulation || 'Regulated'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition"
                  >
                    View Details
                  </Link>
                  {broker.website && (
                    <a
                      href={broker.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
