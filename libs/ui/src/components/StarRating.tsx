import { useState } from 'react';
import { RiStarFill, RiStarSLine } from '@remixicon/react';

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

export function StarRating({
  rating = 0,
  onRate,
  size = 14,
  interactive = true,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="inline-flex items-center gap-px"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} out of 5${star === rating ? ' (current)' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (interactive && onRate) onRate(star === rating ? 0 : star);
            }}
            onMouseEnter={() => interactive && setHover(star)}
            className={`transition-colors duration-100 ${
              interactive ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            {filled ? (
              <RiStarFill size={size} className="text-amber-400" />
            ) : (
              <RiStarSLine
                size={size}
                className={
                  interactive && hover ? 'text-amber-300' : 'text-neutral-300'
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
