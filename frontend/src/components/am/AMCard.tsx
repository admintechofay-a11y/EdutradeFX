'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, Star, MapPin, Briefcase, Languages, ArrowRight } from 'lucide-react';
import { AccountManager } from '../../types';
import { StarRating } from '../common/StarRating';

interface AMCardProps {
  am: AccountManager;
}

export const AMCard: React.FC<AMCardProps> = ({ am }) => {
  return (
    <div className="group rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg p-6 flex flex-col justify-between">
      <div>
        {/* Header Photo + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-navy-light border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {am.photo ? (
              <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold text-brand-blue">
                {am.fullName ? am.fullName[0].toUpperCase() : 'M'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-white group-hover:text-brand-blue transition truncate">
                {am.fullName}
              </h3>
              {am.isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber text-[10px] font-bold border border-brand-amber/30">
                  TOP AM
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{am.tagline || 'PAMM & Portfolio Specialist'}</p>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={am.avgRating} />
              <span className="font-bold text-white ml-1">{am.avgRating.toFixed(1)}</span>
              <span className="text-slate-400">({am.totalReviews})</span>
            </div>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-3 border-t border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{am.country || 'Global'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{am.yearsExperience ? `${am.yearsExperience} yrs exp` : 'Verified Exp'}</span>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Key Strategies
          </div>
          <div className="flex flex-wrap gap-1.5">
            {am.expertise && am.expertise.length > 0 ? (
              am.expertise.slice(0, 3).map((exp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-brand-navy-light text-slate-300 text-[11px] border border-slate-700/80"
                >
                  {exp}
                </span>
              ))
            ) : (
              ['PAMM', 'Hedging', 'Risk Management'].map((exp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-brand-navy-light text-slate-300 text-[11px] border border-slate-700/80"
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
          className="w-full py-2.5 bg-brand-navy-light hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 group-hover:border-slate-500"
        >
          <span>View Track Record</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
