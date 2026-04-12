import {
  RiCheckLine,
  RiArrowDownSLine,
  RiImageLine,
  RiArchiveLine,
} from '@remixicon/react';
import { Badge, StarRating } from '@shelfr/ui';
import type { Product, ProductStatus } from '@shelfr/shared';
import type { ViewMode } from '../utils/productSort';

interface ProductGridCardProps {
  product: Product;
  viewMode: ViewMode;
  selected: boolean;
  compareMode: boolean;
  compareSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onRate: (rating: number) => void;
  onToggleArchive: () => void;
}

export function ProductGridCard({
  product: p,
  viewMode,
  selected,
  compareMode,
  compareSelected,
  onClick,
  onSelect,
  onRate,
  onToggleArchive,
}: ProductGridCardProps) {
  const isCompact = viewMode === 'compact';
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`bg-white rounded overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 group shadow-sm hover:shadow-md
      ${p.archived ? 'opacity-50' : ''}
      ${selected && 'ring-2 ring-[#1c1e2a] shadow-lg'}
      ${!selected && p.status === 'winner' && !p.archived && 'ring-1 ring-amber-300/60'}
      ${compareMode && compareSelected ? 'ring-2 ring-[#1c1e2a] shadow-lg' : ''}`}
    >
      {compareMode && (
        <div
          className={`absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center z-10 ${compareSelected ? 'bg-[#1c1e2a] text-white' : 'bg-white/90 border border-neutral-300 text-transparent'}`}
        >
          <RiCheckLine size={10} />
        </div>
      )}
      {!compareMode && !isCompact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive();
          }}
          title={p.archived ? 'Unarchive' : 'Archive'}
          className={`absolute top-3 right-3 z-10 p-1 rounded bg-white/80 backdrop-blur-sm transition-all ${p.archived ? 'text-amber-500 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-600'}`}
        >
          <RiArchiveLine size={14} />
        </button>
      )}
      <div
        className={`w-full bg-neutral-100 relative overflow-hidden ${isCompact ? 'aspect-square' : 'aspect-[4/3]'}`}
      >
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiImageLine
              size={isCompact ? 20 : 48}
              className="text-neutral-300"
            />
          </div>
        )}
        {!compareMode && !isCompact && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
            <StarRating rating={p.rating} size={12} onRate={onRate} />
          </div>
        )}
        {isCompact && p.status !== 'considering' && (
          <div className="absolute bottom-1 right-1 z-10">
            <Badge status={p.status as ProductStatus} />
          </div>
        )}
      </div>
      <div className={isCompact ? 'p-2' : 'p-5'}>
        {!isCompact && (
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
            {p.shop_name}
          </p>
        )}
        <p
          className={`font-medium leading-snug font-serif ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[11px] line-clamp-1 mb-1' : 'text-[15px] line-clamp-2 mb-2.5'}`}
        >
          {p.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-semibold ${p.archived ? 'text-neutral-400' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[12px]' : 'text-[17px]'}`}
          >
            ${Number(p.price).toLocaleString()}
          </span>
          {!isCompact && p.price < p.original_price && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
              <RiArrowDownSLine size={11} />$
              {Number(p.original_price - p.price).toLocaleString()}
            </span>
          )}
          {!isCompact && p.status !== 'considering' && (
            <Badge status={p.status as ProductStatus} />
          )}
        </div>
      </div>
    </div>
  );
}
