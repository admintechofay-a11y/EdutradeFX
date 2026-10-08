'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Award, Check, Plus, ExternalLink } from 'lucide-react';
import { Broker } from '../../types';
import { StarRating } from '../common/StarRating';
import { Badge } from '../common/Badge';
import { useCompareStore } from '../../store/compareStore';

interface BrokerCardProps {
  broker: Broker;
}

export const BrokerCard: React.FC<BrokerCardProps> = ({ broker }) => {
  const { toggleBroker, isSelected } = useCompareStore();
  const compared = isSelected(broker.id);

  return (
    <div
      className={`group flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 bg-white shadow-soft hover:shadow-lift hover:-translate-y-1 ${
        broker.isFeatured
          ? 'border-blue/40 ring-1 ring-blue/20'
          : 'border-border hover:border-blue/30'
      }`}
    >
      <div>
        {/* Top Header: Logo + Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-tint border border-border p-1.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {broker.logo ? (
                <img src={broker.logo} alt={broker.companyName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm font-bold text-blue font-mono">{broker.companyName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <Link href={`/brokers/${broker.slug}`} className="hover:text-blue transition-colors">
                <h3 className="font-bold text-base text-text-heading line-clamp-1">{broker.companyName}</h3>
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating rating={broker.avgRating} totalReviews={broker.totalReviews} size={13} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {broker.isFeatured && (
              <Badge variant="gold">
                <Award size={11} /> Featured
              </Badge>
            )}
            {broker.isPremium && (
              <Badge variant="primary">
                <Shield size={11} /> Tier-1
              </Badge>
            )}
          </div>
        </div>

        {/* Regulations Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {broker.regulation.slice(0, 3).map((reg) => (
            <span
              key={reg}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface-tint text-text-body border border-border"
            >
              {reg}
            </span>
          ))}
          {broker.regulation.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] text-text-muted font-medium">
              +{broker.regulation.length - 3}
            </span>
          )}
        </div>

        {/* Trading Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-surface-tint border border-border mb-4 text-center">
          <div>
            <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">Min Deposit</span>
            <span className="text-xs font-bold font-mono text-text-heading">
              {broker.minDeposit === 0 ? '₹0' : `$${broker.minDeposit || 0}`}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">Max Leverage</span>
            <span className="text-xs font-bold font-mono text-blue">
              {broker.maxLeverage || '1:500'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">Spreads From</span>
            <span className="text-xs font-bold font-mono text-green">
              {broker.spreadsFrom || '0.0 pips'}
            </span>
          </div>
        </div>

        {/* Platforms Supported */}
        <div className="text-xs text-text-muted mb-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-text-muted font-medium">Platforms:</span>
          {broker.tradingPlatforms.slice(0, 3).map((p) => (
            <span key={p} className="text-text-body font-semibold">{p}</span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          onClick={() => toggleBroker(broker.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold border transition-all ${
            compared
              ? 'bg-blue-50 border-blue text-blue'
              : 'bg-white border-border text-text-body hover:bg-surface-tint hover:border-blue/30'
          }`}
        >
          {compared ? <Check size={14} /> : <Plus size={14} />}
          {compared ? 'Comparing' : 'Compare'}
        </button>

        <Link
          href={`/brokers/${broker.slug}`}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-orange hover:bg-orange-hover text-white shadow-soft hover:shadow-lift transition-all"
        >
          <span>View Profile</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
