'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, TrendingUp, ArrowDownRight, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RatingStars from '@/components/shared/RatingStars';
import { cn } from '@/lib/utils';

export interface ProviderCardProps {
  provider: {
    _id: string;
    name: string;
    avatar?: string;
    strategy: string;
    markets?: string[];
    subscriptionPrice: number;
    winRate: number;
    monthlyRoi?: number;
    maxDrawdown?: number;
    description?: string;
    verified?: boolean;
    featured?: boolean;
    rating?: number;
    totalReviews?: number;
  };
  className?: string;
}

export default function ProviderCard({ provider, className }: ProviderCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-accent-gold/40 hover:shadow-lg',
        provider.featured && 'border-accent-gold/40 shadow-glow-gold',
        className
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 pb-3">
          <Badge variant="gold" className="text-[10px] gap-1 font-bold">
            <Radio className="h-3 w-3" />
            Signal Provider
          </Badge>

          <span className="text-xs font-bold text-accent-green">
            ${provider.subscriptionPrice}/mo
          </span>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl border border-border bg-secondary flex items-center justify-center font-bold text-accent-gold text-base overflow-hidden">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                provider.name.substring(0, 2).toUpperCase()
              )}
            </div>
            {provider.verified && (
              <div
                className="absolute -bottom-1 -right-1 bg-accent-green text-primary rounded-full p-0.5"
                title="Verified Signal Provider"
              >
                <ShieldCheck className="h-3 w-3" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="font-bold font-heading text-sm text-text-primary truncate">
              {provider.name}
            </h3>
            <p className="text-xs text-text-muted truncate">{provider.strategy}</p>
          </div>
        </div>

        {/* Markets Tags */}
        {provider.markets && provider.markets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-3">
            {provider.markets.slice(0, 4).map((m, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] px-2 py-0.2 font-mono bg-primary/40 border-border"
              >
                {m}
              </Badge>
            ))}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-center">
          <div className="bg-primary/50 rounded-lg p-2 border border-border/50">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Win Rate
            </span>
            <span className="text-xs font-extrabold text-accent-green mt-0.5 block">
              {provider.winRate}%
            </span>
          </div>

          <div className="bg-primary/50 rounded-lg p-2 border border-border/50">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Monthly ROI
            </span>
            <span className="text-xs font-extrabold text-accent-gold mt-0.5 block">
              +{provider.monthlyRoi || 12.4}%
            </span>
          </div>

          <div className="bg-primary/50 rounded-lg p-2 border border-border/50">
            <span className="text-[10px] uppercase font-bold text-text-muted block">
              Max DD
            </span>
            <span className="text-xs font-extrabold text-slate-300 mt-0.5 block">
              {provider.maxDrawdown || 8.2}%
            </span>
          </div>
        </div>

        {provider.rating !== undefined && (
          <div className="pt-3">
            <RatingStars
              rating={provider.rating}
              size="sm"
              reviewsCount={provider.totalReviews}
            />
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-4 mt-2">
        <Link href={`/signal-providers/${provider._id}`} className="w-full block">
          <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1.5">
            View Live Signals
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
