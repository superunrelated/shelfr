import { RiCheckLine, RiArchiveLine, RiImageLine } from '@remixicon/react';
import { Badge } from './Badge';
import { StarRating } from './StarRating';
import type { ProductStatus } from '@shelfr/shared';

interface ProductListRowProps {
  title: string;
  shopName: string;
  price: number;
  imageUrl?: string | null;
  status: ProductStatus;
  rating: number;
  archived?: boolean;
  selected?: boolean;
  compareMode?: boolean;
  compareSelected?: boolean;
  onClick?: () => void;
  onArchive?: () => void;
  onRate?: (rating: number) => void;
}

export function ProductListRow({
  title,
  shopName,
  price,
  imageUrl,
  status,
  rating,
  archived = false,
  selected = false,
  compareMode = false,
  compareSelected = false,
  onClick,
  onArchive,
  onRate,
}: ProductListRowProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded overflow-hidden cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md transition-all
        ${archived ? 'opacity-50' : ''}
        ${selected ? 'ring-2 ring-[#1c1e2a]' : status === 'winner' && !archived ? 'ring-1 ring-amber-300/60' : ''}
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
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
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
            {title}
          </p>
          <Badge status={status} showLabel />
        </div>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
          {shopName}
        </p>
      </div>
      <div className="w-24 flex-shrink-0 flex justify-center">
        {onRate ? (
          <StarRating rating={rating} size={12} onRate={onRate} />
        ) : (
          <StarRating rating={rating} size={12} interactive={false} />
        )}
      </div>
      <div className="w-24 flex-shrink-0 text-right">
        <span
          className={`text-[15px] font-semibold ${archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'}`}
        >
          ${Number(price).toLocaleString()}
        </span>
      </div>
      <div className="w-10 flex-shrink-0 flex justify-center">
        {onArchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            title={archived ? 'Unarchive' : 'Archive'}
            className={`p-1 rounded hover:bg-neutral-100 transition-colors ${archived ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'}`}
          >
            <RiArchiveLine size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
