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
    <div className={`flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 ${
      broker.isFeatured
        ? 'bg-slate-900/90 border-blue-500/40 shadow-glow'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
    }`}>
      <div>
        {/* Top Header: Logo + Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {broker.logo ? (
                <img src={broker.logo} alt={broker.companyName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm font-bold text-blue-400">{broker.companyName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <Link href={`/brokers/${broker.slug}`} className="hover:text-blue-400 transition-colors">
                <h3 className="font-bold text-base text-gray-100 line-clamp-1">{broker.companyName}</h3>
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
        <div className="flex flex-wrap gap-1 mb-4">
          {broker.regulation.slice(0, 3).map((reg) => (
            <span key={reg} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-gray-300 border border-slate-700/60">
              {reg}
            </span>
          ))}
          {broker.regulation.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] text-gray-400">
              +{broker.regulation.length - 3}
            </span>
          )}
        </div>

        {/* Trading Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-4 text-center">
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Min Deposit</span>
            <span className="text-xs font-bold font-mono text-gray-100">
              {broker.minDeposit === 0 ? '₹0' : `$${broker.minDeposit || 0}`}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Max Leverage</span>
            <span className="text-xs font-bold font-mono text-blue-400">
              {broker.maxLeverage || '1:500'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Spreads From</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {broker.spreadsFrom || '0.0 pips'}
            </span>
          </div>
        </div>

        {/* Platforms Supported */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-500">Platforms:</span>
          {broker.tradingPlatforms.slice(0, 3).map((p) => (
            <span key={p} className="text-gray-300 font-medium">{p}</span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => toggleBroker(broker.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
            compared
              ? 'bg-blue-900/60 border-blue-500 text-blue-300'
              : 'bg-slate-800/80 border-slate-700 text-gray-300 hover:bg-slate-700'
          }`}
        >
          {compared ? <Check size={14} /> : <Plus size={14} />}
          {compared ? 'Comparing' : 'Compare'}
        </button>

        <Link
          href={`/brokers/${broker.slug}`}
          className="flex items-center justify-center gap-1 px-4 py-2 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
