import type { Product } from '@shelfr/shared';

interface TotalRowProps {
  items: Product[];
  label: string;
}

export function TotalRow({ items, label }: TotalRowProps) {
  return (
    <div className="flex items-center gap-4 mt-1 bg-white rounded shadow-sm border-t-2 border-[#1c1e2a]">
      <div className="w-16 flex-shrink-0" />
      <div className="flex-1 py-3 min-w-0">
        <p className="text-xs font-semibold text-[#1c1e2a]">
          {label} &middot; {items.reduce((s, p) => s + (p.quantity || 1), 0)}{' '}
          items
        </p>
      </div>
      <div className="w-24 flex-shrink-0" />
      <div className="w-12 flex-shrink-0" />
      <div className="w-24 flex-shrink-0 text-right">
        <span className="text-[17px] font-bold text-[#1c1e2a]">
          $
          {items
            .reduce((s, p) => s + Number(p.price) * (p.quantity || 1), 0)
            .toLocaleString()}
        </span>
      </div>
      <div className="w-10 flex-shrink-0" />
    </div>
  );
}
