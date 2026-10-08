'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { AccountManager } from '../../types';
import { StarRating } from '../common/StarRating';

interface AMCardProps {
  am: AccountManager;
}

export const AMCard: React.FC<AMCardProps> = ({ am }) => {
  return (
    <div className="group rounded-2xl bg-white border border-border hover:border-green/40 transition-all duration-300 hover:-translate-y-1 shadow-soft hover:shadow-lift p-6 flex flex-col justify-between">
      <div>
        {/* Header Photo + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-tint border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {am.photo ? (
              <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold font-mono text-green">
                {am.fullName ? am.fullName[0].toUpperCase() : 'M'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-text-heading group-hover:text-green transition truncate">
                {am.fullName}
              </h3>
              {am.isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green text-[10px] font-bold border border-green-200">
                  TOP AM
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted truncate">{am.tagline || 'PAMM & Portfolio Specialist'}</p>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={am.avgRating} />
              <span className="font-bold text-text-heading ml-1">{am.avgRating.toFixed(1)}</span>
              <span className="text-text-muted">({am.totalReviews})</span>
            </div>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="grid grid-cols-2 gap-2 text-xs text-text-body py-3 border-t border-b border-border mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{am.country || 'Global'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{am.yearsExperience ? `${am.yearsExperience} yrs exp` : 'Verified Exp'}</span>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Key Strategies
          </div>
          <div className="flex flex-wrap gap-1.5">
            {am.expertise && am.expertise.length > 0 ? (
              am.expertise.slice(0, 3).map((exp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-body text-[11px] font-medium border border-border"
                >
                  {exp}
                </span>
              ))
            ) : (
              ['PAMM', 'Hedging', 'Risk Management'].map((exp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-body text-[11px] font-medium border border-border"
                >
                  {exp}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2">
        <Link
          href={`/account-managers/${am.slug}`}
          className="w-full py-2.5 bg-surface-tint hover:bg-green hover:text-white text-text-heading rounded-full text-xs font-bold border border-border hover:border-green transition-all flex items-center justify-center gap-2 shadow-sm group/btn"
        >
          <span>View Track Record</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
