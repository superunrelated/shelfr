import {
  RiStore2Line,
  RiExternalLinkLine,
  RiArrowRightSLine,
  RiImageLine,
} from '@remixicon/react';

export interface ShopAccordionProduct {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
}

export interface ShopAccordionShelfGroup {
  collectionId: string;
  name: string;
  slug: string;
  color: string;
  products: ShopAccordionProduct[];
}

export interface ShopAccordionItem {
  key: string;
  name: string;
  domain: string;
  url?: string | null;
  productCount: number;
  shelfCount?: number;
  shelfGroups: ShopAccordionShelfGroup[];
  showShelfHeaders: boolean;
  badge?: React.ReactNode;
}

interface ShopAccordionProps {
  items: ShopAccordionItem[];
  expandedKey: string | null;
  onToggle: (key: string) => void;
  onSelectProduct: (slug: string, productId: string) => void;
  emptyState?: React.ReactNode;
}

export function ShopAccordion({
  items,
  expandedKey,
  onToggle,
  onSelectProduct,
  emptyState,
}: ShopAccordionProps): React.ReactNode {
  if (items.length === 0) {
    return emptyState ?? null;
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((s) => {
        const expanded = expandedKey === s.key;
        return (
          <ShopAccordionRow
            key={s.key}
            shop={s}
            expanded={expanded}
            onToggle={() => onToggle(s.key)}
            onSelectProduct={onSelectProduct}
          />
        );
      })}
    </div>
  );
}

function ShopAccordionRow({
  shop,
  expanded,
  onToggle,
  onSelectProduct,
}: {
  shop: ShopAccordionItem;
  expanded: boolean;
  onToggle: () => void;
  onSelectProduct: (slug: string, productId: string) => void;
}) {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
      >
        <RiArrowRightSLine
          size={16}
          className={`text-neutral-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <RiStore2Line size={15} className="text-neutral-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#1c1e2a] truncate">
              {shop.name}
            </span>
            {shop.badge}
          </div>
          {shop.domain && (
            <a
              href={shop.url || `https://${shop.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-neutral-400 hover:text-[#1c1e2a] flex items-center gap-1 group w-fit"
            >
              {shop.domain}
              <RiExternalLinkLine
                size={11}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {typeof shop.shelfCount === 'number' && (
            <span className="text-[11px] text-neutral-400">
              {shop.shelfCount} {shop.shelfCount === 1 ? 'shelf' : 'shelves'}
            </span>
          )}
          <span className="text-[11px] font-medium text-neutral-500 min-w-[70px] text-right">
            {shop.productCount}{' '}
            {shop.productCount === 1 ? 'product' : 'products'}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50/40 px-4 py-3">
          {shop.shelfGroups.length === 0 ||
          shop.shelfGroups.every((g) => g.products.length === 0) ? (
            <p className="text-[11px] text-neutral-400 py-1">
              No products from this shop yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {shop.shelfGroups.map((g) => (
                <div key={g.collectionId}>
                  {shop.showShelfHeaders && (
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: g.color }}
                      />
                      <span className="text-[11px] font-medium text-[#1c1e2a]">
                        {g.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {g.products.length}{' '}
                        {g.products.length === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {g.products.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => onSelectProduct(g.slug, p.id)}
                        className="bg-white rounded shadow-sm hover:shadow-md transition-all flex items-center gap-3 overflow-hidden text-left"
                      >
                        <div className="w-10 h-10 bg-neutral-100 flex-shrink-0 overflow-hidden">
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
                                size={16}
                                className="text-neutral-300"
                              />
                            </div>
                          )}
                        </div>
                        <span className="flex-1 text-[12px] text-[#1c1e2a] truncate py-2">
                          {p.title}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-500 pr-3">
                          ${Number(p.price).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
