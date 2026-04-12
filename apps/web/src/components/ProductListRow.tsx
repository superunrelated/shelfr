import { RiCheckLine, RiImageLine, RiArchiveLine } from '@remixicon/react';
import { Badge, StarRating } from '@shelfr/ui';
import type { Product, ProductStatus } from '@shelfr/shared';
import type { SortKey } from '../utils/productSort';

interface ProductListRowProps {
  product: Product;
  sortBy: SortKey;
  selected: boolean;
  compareMode: boolean;
  compareSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onRate: (rating: number) => void;
  onToggleArchive: () => void;
}

export function ProductListRow({
  product: p,
  sortBy,
  selected,
  compareMode,
  compareSelected,
  onClick,
  onSelect,
  onRate,
  onToggleArchive,
}: ProductListRowProps) {
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`bg-white rounded overflow-hidden cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md transition-all
      ${p.archived ? 'opacity-50' : ''}
      ${selected ? 'ring-2 ring-[#1c1e2a]' : p.status === 'winner' && !p.archived ? 'ring-1 ring-amber-300/60' : ''}
      ${compareMode && compareSelected ? 'ring-2 ring-[#1c1e2a]' : ''}`}
    >
      {compareMode && (
        <div
          className={`ml-4 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${compareSelected ? 'bg-[#1c1e2a] text-white' : 'border border-neutral-300 text-transparent'}`}
        >
          <RiCheckLine size={12} />
        </div>
      )}
      <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiImageLine size={20} className="text-neutral-300" />
          </div>
        )}
      </div>
      <div className="flex-1 py-3 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-medium text-[#1c1e2a] truncate font-serif">
            {p.title}
          </p>
          {sortBy !== 'status' && (
            <Badge status={p.status as ProductStatus} showLabel />
          )}
        </div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
          {p.shop_name}
        </p>
      </div>
      <div className="w-24 flex-shrink-0 flex justify-center">
        <StarRating rating={p.rating} size={12} onRate={onRate} />
      </div>
      <div className="w-12 flex-shrink-0 text-center">
        <span className="text-xs text-neutral-400">
          &times;{p.quantity || 1}
        </span>
      </div>
      <div className="w-24 flex-shrink-0 text-right">
        <span
          className={`text-[15px] font-semibold ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'}`}
        >
          ${Number(p.price).toLocaleString()}
        </span>
        {(p.quantity || 1) > 1 && (
          <p className="text-[10px] text-neutral-400">
            ${(Number(p.price) * (p.quantity || 1)).toLocaleString()}
          </p>
        )}
      </div>
      <div className="w-10 flex-shrink-0 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive();
          }}
          title={p.archived ? 'Unarchive' : 'Archive'}
          className={`p-1 rounded hover:bg-neutral-100 transition-colors ${p.archived ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'}`}
        >
          <RiArchiveLine size={14} />
        </button>
      </div>
    </div>
  );
}
