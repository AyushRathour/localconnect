import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<Props> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <div className="flex items-center text-[#F4B942]">
        {stars.map((s) => {
          const filled = rating >= s;
          const half = !filled && rating >= s - 0.5;
          return (
            <Star
              key={s}
              className={`${iconSize} ${
                filled
                  ? 'fill-current text-[#F4B942]'
                  : half
                  ? 'fill-[#F4B942]/50 text-[#F4B942]'
                  : 'text-slate-300'
              }`}
            />
          );
        })}
      </div>
      <span className={`font-semibold tabular-nums text-slate-800 ${textSize}`}>
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={`text-slate-500 tabular-nums ${textSize}`}>
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
