import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import { Badge, StarRating, EmptyState, SkeletonCard } from '@shelfr/ui';
import { supabase, cleanUrl, extractDomain } from '@shelfr/shared';
import type { Product, ProductStatus } from '@shelfr/shared';
import { Sidebar } from '../components/Sidebar';
import { ProductDrawer } from '../components/ProductDrawer';
import { ScrapePreviewModal } from '../components/ScrapePreviewModal';
import { AddProductBar } from '../components/AddProductBar';
import { CollectionsGrid } from '../components/CollectionsGrid';
import { CollectionHeader } from '../components/CollectionHeader';
import { CollectionToolbar } from '../components/CollectionToolbar';
import { CompareTable } from '../components/CompareTable';
import { ShopsTab } from '../components/ShopsTab';
import {
  RiCheckLine,
  RiShoppingBag3Line,
  RiArrowDownSLine,
  RiImageLine,
  RiArchiveLine,
} from '@remixicon/react';
import {
  sortProducts,
  groupByStatus,
  COLLECTION_COLORS,
} from '../utils/productSort';
import type { SortKey, SortDir, ViewMode } from '../utils/productSort';

// ── Main page ──

export function HomePage() {
  const { user, signOut } = useAuth();
  const { slug: urlSlug, productId: urlProductId } = useParams();
  const navigate = useNavigate();

  // Data hooks
  const {
    collections,
    create: createCollection,
    remove: removeCollection,
  } = useCollections();
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

  // Collection cover images
  const [collectionCovers, setCollectionCovers] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (activeColId || collections.length === 0) return;
    async function fetchCovers() {
      const covers: Record<string, string> = {};
      for (const c of collections) {
        const { data } = await supabase
          .from('products')
          .select('image_url')
          .eq('collection_id', c.id)
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data?.image_url) covers[c.id] = data.image_url;
      }
      setCollectionCovers(covers);
    }
    fetchCovers();
  }, [activeColId, collections]);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'products' | 'shops'>('products');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('big');
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

  // ── Derived data ──
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
    const color =
      COLLECTION_COLORS[collections.length % COLLECTION_COLORS.length];
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

  // ── Render card ──
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
            className={`w-full bg-neutral-100 relative overflow-hidden ${isCompact ? 'aspect-square' : 'aspect-[4/3]'}`}
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
                  size={isCompact ? 20 : 48}
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
          <div className={isCompact ? 'p-2' : 'p-5'}>
            {!isCompact && (
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                {p.shop_name}
              </p>
            )}
            <p
              className={`font-medium leading-snug font-serif ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[11px] line-clamp-1 mb-1' : 'text-[15px] line-clamp-2 mb-2.5'}`}
            >
              {p.title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-semibold ${p.archived ? 'text-neutral-400' : 'text-[#1c1e2a]'} ${isCompact ? 'text-[12px]' : 'text-[17px]'}`}
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
        onDeleteCollection={(id) => {
          if (!window.confirm('Delete this collection and all its products?')) {
            return;
          }
          removeCollection(id);
          if (activeColId === id) {
            setActiveColId(null);
            navigate('/c');
          }
        }}
        onSignOut={signOut}
        onDeleteAccount={async () => {
          if (
            !window.confirm(
              'Are you sure? This will permanently delete your account and all your data.'
            )
          ) {
            return;
          }
          if (!window.confirm('This cannot be undone. Delete everything?')) {
            return;
          }
          await supabase.rpc('delete_own_account');
          await supabase.auth.signOut();
          navigate('/');
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!activeCol ? (
          <CollectionsGrid
            collections={collections}
            collectionCovers={collectionCovers}
            onSwitchCollection={switchCollection}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <>
            <CollectionHeader
              collection={activeCol}
              compareMode={compareMode}
              compareCount={compareIds.size}
              onOpenSidebar={() => setSidebarOpen(true)}
              onStartCompare={() => {
                setCompareMode(true);
                setSelectedId(null);
                setCompareIds(new Set());
                setShowCompare(false);
              }}
              onShowCompare={() => setShowCompare(true)}
              onCancelCompare={() => {
                setCompareMode(false);
                setCompareIds(new Set());
                setShowCompare(false);
              }}
            />

            <CollectionToolbar
              tab={tab}
              onTabChange={(t) => {
                setTab(t);
                if (t === 'shops') setSelectedId(null);
              }}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortClick={handleSortClick}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showCompare={showCompare}
              showArchived={showArchived}
              onToggleArchived={() => setShowArchived(!showArchived)}
              archivedCount={archivedCount}
              showWinnersOnly={showWinnersOnly}
              onToggleWinners={() => setShowWinnersOnly(!showWinnersOnly)}
              winnersCount={winnersCount}
            />

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
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
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
                      {adding && (
                        <SkeletonCard compact={viewMode === 'compact'} />
                      )}
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
                  <CompareTable
                    products={compareProducts}
                    onBack={() => setShowCompare(false)}
                    onPickWinner={(id) =>
                      updateProduct(id, { status: 'winner' })
                    }
                  />
                )}

                {/* Shops tab */}
                {tab === 'shops' && (
                  <ShopsTab
                    shops={sortedShops}
                    shopSortBy={shopSortBy}
                    onShopSortChange={setShopSortBy}
                    onAddShop={handleAddShop}
                  />
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
