'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showText?: boolean;
  totalReviews?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  showText = true,
  totalReviews,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              size={size}
              className={`${
                filled
                  ? 'text-orange fill-orange'
                  : half
                  ? 'text-orange fill-orange/40'
                  : 'text-slate-300'
              }`}
            />
          );
        })}
      </div>
      {showText && (
        <span className="text-xs font-bold text-text-heading ml-1">
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-text-muted font-normal ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};
