import { useState } from 'react';
import { RiStore2Line, RiExternalLinkLine } from '@remixicon/react';
import { Button } from '@shelfr/ui';
import type { Shop } from '@shelfr/shared';

interface ShopWithCount extends Shop {
  _count: number;
}

interface ShopsTabProps {
  shops: ShopWithCount[];
  shopSortBy: 'name' | 'domain' | 'products';
  onShopSortChange: (key: 'name' | 'domain' | 'products') => void;
  onAddShop: (name: string, url: string) => void;
}

export function ShopsTab({
  shops,
  shopSortBy,
  onShopSortChange,
  onAddShop,
}: ShopsTabProps) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-5">
        Shops discovered for this collection. This list keeps growing even when
        products are removed.
      </p>
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {[
                { key: 'name' as const, label: 'Shop' },
                { key: 'domain' as const, label: 'Domain' },
                { key: 'products' as const, label: 'Products' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => onShopSortChange(col.key)}
                  className={`text-left py-3.5 px-5 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors ${shopSortBy === col.key ? 'text-[#1c1e2a]' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  {col.label}
                  {shopSortBy === col.key ? ' ↓' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr
                key={s.id}
                className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
              >
                <td className="py-3.5 px-5 font-medium text-[#1c1e2a] flex items-center gap-2.5">
                  <RiStore2Line size={15} className="text-neutral-400" />{' '}
                  {s.name}
                </td>
                <td className="py-3.5 px-5">
                  {s.domain ? (
                    <a
                      href={`https://${s.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-[#1c1e2a] flex items-center gap-1.5 group"
                    >
                      {s.domain}{' '}
                      <RiExternalLinkLine
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  ) : (
                    <span className="text-neutral-300">--</span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-neutral-500">
                  {s._count > 0 ? (
                    `${s._count} product${s._count !== 1 ? 's' : ''}`
                  ) : (
                    <span className="text-neutral-300">--</span>
                  )}
                </td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-neutral-400">
                  No shops yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ShopAddForm onAdd={onAddShop} />
    </div>
  );
}

function ShopAddForm({
  onAdd,
}: {
  onAdd: (name: string, url: string) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  return (
    <div className="flex gap-2.5 mt-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Shop name"
        className="flex-1 text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        className="flex-[1.5] text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
      />
      <Button
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim(), url);
            setName('');
            setUrl('');
          }
        }}
      >
        Add
      </Button>
    </div>
  );
}
