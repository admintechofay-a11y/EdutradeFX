'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingStarsProps {
  rating: number;
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  reviewsCount?: number;
  showDetails?: boolean;
  layout?: 'row' | 'stacked';
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function RatingStars({
  rating,
  totalStars = 5,
  size = 'md',
  showNumber = true,
  interactive = false,
  reviewsCount,
  showDetails,
  layout = 'stacked',
  onRatingChange,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  // Star sizing: static display is 16px (or 14px for sm), interactive form enlarges to 24px on hover
  const getStarSizeClass = () => {
    if (interactive) {
      return 'w-[20px] h-[20px] hover:w-[24px] hover:h-[24px]';
    }
    if (size === 'sm') return 'w-[14px] h-[14px]';
    if (size === 'lg') return 'w-[20px] h-[20px]';
    return 'w-[16px] h-[16px]'; // Static (display): 16px
  };

  const starSizeClass = getStarSizeClass();
  const shouldShowDetails = showDetails !== undefined ? showDetails : showNumber;

  return (
    <div
      className={cn(
        'inline-flex',
        layout === 'stacked' ? 'flex-col items-start gap-1' : 'flex-row items-center gap-2',
        className
      )}
    >
      {/* Stars Container: 5 stars, --color-star for filled, #E2E8F0 for empty */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalStars }, (_, index) => {
          const starIndex = index + 1;
          const isFull = activeRating >= starIndex;
          const isHalf = !isFull && activeRating >= starIndex - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                'relative transition-all duration-150 focus:outline-none select-none',
                interactive
                  ? 'cursor-pointer hover:scale-125 p-0.5'
                  : 'cursor-default pointer-events-none'
              )}
              aria-label={`Rate ${starIndex} stars`}
            >
              {/* Background Empty Star (#E2E8F0) */}
              <Star
                className={cn(
                  'text-[#E2E8F0] fill-[#E2E8F0] transition-all',
                  starSizeClass
                )}
              />

              {/* Full Star Overlay (--color-star: #F59E0B) */}
              {isFull && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Star
                    className={cn(
                      'text-[#F59E0B] fill-[#F59E0B]',
                      starSizeClass
                    )}
                  />
                </div>
              )}

              {/* Half Star Overlay using clip-path */}
              {isHalf && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                >
                  <Star
                    className={cn(
                      'text-[#F59E0B] fill-[#F59E0B]',
                      starSizeClass
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Details: "X.X / 5 · NNN reviews" Inter 13px --color-text-secondary */}
      {shouldShowDetails && (
        <span className="font-sans text-[13px] text-text-secondary leading-none">
          {rating.toFixed(1)} / 5
          {reviewsCount !== undefined && ` · ${reviewsCount.toLocaleString()} reviews`}
        </span>
      )}
    </div>
  );
}
