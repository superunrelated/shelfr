import { useMemo } from 'react';
import type { Shop, Product } from '@shelfr/shared';
import { ShopAddForm } from './ShopAddForm';
import { ShopAccordion, type ShopAccordionItem } from './ShopAccordion';

interface ShopWithCount extends Shop {
  _count: number;
}

interface CollectionInfo {
  id: string;
  name: string;
  slug: string;
  color: string;
}

type ShopSortKey = 'name' | 'domain' | 'products';

interface ShopsTabProps {
  shops: ShopWithCount[];
  products: Product[];
  collection: CollectionInfo;
  shopSortBy: ShopSortKey;
  onShopSortChange: (key: ShopSortKey) => void;
  onAddShop: (name: string, url: string) => void;
  expandedShopId: string | null;
  onToggleShop: (id: string | null) => void;
  onSelectProduct: (id: string) => void;
}

const SORT_OPTIONS: { key: ShopSortKey; label: string }[] = [
  { key: 'name', label: 'Shop' },
  { key: 'domain', label: 'Domain' },
  { key: 'products', label: 'Products' },
];

export function ShopsTab({
  shops,
  products,
  collection,
  shopSortBy,
  onShopSortChange,
  onAddShop,
  expandedShopId,
  onToggleShop,
  onSelectProduct,
}: ShopsTabProps) {
  const items: ShopAccordionItem[] = useMemo(() => {
    return shops.map((s) => {
      const domainLower = (s.domain || '').toLowerCase();
      const shopProducts = products
        .filter(
          (p) =>
            !p.archived && (p.shop_domain || '').toLowerCase() === domainLower
        )
        .sort((a, b) => a.title.localeCompare(b.title));
      return {
        key: s.id,
        name: s.name,
        domain: s.domain,
        url: s.url,
        productCount: s._count,
        showShelfHeaders: false,
        shelfGroups: [
          {
            collectionId: collection.id,
            name: collection.name,
            slug: collection.slug,
            color: collection.color,
            products: shopProducts.map((p) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              image_url: p.image_url,
            })),
          },
        ],
      };
    });
  }, [shops, products, collection]);

  return (
    <div>
      <p className="text-xs text-neutral-400 mb-4">
        Shops discovered for this collection. This list keeps growing even when
        products are removed.
      </p>
      <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-neutral-400">
        <span>Sort by</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onShopSortChange(opt.key)}
            className={`px-2 py-1 rounded transition-colors ${
              shopSortBy === opt.key
                ? 'text-[#1c1e2a] bg-neutral-200/70'
                : 'hover:text-neutral-600'
            }`}
          >
            {opt.label}
            {shopSortBy === opt.key ? ' ↓' : ''}
          </button>
        ))}
      </div>
      <ShopAccordion
        items={items}
        expandedKey={expandedShopId}
        onToggle={(k) => onToggleShop(expandedShopId === k ? null : k)}
        onSelectProduct={(_slug, productId) => onSelectProduct(productId)}
        emptyState={
          <p className="text-xs text-neutral-400 py-6 text-center bg-white rounded shadow-sm">
            No shops yet.
          </p>
        }
      />
      <ShopAddForm onAdd={onAddShop} />
    </div>
  );
}
