import { RiArrowLeftLine, RiImageLine } from '@remixicon/react';
import { Badge, StarRating } from '@shelfr/ui';
import type { Product, ProductStatus } from '@shelfr/shared';

interface CompareTableProps {
  products: Product[];
  onBack: () => void;
  onPickWinner: (id: string) => void;
}

export function CompareTable({
  products,
  onBack,
  onPickWinner,
}: CompareTableProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
        >
          <RiArrowLeftLine size={14} /> Back
        </button>
        <h2 className="text-[15px] font-semibold text-[#1c1e2a] font-serif">
          Comparing {products.length} products
        </h2>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {[
                '#',
                '',
                'Product',
                'Price',
                'Shop',
                'Status',
                'Rating',
                '',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
              >
                <td className="py-4 px-4">
                  <span
                    className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-semibold ${i === 0 ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-400'}`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiImageLine size={16} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 font-medium text-[#1c1e2a] font-serif max-w-32">
                  {p.title}
                </td>
                <td className="py-4 px-4 font-semibold text-[#1c1e2a]">
                  ${Number(p.price).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-neutral-500">{p.shop_name}</td>
                <td className="py-4 px-4">
                  <Badge status={p.status as ProductStatus} showLabel />
                </td>
                <td className="py-4 px-4">
                  <StarRating rating={p.rating} size={12} interactive={false} />
                </td>
                <td className="py-4 px-4">
                  {p.status !== 'winner' ? (
                    <button
                      onClick={() => onPickWinner(p.id)}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap"
                    >
                      Pick winner
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-500 font-medium">
                      Winner
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
