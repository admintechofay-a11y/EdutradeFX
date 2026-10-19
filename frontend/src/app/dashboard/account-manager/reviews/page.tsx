'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/common/Skeleton';

export default function AccountManagerReviewsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const res = await api.get('/account-managers/my/profile');
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const reviews = profile?.reviews || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-text-heading">Reviews & Reputation</h1>
        <p className="text-xs text-text-muted mt-1">
          Monitor your investor reviews and client feedback on EdutradeFX.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="text-xs font-semibold text-text-muted">Average Rating</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-black text-text-heading">
              {profile?.avgRating ? profile.avgRating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center text-orange">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(profile?.avgRating || 5) ? 'fill-orange' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="text-xs font-semibold text-text-muted">Total Reviews</div>
          <div className="text-3xl font-black text-text-heading mt-2">
            {profile?.totalReviews || reviews.length || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="text-xs font-semibold text-text-muted">Review Moderation</div>
          <div className="text-xs text-text-muted mt-2 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-green" /> All published reviews are verified by EdutradeFX.
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-border shadow-soft">
          <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-heading mb-1">No Reviews Yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Reviews from verified investors who have engaged with your management services will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev: any) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-white border border-border shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-tint border border-blue-100 flex items-center justify-center font-bold text-xs text-blue">
                    {rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-heading">
                      {rev.user?.name || 'Verified Investor'}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-orange gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(rev.rating || 5) ? 'fill-orange' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-heading leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
