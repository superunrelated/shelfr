import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import { Button, Badge, StarRating, EmptyState } from '@shelfr/ui';
import { supabase, cleanUrl, extractDomain } from '@shelfr/shared';
import type { Product, ProductStatus } from '@shelfr/shared';
import { Sidebar } from '../components/Sidebar';
import { ProductDrawer } from '../components/ProductDrawer';
import { ScrapePreviewModal } from '../components/ScrapePreviewModal';
import { AddProductBar } from '../components/AddProductBar';
import {
  RiBookmarkLine,
  RiMenuLine,
  RiExternalLinkLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiShoppingBag3Line,
  RiScalesLine,
  RiStore2Line,
  RiArrowDownSLine,
  RiGridFill,
  RiGridLine,
  RiListCheck,
  RiImageLine,
  RiArchiveLine,
  RiLayoutGridLine,
} from '@remixicon/react';

// ── Types ──

type SortKey = 'rating' | 'price' | 'status';
type SortDir = 'asc' | 'desc';
type ViewMode = 'big' | 'medium' | 'compact' | 'list';

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
const COLORS = [
  '#5b8db8',
  '#4f9a7e',
  '#c4883d',
  '#b06b7d',
  '#6b5eaa',
  '#bf6b4a',
];

function sortProducts(
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

function groupByStatus(products: Product[], dir: SortDir) {
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

// ── Main page ──

export function HomePage() {
  const { user, signOut } = useAuth();
  const { slug: urlSlug, productId: urlProductId } = useParams();
  const navigate = useNavigate();

  // Data hooks
  const { collections, create: createCollection } = useCollections();
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const {
    products,
    loading: productsLoading,
    error: productsError,
    create: createProduct,
    update: updateProduct,
    remove: removeProduct,
    clearError: clearProductsError,
  } = useProducts(activeColId);
  const { shops, create: createShop } = useShops(activeColId);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'products' | 'shops'>('products');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('medium');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showWinnersOnly, setShowWinnersOnly] = useState(false);

  // Add product
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [scrapeWarning, setScrapeWarning] = useState('');
  const [manualEntry, setManualEntry] = useState<{
    url: string;
    title: string;
    price: string;
    imageUrl: string;
  } | null>(null);

  // Rescrape
  const [rescraping, setRescraping] = useState(false);
  const [scrapePreview, setScrapePreview] = useState<{
    title?: string;
    image_url?: string;
    price?: number;
    shop_name?: string;
  } | null>(null);

  // Shop sort
  const [shopSortBy, setShopSortBy] = useState<'name' | 'domain' | 'products'>(
    'name'
  );

  // ── Derived data (memoized) ──
  const activeCol = useMemo(
    () => collections.find((c) => c.id === activeColId),
    [collections, activeColId]
  );
  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );
  const filtered = useMemo(
    () => (showArchived ? products : products.filter((p) => !p.archived)),
    [products, showArchived]
  );
  const sorted = useMemo(
    () => sortProducts(filtered, sortBy, sortDir),
    [filtered, sortBy, sortDir]
  );
  const displayed = useMemo(
    () =>
      showWinnersOnly
        ? sorted.filter(
            (p) => p.status === 'winner' || p.status === 'purchased'
          )
        : sorted,
    [sorted, showWinnersOnly]
  );
  const statusGroups = useMemo(
    () => (sortBy === 'status' ? groupByStatus(displayed, sortDir) : []),
    [sortBy, sortDir, displayed]
  );
  const archivedCount = useMemo(
    () => products.filter((p) => p.archived).length,
    [products]
  );
  const winnersCount = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.status === 'winner' || p.status === 'purchased') && !p.archived
      ).length,
    [products]
  );
  const compareProducts = useMemo(
    () =>
      sorted
        .filter((p) => compareIds.has(p.id))
        .sort((a, b) => a.price - b.price),
    [sorted, compareIds]
  );

  const shopProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (!p.archived) {
        map.set(p.shop_domain, (map.get(p.shop_domain) || 0) + 1);
      }
    }
    return map;
  }, [products]);

  const sortedShops = useMemo(() => {
    return [...shops]
      .map((s) => ({ ...s, _count: shopProductCounts.get(s.domain) || 0 }))
      .sort((a, b) => {
        if (shopSortBy === 'products') return b._count - a._count;
        if (shopSortBy === 'domain') return a.domain.localeCompare(b.domain);
        return a.name.localeCompare(b.name);
      });
  }, [shops, shopProductCounts, shopSortBy]);

  // ── URL sync ──
  useEffect(() => {
    if (!collections.length || !urlSlug) return;
    const col = collections.find((c) => c.slug === urlSlug);
    if (col && col.id !== activeColId) setActiveColId(col.id);
  }, [urlSlug, collections]);

  useEffect(() => {
    if (urlProductId && urlProductId !== selectedId) {
      setSelectedId(urlProductId);
    }
  }, [urlProductId]);

  // Re-select product after products load (for direct URL navigation)
  useEffect(() => {
    if (urlProductId && !selected && products.length > 0) {
      const p = products.find((p) => p.id === urlProductId);
      if (p) setSelectedId(p.id);
    }
  }, [products, urlProductId]);

  // ── Actions ──
  function selectProduct(id: string | null) {
    setSelectedId(id);
    setScrapePreview(null);
    if (activeCol) {
      navigate(id ? `/c/${activeCol.slug}/${id}` : `/c/${activeCol.slug}`, {
        replace: true,
      });
    }
  }

  function switchCollection(id: string) {
    const col = collections.find((c) => c.id === id);
    setActiveColId(id);
    setSelectedId(null);
    setCompareMode(false);
    setCompareIds(new Set());
    setShowCompare(false);
    setTab('products');
    setSidebarOpen(false);
    if (col) navigate(`/c/${col.slug}`);
  }

  async function handleCreateCollection(name: string) {
    const color = COLORS[collections.length % COLORS.length];
    const col = await createCollection(name, color);
    if (col) {
      setActiveColId(col.id);
      navigate(`/c/${col.slug}`);
    }
  }

  async function handleAddProduct() {
    if (!urlInput.trim() || !activeColId || !user || adding) return;
    setAdding(true);
    setScrapeWarning('');
    const cleaned = cleanUrl(urlInput.trim());
    const domain = extractDomain(cleaned);

    // Duplicate detection
    const existing = products.find((p) => p.source_url === cleaned);
    if (existing) {
      setScrapeWarning(
        `This URL is already saved in this collection as "${existing.title}".`
      );
      setAdding(false);
      return;
    }
    let baseUrl = '';
    try {
      baseUrl = new URL(cleaned).origin;
    } catch {
      /* */
    }

    let scraped: {
      title?: string;
      image_url?: string;
      price?: number;
      shop_name?: string;
      error?: string;
    } = {};
    let scrapeFailed = false;
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url: cleaned },
      });
      if (!error && data && !data.error) scraped = data;
      else scrapeFailed = true;
    } catch {
      scrapeFailed = true;
    }

    if (scrapeFailed) {
      // Show manual entry form instead of creating a blank product
      setScrapeWarning(
        'Could not fetch product details. Fill them in manually.'
      );
      setManualEntry({ url: cleaned, title: '', price: '', imageUrl: '' });
      setAdding(false);
      return;
    }

    const shopDisplayName = scraped.shop_name || domain;
    if (!shops.find((s) => s.domain === domain)) {
      await createShop({
        collection_id: activeColId,
        name: shopDisplayName,
        domain,
        url: baseUrl || undefined,
      });
    }

    await createProduct({
      collection_id: activeColId,
      user_id: user.id,
      added_by: user.id,
      title: scraped.title || 'New product',
      source_url: cleaned,
      image_url: scraped.image_url || null,
      price: scraped.price || 0,
      original_price: scraped.price || 0,
      shop_name: shopDisplayName,
      shop_domain: domain,
      status: 'considering',
    });
    setUrlInput('');
    setAdding(false);
  }

  async function handleManualSubmit() {
    if (!manualEntry || !activeColId || !user) return;
    const domain = extractDomain(manualEntry.url);
    let baseUrl = '';
    try {
      baseUrl = new URL(manualEntry.url).origin;
    } catch {
      /* */
    }

    if (!shops.find((s) => s.domain === domain)) {
      await createShop({
        collection_id: activeColId,
        name: domain,
        domain,
        url: baseUrl || undefined,
      });
    }

    await createProduct({
      collection_id: activeColId,
      user_id: user.id,
      added_by: user.id,
      title: manualEntry.title || 'New product',
      source_url: manualEntry.url,
      image_url: manualEntry.imageUrl || null,
      price: parseFloat(manualEntry.price) || 0,
      original_price: parseFloat(manualEntry.price) || 0,
      shop_name: domain,
      shop_domain: domain,
      status: 'considering',
    });
    setManualEntry(null);
    setUrlInput('');
    setScrapeWarning('');
  }

  async function handleRescrape() {
    if (!selected?.source_url || rescraping) return;
    setRescraping(true);
    setScrapePreview(null);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url: selected.source_url },
      });
      if (!error && data && !data.error) setScrapePreview(data);
      else setScrapeWarning(data?.error || 'Rescrape failed.');
    } catch {
      setScrapeWarning('Rescrape failed.');
    }
    setRescraping(false);
  }

  function applyScrapePreview() {
    if (!selected || !scrapePreview) return;
    const updates: Partial<Product> = {};
    if (scrapePreview.title) updates.title = scrapePreview.title;
    if (scrapePreview.image_url) updates.image_url = scrapePreview.image_url;
    if (scrapePreview.price !== null && scrapePreview.price !== undefined) {
      updates.original_price = selected.price;
      updates.price = scrapePreview.price;
    }
    if (scrapePreview.shop_name) updates.shop_name = scrapePreview.shop_name;
    updates.price_checked_at = new Date().toISOString();
    updateProduct(selected.id, updates);
    setScrapePreview(null);
  }

  function toggleCompareId(id: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  async function handleAddShop(name: string, url: string) {
    if (!activeColId) return;
    const domain = url ? extractDomain(url) : '';
    await createShop({
      collection_id: activeColId,
      name,
      domain,
      url: url || undefined,
    });
  }

  function handleSortClick(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else {
      setSortBy(key);
      setSortDir('desc');
    }
  }

  // ── Card click handler ──
  const handleCardClick = useCallback(
    (e: React.MouseEvent, p: Product) => {
      if (e.shiftKey && p.source_url) {
        window.open(p.source_url, '_blank');
        return;
      }
      compareMode ? toggleCompareId(p.id) : selectProduct(p.id);
    },
    [compareMode, activeCol]
  );

  // ── Render card (grid) ──
  const renderCard = useCallback(
    (p: Product) => {
      const isCompact = viewMode === 'compact';
      return (
        <div
          key={p.id}
          onClick={(e) => handleCardClick(e, p)}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && selectProduct(p.id)}
          className={`bg-white rounded overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 group shadow-sm hover:shadow-md
          ${p.archived ? 'opacity-50' : ''}
          ${selectedId === p.id ? 'ring-2 ring-[#1c1e2a] shadow-lg' : p.status === 'winner' && !p.archived ? 'ring-1 ring-amber-300/60' : ''}
          ${compareMode && compareIds.has(p.id) ? 'ring-2 ring-[#1c1e2a] shadow-lg' : ''}`}
        >
          {compareMode && (
            <div
              className={`absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center z-10 ${compareIds.has(p.id) ? 'bg-[#1c1e2a] text-white' : 'bg-white/90 border border-neutral-300 text-transparent'}`}
            >
              <RiCheckLine size={10} />
            </div>
          )}
          {!compareMode && !isCompact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateProduct(p.id, { archived: !p.archived });
              }}
              title={p.archived ? 'Unarchive' : 'Archive'}
              className={`absolute top-3 right-3 z-10 p-1 rounded bg-white/80 backdrop-blur-sm transition-all ${p.archived ? 'text-amber-500 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-600'}`}
            >
              <RiArchiveLine size={14} />
            </button>
          )}
          <div
            className={`w-full bg-neutral-100 relative overflow-hidden ${isCompact ? 'aspect-square' : viewMode === 'big' ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}
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
                  size={isCompact ? 20 : viewMode === 'big' ? 48 : 36}
                  className="text-neutral-300"
                />
              </div>
            )}
            {!compareMode && !isCompact && (
              <div className="absolute top-2.5 left-2.5 z-10 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
                <StarRating
                  rating={p.rating}
                  size={12}
                  onRate={(r) => updateProduct(p.id, { rating: r })}
                />
              </div>
            )}
            {isCompact && p.status !== 'considering' && (
              <div className="absolute bottom-1 right-1 z-10">
                <Badge status={p.status as ProductStatus} />
              </div>
            )}
          </div>
          <div
            className={isCompact ? 'p-2' : viewMode === 'big' ? 'p-5' : 'p-4'}
          >
            {!isCompact && (
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                {p.shop_name}
              </p>
            )}
            <p
              className={`font-medium leading-snug font-serif ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[11px] line-clamp-1 mb-1' : `${viewMode === 'big' ? 'text-[15px]' : 'text-[13px]'} line-clamp-2 mb-2.5`}`}
            >
              {p.title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-semibold ${p.archived ? 'text-neutral-400' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[12px]' : viewMode === 'big' ? 'text-[17px]' : 'text-[15px]'}`}
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
    },
    [viewMode, compareMode, compareIds, selectedId, handleCardClick]
  );

  // ── Render list row ──
  const renderRow = useCallback(
    (p: Product) => (
      <div
        key={p.id}
        onClick={(e) => handleCardClick(e, p)}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && selectProduct(p.id)}
        className={`bg-white rounded overflow-hidden cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md transition-all
        ${p.archived ? 'opacity-50' : ''}
        ${selectedId === p.id ? 'ring-2 ring-[#1c1e2a]' : p.status === 'winner' && !p.archived ? 'ring-1 ring-amber-300/60' : ''}
        ${compareMode && compareIds.has(p.id) ? 'ring-2 ring-[#1c1e2a]' : ''}`}
      >
        {compareMode && (
          <div
            className={`ml-4 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${compareIds.has(p.id) ? 'bg-[#1c1e2a] text-white' : 'border border-neutral-300 text-transparent'}`}
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
          <StarRating
            rating={p.rating}
            size={12}
            onRate={(r) => updateProduct(p.id, { rating: r })}
          />
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
              updateProduct(p.id, { archived: !p.archived });
            }}
            title={p.archived ? 'Unarchive' : 'Archive'}
            className={`p-1 rounded hover:bg-neutral-100 transition-colors ${p.archived ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'}`}
          >
            <RiArchiveLine size={14} />
          </button>
        </div>
      </div>
    ),
    [compareMode, compareIds, selectedId, sortBy, handleCardClick]
  );

  // ── Total row ──
  const TotalRow = ({ items, label }: { items: Product[]; label: string }) => (
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

  const gridCls =
    viewMode === 'big'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
      : viewMode === 'medium'
        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        : 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5';

  // ── Render ──
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 antialiased text-sm">
      <Sidebar
        collections={collections}
        activeColId={activeColId}
        userEmail={user?.email ?? ''}
        open={sidebarOpen}
        onSwitchCollection={switchCollection}
        onCreateCollection={handleCreateCollection}
        onSignOut={signOut}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!activeCol ? (
          <EmptyState
            icon={RiBookmarkLine}
            title="Welcome to Shelfr"
            description="Create a collection to start tracking products."
          />
        ) : (
          <>
            {/* Topbar */}
            <header className="bg-white border-b border-neutral-200/80 px-4 md:px-6 h-14 md:h-16 flex items-center gap-3 md:gap-4 flex-shrink-0">
              <button
                className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-neutral-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <RiMenuLine size={20} />
              </button>
              <h1 className="flex-1 text-[18px] font-semibold text-[#1c1e2a] tracking-tight truncate font-serif">
                {activeCol.name}
              </h1>
              {!compareMode ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCompareMode(true);
                    setSelectedId(null);
                    setCompareIds(new Set());
                    setShowCompare(false);
                  }}
                >
                  <RiScalesLine size={14} /> Compare
                </Button>
              ) : (
                <>
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full">
                    {compareIds.size} selected
                  </span>
                  <Button
                    disabled={compareIds.size < 2}
                    onClick={() => setShowCompare(true)}
                  >
                    Compare now
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCompareMode(false);
                      setCompareIds(new Set());
                      setShowCompare(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </header>

            {/* Toolbar */}
            <div className="bg-white border-b border-neutral-200/80 px-4 md:px-6 flex items-center gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide">
              {[
                {
                  key: 'products' as const,
                  label: 'Products',
                  Icon: RiShoppingBag3Line,
                },
                { key: 'shops' as const, label: 'Shops', Icon: RiStore2Line },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    if (t.key === 'shops') setSelectedId(null);
                  }}
                  className={`px-4 py-3 text-xs border-b-2 -mb-px transition-all flex items-center gap-1.5 ${tab === t.key ? 'border-[#1c1e2a] text-[#1c1e2a] font-medium' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                  <t.Icon size={14} /> {t.label}
                </button>
              ))}
              {tab === 'products' && !showCompare && (
                <>
                  <div className="w-px h-5 bg-neutral-200 mx-3" />
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mr-1">
                    Sort
                  </span>
                  {(['rating', 'price', 'status'] as SortKey[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSortClick(s)}
                      className={`text-[11px] px-2.5 py-1 rounded capitalize transition-all flex items-center gap-0.5 ${sortBy === s ? 'bg-[#1c1e2a] text-white font-medium' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      {s === 'rating' ? 'Stars' : s}
                      {sortBy === s && (
                        <span className="text-[9px] ml-0.5">
                          {sortDir === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  ))}
                </>
              )}
              <div className="flex-1" />
              {tab === 'products' && !showCompare && (
                <div className="flex items-center gap-3">
                  {winnersCount > 0 && (
                    <button
                      onClick={() => setShowWinnersOnly(!showWinnersOnly)}
                      className={`text-[11px] flex items-center gap-1 transition-all ${showWinnersOnly ? 'text-amber-600 font-medium' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                      {showWinnersOnly
                        ? 'Show all'
                        : `Winners (${winnersCount})`}
                    </button>
                  )}
                  {archivedCount > 0 && (
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`text-[11px] flex items-center gap-1 transition-all ${showArchived ? 'text-[#1c1e2a] font-medium' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                      <RiArchiveLine size={13} />{' '}
                      {showArchived ? 'Hide' : 'Show'} archived ({archivedCount}
                      )
                    </button>
                  )}
                  <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
                    {[
                      { key: 'big' as ViewMode, Icon: RiLayoutGridLine },
                      { key: 'medium' as ViewMode, Icon: RiGridLine },
                      { key: 'compact' as ViewMode, Icon: RiGridFill },
                      { key: 'list' as ViewMode, Icon: RiListCheck },
                    ].map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setViewMode(v.key)}
                        className={`p-1.5 transition-all ${viewMode === v.key ? 'bg-[#1c1e2a] text-white' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
                      >
                        <v.Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error banner */}
            {productsError && (
              <div
                className="bg-red-50 px-6 py-2 text-xs text-red-600 flex items-center gap-2"
                role="alert"
              >
                <span className="flex-1">{productsError}</span>
                <button
                  onClick={clearProductsError}
                  className="text-red-400 hover:text-red-600"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                {/* Loading */}
                {productsLoading && tab === 'products' && (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-xs text-neutral-400">
                      Loading products...
                    </p>
                  </div>
                )}

                {/* Grid view */}
                {tab === 'products' &&
                  !showCompare &&
                  !productsLoading &&
                  viewMode !== 'list' &&
                  (sortBy === 'status' && statusGroups.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {statusGroups.map((g) => (
                        <div key={g.status}>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge status={g.status} showLabel />
                            <span className="text-[11px] text-neutral-400">
                              {g.items.length}
                            </span>
                            <div className="flex-1 h-px bg-neutral-200" />
                          </div>
                          <div className={gridCls}>
                            {g.items.map(renderCard)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={gridCls}>
                      {adding && <SkeletonCard viewMode={viewMode} />}
                      {displayed.map(renderCard)}
                    </div>
                  ))}

                {/* List view */}
                {tab === 'products' &&
                  !showCompare &&
                  !productsLoading &&
                  viewMode === 'list' &&
                  (sortBy === 'status' && statusGroups.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {statusGroups.map((g) => (
                        <div key={g.status}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge status={g.status} showLabel />
                            <span className="text-[11px] text-neutral-400">
                              {g.items.length}
                            </span>
                            <div className="flex-1 h-px bg-neutral-200" />
                            <span className="text-[11px] font-medium text-neutral-500">
                              $
                              {g.items
                                .reduce(
                                  (s, p) =>
                                    s + Number(p.price) * (p.quantity || 1),
                                  0
                                )
                                .toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {g.items.map(renderRow)}
                          </div>
                        </div>
                      ))}
                      {displayed.length > 0 && (
                        <TotalRow
                          items={displayed}
                          label={showWinnersOnly ? 'Purchase total' : 'Total'}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {displayed.map(renderRow)}
                      {displayed.length > 0 && (
                        <TotalRow
                          items={displayed}
                          label={showWinnersOnly ? 'Purchase total' : 'Total'}
                        />
                      )}
                    </div>
                  ))}

                {/* Compare table */}
                {tab === 'products' && showCompare && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => setShowCompare(false)}
                        className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
                      >
                        <RiArrowLeftLine size={14} /> Back
                      </button>
                      <h2 className="text-[15px] font-semibold text-[#1c1e2a] font-serif">
                        Comparing {compareProducts.length} products
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
                          {compareProducts.map((p, i) => (
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
                                      <RiImageLine
                                        size={16}
                                        className="text-neutral-300"
                                      />
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
                              <td className="py-4 px-4 text-neutral-500">
                                {p.shop_name}
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  status={p.status as ProductStatus}
                                  showLabel
                                />
                              </td>
                              <td className="py-4 px-4">
                                <StarRating
                                  rating={p.rating}
                                  size={12}
                                  interactive={false}
                                />
                              </td>
                              <td className="py-4 px-4">
                                {p.status !== 'winner' ? (
                                  <button
                                    onClick={() =>
                                      updateProduct(p.id, { status: 'winner' })
                                    }
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
                )}

                {/* Shops tab */}
                {tab === 'shops' && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-5">
                      Shops discovered for this collection. This list keeps
                      growing even when products are removed.
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
                                onClick={() => setShopSortBy(col.key)}
                                className={`text-left py-3.5 px-5 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors ${shopSortBy === col.key ? 'text-[#1c1e2a]' : 'text-neutral-400 hover:text-neutral-600'}`}
                              >
                                {col.label}
                                {shopSortBy === col.key ? ' ↓' : ''}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedShops.map((s) => (
                            <tr
                              key={s.id}
                              className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
                            >
                              <td className="py-3.5 px-5 font-medium text-[#1c1e2a] flex items-center gap-2.5">
                                <RiStore2Line
                                  size={15}
                                  className="text-neutral-400"
                                />{' '}
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
                              <td
                                colSpan={3}
                                className="py-8 text-center text-neutral-400"
                              >
                                No shops yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <ShopAddForm onAdd={handleAddShop} />
                  </div>
                )}

                {/* Empty products */}
                {tab === 'products' &&
                  !showCompare &&
                  !productsLoading &&
                  products.length === 0 && (
                    <EmptyState
                      icon={RiShoppingBag3Line}
                      title="No products yet"
                      description="Paste a URL below to add one."
                    />
                  )}
              </div>

              {/* Drawer */}
              {selected && !compareMode && tab === 'products' && (
                <ProductDrawer
                  product={selected}
                  onUpdate={updateProduct}
                  onArchive={() => {
                    updateProduct(selected.id, {
                      archived: !selected.archived,
                    });
                    selectProduct(null);
                  }}
                  onDelete={() => {
                    if (window.confirm('Delete this product permanently?')) {
                      removeProduct(selected.id);
                      selectProduct(null);
                    }
                  }}
                  onClose={() => selectProduct(null)}
                  onRescrape={handleRescrape}
                  rescraping={rescraping}
                />
              )}
            </div>

            {/* Scrape preview modal */}
            {scrapePreview && selected && (
              <ScrapePreviewModal
                preview={scrapePreview}
                currentTitle={selected.title}
                currentPrice={Number(selected.price)}
                currentImageUrl={selected.image_url}
                currentShopName={selected.shop_name}
                onApply={applyScrapePreview}
                onDismiss={() => setScrapePreview(null)}
              />
            )}

            {/* URL input bar */}
            {tab === 'products' && (
              <AddProductBar
                urlInput={urlInput}
                onUrlChange={setUrlInput}
                onAdd={handleAddProduct}
                adding={adding}
                warning={scrapeWarning}
                onDismissWarning={() => setScrapeWarning('')}
                manualEntry={manualEntry}
                onManualChange={setManualEntry}
                onManualSubmit={handleManualSubmit}
                onManualCancel={() => {
                  setManualEntry(null);
                  setScrapeWarning('');
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonCard({ viewMode }: { viewMode: ViewMode }) {
  const isCompact = viewMode === 'compact';
  return (
    <div className="bg-white rounded overflow-hidden shadow-sm animate-pulse">
      <div
        className={`w-full bg-neutral-200 ${isCompact ? 'aspect-square' : viewMode === 'big' ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}
      />
      <div className={isCompact ? 'p-2' : viewMode === 'big' ? 'p-5' : 'p-4'}>
        {!isCompact && (
          <div className="h-2.5 bg-neutral-200 rounded w-16 mb-2" />
        )}
        <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-3.5 bg-neutral-200 rounded w-12" />
      </div>
    </div>
  );
}

// ── Small inline component ──
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
