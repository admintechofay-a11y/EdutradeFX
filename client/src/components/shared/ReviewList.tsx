'use client';

import React, { useState } from 'react';
import { ThumbsUp, ShieldCheck, User as UserIcon, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import RatingStars from './RatingStars';
import { cn } from '@/lib/utils';

export interface ReviewItem {
  id: string;
  userName: string;
  userRole?: string;
  isVerifiedTrader?: boolean;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount?: number;
}

interface ReviewListProps {
  reviews: ReviewItem[];
  averageRating?: number;
  totalReviews?: number;
  className?: string;
}

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  className,
}: ReviewListProps) {
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  const toggleHelpful = (reviewId: string) => {
    setHelpfulLiked((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  if (reviews.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-10 text-center',
          className
        )}
      >
        <div className="rounded-full bg-secondary p-3 text-text-muted">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold font-heading text-text-primary">
          No Reviews Yet
        </h4>
        <p className="text-xs text-text-muted max-w-sm">
          Be the first trader to share your verified review and trading experience.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header Summary */}
      {averageRating !== undefined && totalReviews !== undefined && (
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold font-heading text-text-primary">
              {averageRating.toFixed(1)}
            </span>
            <RatingStars rating={averageRating} size="md" />
            <span className="text-xs text-text-muted">
              ({totalReviews.toLocaleString()} verified {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      )}

      {/* Review Items */}
      <div className="flex flex-col gap-3">
        {reviews.map((rev) => {
          const isLiked = helpfulLiked[rev.id] || false;
          const helpful = (rev.helpfulCount || 0) + (isLiked ? 1 : 0);

          return (
            <div
              key={rev.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-border/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-secondary text-accent-gold font-bold text-xs">
                      {rev.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">
                        {rev.userName}
                      </span>
                      {rev.isVerifiedTrader && (
                        <Badge
                          variant="green"
                          className="text-[10px] px-1.5 py-0.2 gap-1 font-semibold"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Verified Trader
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <RatingStars rating={rev.rating} size="sm" showNumber={false} />
              </div>

              <p className="text-sm text-text-primary/90 leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => toggleHelpful(rev.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-md',
                    isLiked
                      ? 'text-accent-green bg-accent-green/10'
                      : 'text-text-muted hover:text-text-primary hover:bg-secondary'
                  )}
                  aria-label="Mark review as helpful"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({helpful})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
