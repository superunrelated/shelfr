import { RiImageLine } from '@remixicon/react';

interface CollectionCardProps {
  name: string;
  color: string;
  imageUrl?: string | null;
  onClick?: () => void;
}

export function CollectionCard({
  name,
  color,
  imageUrl,
  onClick,
}: CollectionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded shadow-sm border border-neutral-200/80 overflow-hidden text-left hover:shadow-md hover:-translate-y-0.5 transition-all group w-full"
    >
      <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiImageLine size={32} className="text-neutral-200" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          <p className="text-[14px] font-semibold text-[#1c1e2a] font-serif truncate">
            {name}
          </p>
        </div>
      </div>
    </button>
  );
}
