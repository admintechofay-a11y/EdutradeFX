'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RatingStars from './RatingStars';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  targetType: 'broker' | 'accountManager' | 'signalProvider';
  targetId: string;
  targetName: string;
  onSubmitReview?: (reviewData: { rating: number; comment: string }) => Promise<void>;
  className?: string;
}

export default function ReviewForm({
  targetType,
  targetId,
  targetName,
  onSubmitReview,
  className,
}: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 sm:p-8 text-center',
          className
        )}
      >
        <div className="rounded-full bg-secondary p-3 text-accent-gold border border-border">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold font-heading text-text-primary">
          Sign In to Leave a Review
        </h3>
        <p className="text-xs text-text-muted max-w-sm">
          To ensure verified and honest reviews, you must be signed in to submit feedback for {targetName}.
        </p>
        <Link href={`/login?redirect=review`} className="mt-2">
          <Button variant="gold" size="sm" className="font-bold">
            Sign In to Review
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 10) {
      setError('Enter a review with at least 10 characters');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (onSubmitReview) {
        await onSubmitReview({ rating, comment });
      }
      setSuccess(true);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold font-heading text-text-primary">
            Write a Review for {targetName}
          </h3>
          <p className="text-xs text-text-muted">
            Share your authentic trading experience with the community
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">Your Rating:</span>
          <RatingStars
            rating={rating}
            size="md"
            interactive={true}
            onRatingChange={(newRating) => setRating(newRating)}
          />
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-accent-green/10 border border-accent-green/30 p-3 text-xs font-semibold text-accent-green">
          <CheckCircle2 className="h-4 w-4" />
          <span>Thank you. Your review has been submitted successfully.</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Your Feedback / Experience
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={`Describe execution speed, withdrawal reliability, spreads, customer service, or trading results with ${targetName}...`}
          className="w-full rounded-lg border border-border bg-primary/80 p-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-gold focus:outline-none transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="gold"
          disabled={submitting}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Post Review'}
        </Button>
      </div>
    </form>
  );
}
