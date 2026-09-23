'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RatingStars from './RatingStars';
import { cn } from '@/lib/utils';

export interface ComparisonItem {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  safetyScore?: number;
  featured?: boolean;
  link: string;
  features: Record<string, string | boolean | number | string[]>;
}

export interface ComparisonFeature {
  key: string;
  label: string;
  category?: string;
}

interface ComparisonTableProps {
  items: ComparisonItem[];
  features: ComparisonFeature[];
  onRemoveItem?: (id: string) => void;
  className?: string;
}

export default function ComparisonTable({
  items,
  features,
  onRemoveItem,
  className,
}: ComparisonTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-text-muted">No items selected for comparison.</p>
      </div>
    );
  }

  const renderValue = (value: string | boolean | number | string[] | undefined) => {
    if (value === true) {
      return (
        <div className="flex justify-center">
          <div className="rounded-full bg-accent-green/10 p-1 text-accent-green">
            <Check className="h-4 w-4" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex justify-center">
          <div className="rounded-full bg-rose-500/10 p-1 text-rose-400">
            <X className="h-4 w-4" />
          </div>
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap justify-center gap-1">
          {value.map((v, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.2">
              {v}
            </Badge>
          ))}
        </div>
      );
    }
    return <span className="font-medium text-text-primary text-xs sm:text-sm">{value || '—'}</span>;
  };

  return (
    <div className={cn('relative overflow-x-auto rounded-xl border border-border bg-card shadow-md', className)}>
      <table className="w-full text-center border-collapse">
        {/* Header with Entity Cards */}
        <thead>
          <tr className="border-b border-border bg-primary/90">
            <th className="sticky left-0 z-20 bg-primary/95 p-4 text-left font-bold text-xs uppercase tracking-wider text-text-muted min-w-[180px] border-r border-border">
              Specifications
            </th>
            {items.map((item) => (
              <th key={item.id} className="p-4 min-w-[220px] max-w-[260px] align-top">
                <div className="flex flex-col items-center gap-2">
                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="self-end text-text-muted hover:text-rose-400 text-xs p-1"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <div className="h-14 w-14 rounded-xl border border-border bg-card flex items-center justify-center p-2 shadow-sm">
                    {item.logo ? (
                      <img src={item.logo} alt={item.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-extrabold text-accent-gold text-lg">
                        {item.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold font-heading text-sm text-text-primary mt-1">
                    {item.name}
                  </h3>

                  <RatingStars rating={item.rating} size="sm" />

                  {item.safetyScore !== undefined && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-accent-green/10 border border-accent-green/30 px-2 py-0.5 text-[11px] font-bold text-accent-green">
                      <ShieldCheck className="h-3 w-3" />
                      Safety: {item.safetyScore}/100
                    </div>
                  )}

                  <Link href={item.link} className="w-full mt-2">
                    <Button variant="gold" size="sm" className="w-full text-xs font-bold gap-1">
                      View Profile
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Feature Comparison Rows */}
        <tbody className="divide-y divide-border">
          {features.map((feature, idx) => (
            <tr
              key={feature.key}
              className={cn(
                'transition-colors hover:bg-secondary/30',
                idx % 2 === 0 ? 'bg-card' : 'bg-primary/40'
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit p-3.5 text-left text-xs font-semibold text-text-muted border-r border-border">
                {feature.label}
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-3.5 text-center">
                  {renderValue(item.features[feature.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
