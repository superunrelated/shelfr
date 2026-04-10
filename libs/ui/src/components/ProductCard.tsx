import { RiCheckLine, RiArchiveLine, RiImageLine } from '@remixicon/react';
import { Badge } from './Badge';
import { StarRating } from './StarRating';
import { PriceDisplay } from './PriceDisplay';
import type { ProductStatus } from '@shelfr/shared';

interface ProductCardProps {
  title: string;
  shopName: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string | null;
  status: ProductStatus;
  rating: number;
  archived?: boolean;
  selected?: boolean;
  size?: 'big' | 'medium';
  compareMode?: boolean;
  compareSelected?: boolean;
  onClick?: () => void;
  onArchive?: () => void;
  onRate?: (rating: number) => void;
}

export function ProductCard({
  title, shopName, price, originalPrice, imageUrl, status, rating,
  archived = false, selected = false, size = 'medium',
  compareMode = false, compareSelected = false,
  onClick, onArchive, onRate,
}: ProductCardProps) {
  const isWinner = status === 'winner' && !archived;
  const isBig = size === 'big';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 group shadow-sm hover:shadow-md
        ${archived ? 'opacity-50' : ''}
        ${selected ? 'ring-2 ring-[#1c1e2a] shadow-lg' : isWinner ? 'ring-1 ring-amber-300/60' : ''}
        ${compareMode && compareSelected ? 'ring-2 ring-[#1c1e2a] shadow-lg' : ''}`}
    >
      {compareMode && (
        <div className={`absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center z-10 ${compareSelected ? 'bg-[#1c1e2a] text-white' : 'bg-white/90 border border-neutral-300 text-transparent'}`}>
          <RiCheckLine size={12} />
        </div>
      )}
      {!compareMode && onArchive && (
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          title={archived ? 'Unarchive' : 'Archive'}
          className={`absolute top-3 right-3 z-10 p-1 rounded bg-white/80 backdrop-blur-sm transition-all ${archived ? 'text-amber-500 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-600'}`}
        >
          <RiArchiveLine size={14} />
        </button>
      )}
      <div className={`w-full bg-neutral-100 relative overflow-hidden ${isBig ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiImageLine size={isBig ? 48 : 36} className="text-neutral-300" />
          </div>
        )}
        {!compareMode && onRate && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
            <StarRating rating={rating} size={12} onRate={onRate} />
          </div>
        )}
      </div>
      <div className={isBig ? 'p-5' : 'p-4'}>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{shopName}</p>
        <p className={`font-medium leading-snug mb-2.5 line-clamp-2 font-serif ${archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'} ${isBig ? 'text-[15px]' : 'text-[13px]'}`}>
          {title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <PriceDisplay price={price} originalPrice={originalPrice} size={isBig ? 'md' : 'sm'} muted={archived} />
          {status !== 'considering' && <Badge status={status} />}
        </div>
      </div>
    </div>
  );
}
