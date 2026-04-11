import { RiArrowDownSLine } from '@remixicon/react';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
}

const sizes = {
  sm: 'text-[15px]',
  md: 'text-[17px]',
  lg: 'text-2xl',
};

export function PriceDisplay({
  price,
  originalPrice,
  size = 'sm',
  muted = false,
}: PriceDisplayProps) {
  const drop =
    originalPrice && price < originalPrice ? originalPrice - price : 0;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`font-semibold ${sizes[size]} ${muted ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'}`}
      >
        ${Number(price).toLocaleString()}
      </span>
      {drop > 0 && (
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
          <RiArrowDownSLine size={11} />${Number(drop).toLocaleString()}
        </span>
      )}
    </div>
  );
}
