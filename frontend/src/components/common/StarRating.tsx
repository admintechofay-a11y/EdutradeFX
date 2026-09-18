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
                  ? 'text-amber-400 fill-amber-400'
                  : half
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-gray-600'
              }`}
            />
          );
        })}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-gray-300 ml-1">
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-gray-500 font-normal ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};
