'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Scale, ArrowRight } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';

export default function CompareDrawer() {
  const pathname = usePathname();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (pathname?.startsWith('/admin') || compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-card/95 backdrop-blur-md border-t border-amber-500/30 py-3 px-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left info & items */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs shrink-0">
            <Scale className="w-4 h-4" />
            <span>Comparing ({compareList.length}/4):</span>
          </div>

          <div className="flex items-center gap-2">
            {compareList.map((broker) => (
              <div
                key={broker.slug}
                className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs shrink-0"
              >
                <img
                  src={broker.logo}
                  alt={broker.name}
                  className="w-5 h-5 rounded object-contain bg-white/10"
                />
                <span className="text-white font-medium">{broker.name}</span>
                <button
                  onClick={() => removeFromCompare(broker.slug)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label={`Remove ${broker.name} from comparison`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
          <Link
            href="/compare"
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-darkest transition-all flex items-center gap-1.5 shadow-glow-gold"
          >
            Start Comparing
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
