import type { Product, ProductStatus, SortKey, SortDir } from '@shelfr/shared';
export type { SortKey, SortDir, ViewMode } from '@shelfr/shared';

const STATUS_ORDER: Record<ProductStatus, number> = {
  purchased: 0,
  winner: 1,
  shortlisted: 2,
  considering: 3,
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  purchased: 'Purchased',
  winner: 'Winners',
  shortlisted: 'Shortlisted',
  considering: 'Considering',
};

export const COLLECTION_COLORS = [
  '#5b8db8',
  '#4f9a7e',
  '#c4883d',
  '#b06b7d',
  '#6b5eaa',
  '#bf6b4a',
];

export function sortProducts(
  products: Product[],
  key: SortKey,
  dir: SortDir
): Product[] {
  const mult = dir === 'asc' ? 1 : -1;
  return [...products].sort((a, b) => {
    if (key === 'rating') {
      if (!a.rating && !b.rating) return 0;
      if (!a.rating) return 1;
      if (!b.rating) return -1;
      return (b.rating - a.rating) * mult;
    }
    if (key === 'price') return (a.price - b.price) * mult;
    return (
      ((STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)) * mult
    );
  });
}

export function groupByStatus(products: Product[], dir: SortDir) {
  const order: ProductStatus[] = [
    'purchased',
    'winner',
    'shortlisted',
    'considering',
  ];
  const groups = order
    .map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      items: products.filter((p) => p.status === s),
    }))
    .filter((g) => g.items.length > 0);
  return dir === 'asc' ? groups.reverse() : groups;
}
