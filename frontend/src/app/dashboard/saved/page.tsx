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
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-blue" />
            Saved Brokers & Watchlist
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Compare and monitor your bookmarked brokerages, regulatory status, and spreads.
          </p>
        </div>
        <Link
          href="/brokers"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <Building2 className="w-4 h-4" />
          <span>Explore All Brokers</span>
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : savedBrokers.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-soft">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h2 className="text-sm font-bold text-navy">Your Watchlist is Empty</h2>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto mb-6">
            Bookmark top-tier forex brokers from our regulated directory to compare spreads, commissions, and execution speeds side by side.
          </p>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
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
                className="bg-white border border-border hover:border-blue/30 rounded-3xl p-5 shadow-soft hover:shadow-card flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-surface-tint border border-border flex items-center justify-center font-bold text-navy text-sm">
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
                        <h3 className="text-sm font-bold text-text-heading group-hover:text-blue transition">
                          {broker.companyName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-orange font-semibold mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-orange" />
                          <span>{broker.avgRating?.toFixed(1) || '4.8'}</span>
                          <span className="text-text-muted">
                            ({broker.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(broker.id)}
                      title="Remove from watchlist"
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-surface-tint/60 border border-border text-[11px] mb-4">
                    <div>
                      <span className="text-text-muted block">Min Deposit:</span>
                      <span className="font-mono font-bold text-text-heading">
                        ${broker.minDeposit || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Max Leverage:</span>
                      <span className="font-mono font-bold text-text-heading">
                        {broker.maxLeverage || '1:500'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Spreads From:</span>
                      <span className="font-mono font-bold text-green">
                        {broker.spreadsFrom || '0.0 pips'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Regulation:</span>
                      <span className="font-bold text-text-body truncate block">
                        {Array.isArray(broker.regulation)
                          ? broker.regulation.slice(0, 2).join(', ')
                          : broker.regulation || 'Regulated'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="flex-1 py-2 px-3 rounded-full bg-surface-tint hover:bg-border/60 text-navy text-xs font-semibold text-center transition"
                  >
                    View Details
                  </Link>
                  {broker.website && (
                    <a
                      href={broker.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue/10 hover:bg-blue/20 text-blue transition"
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
