import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import { Badge, EmptyState, SkeletonCard } from '@shelfr/ui';
import { supabase, cleanUrl, extractDomain } from '@shelfr/shared';
import type { Product } from '@shelfr/shared';
import { RiShoppingBag3Line } from '@remixicon/react';
import { Sidebar } from '../components/Sidebar';
import { ProductDrawer } from '../components/ProductDrawer';
import { ScrapePreviewModal } from '../components/ScrapePreviewModal';
import { AddProductBar } from '../components/AddProductBar';
import { CollectionsGrid } from '../components/CollectionsGrid';
import { CollectionHeader } from '../components/CollectionHeader';
import { CollectionToolbar } from '../components/CollectionToolbar';
import { CompareTable } from '../components/CompareTable';
import { ShopsTab } from '../components/ShopsTab';
import { ProductGridCard } from '../components/ProductGridCard';
import { ProductListRow } from '../components/ProductListRow';
import { TotalRow } from '../components/TotalRow';
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
  // URL → state sync: only react to URL param changes, not state
  useEffect(() => {
    if (!collections.length || !urlSlug) return;
    const col = collections.find((c) => c.slug === urlSlug);
    if (col && col.id !== activeColId) setActiveColId(col.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSlug, collections]);

  useEffect(() => {
    if (urlProductId && urlProductId !== selectedId) {
      setSelectedId(urlProductId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProductId]);

  useEffect(() => {
    if (urlProductId && !selected && products.length > 0) {
      const p = products.find((p) => p.id === urlProductId);
      if (p) setSelectedId(p.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function handleCardClick(e: React.MouseEvent, p: Product) {
    if (e.shiftKey && p.source_url) {
      window.open(p.source_url, '_blank');
      return;
    }
    compareMode ? toggleCompareId(p.id) : selectProduct(p.id);
  }

  function renderCard(p: Product) {
    return (
      <ProductGridCard
        key={p.id}
        product={p}
        viewMode={viewMode}
        selected={selectedId === p.id}
        compareMode={compareMode}
        compareSelected={compareIds.has(p.id)}
        onClick={(e) => handleCardClick(e, p)}
        onSelect={() => selectProduct(p.id)}
        onRate={(r) => updateProduct(p.id, { rating: r })}
        onToggleArchive={() => updateProduct(p.id, { archived: !p.archived })}
      />
    );
  }

  function renderRow(p: Product) {
    return (
      <ProductListRow
        key={p.id}
        product={p}
        sortBy={sortBy}
        selected={selectedId === p.id}
        compareMode={compareMode}
        compareSelected={compareIds.has(p.id)}
        onClick={(e) => handleCardClick(e, p)}
        onSelect={() => selectProduct(p.id)}
        onRate={(r) => updateProduct(p.id, { rating: r })}
        onToggleArchive={() => updateProduct(p.id, { archived: !p.archived })}
      />
    );
  }

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
