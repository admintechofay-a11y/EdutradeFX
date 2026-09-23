'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { adApi } from '../../lib/api';

interface AdBannerProps {
  placement?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement = 'SIDEBAR', className = '' }) => {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAd() {
      try {
        const res = await adApi.getActiveAds(placement);
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          // Select an active ad from the pool
          setAd(res.data.data[0]);
        }
      } catch (err) {
        // Silently fail if ad service is unavailable
      } finally {
        setLoading(false);
      }
    }
    loadAd();
  }, [placement]);

  const handleClick = () => {
    if (!ad) return;
    try {
      // Fire click tracking
      adApi.trackClick(ad.id);
    } catch (e) {
      console.error('Failed to log ad click telemetry', e);
    }

    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading || !ad) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy-light/80 to-brand-navy-card border border-brand-blue/30 p-5 cursor-pointer shadow-xl hover:shadow-brand-blue/10 hover:border-brand-blue/60 transition ${className}`}
    >
      <div className="absolute top-2 right-3 flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
        <Sparkles className="w-2.5 h-2.5 text-brand-amber" />
        <span>Sponsored</span>
      </div>

      <div className="flex items-center gap-4">
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title || 'Sponsored Partner'}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-750 shrink-0 group-hover:scale-105 transition"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white group-hover:text-brand-blue transition truncate">
            {ad.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
            {ad.description || 'Verified partner with prime trading conditions.'}
          </p>
        </div>
        <div className="shrink-0 p-2 rounded-xl bg-brand-blue/10 group-hover:bg-brand-blue text-brand-blue group-hover:text-white transition">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
