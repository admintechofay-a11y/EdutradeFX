'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';

export default function ProviderReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.get('/service-providers/me'), api.get('/service-providers/me/reviews')])
      .then(([pRes, rRes]) => {
        if (pRes.data?.success) setProvider(pRes.data.data);
        if (rRes.data?.success) setReviews(rRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  const reviewCount = reviews.length;
  const avgRating = provider?.avgRating ? Number(provider.avgRating).toFixed(1) : 'N/A';

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Reviews & Reputation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified institutional reviews and client feedback moderated by EdutradeFX.
          </p>
        </div>

        {/* Rating Rule Notice */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Reputation Policy:</span>
            <p className="text-amber-800 mt-0.5">
              To prevent astroturfing and protect traders, average star ratings are only displayed publicly
              once a solutions provider receives at least 3 approved, verified client reviews.
            </p>
          </div>
        </div>

        {/* Stat Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400 font-semibold uppercase">Overall Rating</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{avgRating}</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Based on {reviewCount} client reviews</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No Reviews Received Yet</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Institutional clients who have contracted your tools can leave feedback directly on your public profile.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {rev.authorName || 'Verified Institutional User'}
                    </span>
                    <span className="text-xs text-slate-400">({rev.authorRole || 'Client'})</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{rev.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{rev.reviewText}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
