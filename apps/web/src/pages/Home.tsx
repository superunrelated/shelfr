import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useProducts } from '../hooks/useProducts';
import { useShops } from '../hooks/useShops';
import { Button, Badge, StarRating, StatusPicker } from '@shelfr/ui';
import { supabase, cleanUrl, extractDomain } from '@shelfr/shared';
import type { Product, ProductStatus } from '@shelfr/shared';
import {
  RiBookmarkLine, RiLogoutBoxRLine, RiAddLine, RiCloseLine,
  RiMenuLine, RiExternalLinkLine, RiRefreshLine, RiCheckLine,
  RiArrowLeftLine, RiShoppingBag3Line, RiScalesLine, RiLink,
  RiStore2Line, RiArrowDownSLine, RiGridFill, RiGridLine,
  RiListCheck, RiDeleteBinLine, RiImageLine, RiArchiveLine, RiEyeLine,
} from '@remixicon/react';

type SortKey = 'rating' | 'price' | 'status';
type ViewMode = 'big' | 'medium' | 'list';

const STATUS_ORDER: Record<ProductStatus, number> = {
  purchased: 0, winner: 1, shortlisted: 2, considering: 3,
};

function sortProducts(products: Product[], key: SortKey): Product[] {
  return [...products].sort((a, b) => {
    if (key === 'rating') {
      if (!a.rating && !b.rating) return 0;
      if (!a.rating) return 1;
      if (!b.rating) return -1;
      return b.rating - a.rating;
    }
    if (key === 'price') return a.price - b.price;
    return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
  });
}

const COLORS = ['#5b8db8', '#4f9a7e', '#c4883d', '#b06b7d', '#6b5eaa', '#bf6b4a'];

export function HomePage() {
  const { user, signOut } = useAuth();
  const { slug: urlSlug, productId: urlProductId } = useParams();
  const navigate = useNavigate();
  const { collections, create: createCollection } = useCollections();
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const { products, create: createProduct, update: updateProduct, remove: removeProduct } = useProducts(activeColId);
  const { shops, create: createShop } = useShops(activeColId);

  const [tab, setTab] = useState<'products' | 'shops'>('products');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync URL slug -> activeColId
  useEffect(() => {
    if (!collections.length) return;
    if (urlSlug) {
      const col = collections.find((c) => c.slug === urlSlug);
      if (col && col.id !== activeColId) setActiveColId(col.id);
    }
  }, [urlSlug, collections]);

  // Sync URL productId -> selectedId
  useEffect(() => {
    if (urlProductId && urlProductId !== selectedId) setSelectedId(urlProductId);
  }, [urlProductId]);
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('medium');
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New collection form
  const [showNewCol, setShowNewCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  // Add product
  const [urlInput, setUrlInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [scrapeWarning, setScrapeWarning] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Add shop
  const [shopName, setShopName] = useState('');
  const [shopSortBy, setShopSortBy] = useState<'name' | 'domain' | 'products'>('name');
  const [shopUrl, setShopUrl] = useState('');

  const activeCol = collections.find((c) => c.id === activeColId);
  const selected = products.find((p) => p.id === selectedId) ?? null;
  const filtered = showArchived ? products : products.filter((p) => !p.archived);
  const sorted = sortProducts(filtered, sortBy);
  const archivedCount = products.filter((p) => p.archived).length;
  const compareProducts = sorted.filter((p) => compareIds.has(p.id)).sort((a, b) => a.price - b.price);

  function selectProduct(id: string | null) {
    setSelectedId(id);
    if (activeCol) {
      navigate(id ? `/c/${activeCol.slug}/${id}` : `/c/${activeCol.slug}`, { replace: true });
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

  async function handleCreateCollection() {
    if (!newColName.trim()) return;
    const color = COLORS[collections.length % COLORS.length];
    const col = await createCollection(newColName.trim(), color);
    if (col) {
      setActiveColId(col.id);
      setNewColName('');
      setShowNewCol(false);
    }
  }

  async function handleAddProduct() {
    if (!urlInput.trim() || !activeColId || !user || adding) return;
    setAdding(true);
    setScrapeWarning('');
    const cleaned = cleanUrl(urlInput.trim());
    const domain = extractDomain(cleaned);
    let baseUrl = '';
    try { baseUrl = new URL(cleaned).origin; } catch { /* ignore */ }

    // Try scraping metadata
    let scraped: { title?: string; image_url?: string; price?: number; shop_name?: string; error?: string } = {};
    let scrapeFailed = false;
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url: cleaned },
      });
      if (!error && data && !data.error) {
        scraped = data;
      } else {
        scrapeFailed = true;
        setScrapeWarning(data?.error || 'Could not fetch product details. You can fill them in manually.');
      }
    } catch {
      scrapeFailed = true;
      setScrapeWarning('Could not fetch product details. You can fill them in manually.');
    }

    // Auto-add shop if domain is new
    const shopDisplayName = scraped.shop_name || domain;
    const existingShop = shops.find((s) => s.domain === domain);
    if (!existingShop) {
      await createShop({ collection_id: activeColId, name: shopDisplayName, domain, url: baseUrl || undefined });
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

  async function handleAddShop() {
    if (!shopName.trim() || !activeColId) return;
    const domain = shopUrl ? shopUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : '';
    await createShop({ collection_id: activeColId, name: shopName.trim(), domain, url: shopUrl || undefined });
    setShopName('');
    setShopUrl('');
  }

  function toggleCompareId(id: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  // ─── Render ───
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 antialiased text-sm">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-[#1c1e2a] flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-6 py-6">
          <span className="text-xl tracking-tight text-white font-serif">
            shelf<span className="text-amber-400">r</span>
          </span>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-6 pb-3 text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Collections</p>
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => switchCollection(c.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left text-[13px] transition-all duration-150 ${activeColId === c.id ? 'text-white bg-white/8' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/4'}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
            </button>
          ))}
          {collections.length === 0 && (
            <p className="px-6 py-6 text-xs text-neutral-600">No collections yet.</p>
          )}
        </nav>

        {/* New collection */}
        <div className="p-4 border-t border-neutral-700">
          {showNewCol ? (
            <div className="flex flex-col gap-2">
              <input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                placeholder="Collection name"
                autoFocus
                className="text-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreateCollection} className="flex-1 !text-xs">Create</Button>
                <Button variant="ghost" onClick={() => { setShowNewCol(false); setNewColName(''); }} className="!text-neutral-500">Cancel</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewCol(true)} className="w-full py-2.5 text-xs text-neutral-500 border border-neutral-700 rounded hover:border-neutral-500 hover:text-neutral-300 transition-all flex items-center justify-center gap-1.5">
              <RiAddLine size={14} /> New collection
            </button>
          )}
        </div>

        {/* User */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-neutral-600 flex items-center justify-center text-[11px] text-neutral-300 font-medium">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-xs text-neutral-400 truncate flex-1">{user?.email}</span>
          </div>
          <Button variant="ghost" onClick={signOut} className="w-full !text-neutral-500 hover:!text-neutral-300">
            <RiLogoutBoxRLine size={14} /> Sign out
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!activeCol ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <RiBookmarkLine size={28} className="text-neutral-300" />
              </div>
              <h2 className="text-lg font-semibold text-[#1c1e2a] mb-1 font-serif">Welcome to Shelfr</h2>
              <p className="text-xs text-neutral-400 mb-4">Create a collection to start tracking products.</p>
              <Button onClick={() => setShowNewCol(true)}>
                <RiAddLine size={14} /> New collection
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Topbar */}
            <header className="bg-white border-b border-neutral-200/80 px-6 h-16 flex items-center gap-4 flex-shrink-0">
              <button className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-neutral-100" onClick={() => setSidebarOpen(true)}>
                <RiMenuLine size={20} />
              </button>
              <h1 className="flex-1 text-[18px] font-semibold text-[#1c1e2a] tracking-tight truncate font-serif">
                {activeCol.name}
              </h1>
              {!compareMode ? (
                <>
                  <Button variant="secondary" onClick={() => { setCompareMode(true); setSelectedId(null); setCompareIds(new Set()); setShowCompare(false); }}>
                    <RiScalesLine size={14} /> Compare
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full">{compareIds.size} selected</span>
                  <Button disabled={compareIds.size < 2} onClick={() => setShowCompare(true)}>Compare now</Button>
                  <Button variant="secondary" onClick={() => { setCompareMode(false); setCompareIds(new Set()); setShowCompare(false); }}>Cancel</Button>
                </>
              )}
            </header>

            {/* Tabs + Sort + View toggle — single row */}
            <div className="bg-white border-b border-neutral-200/80 px-6 flex items-center gap-1 flex-shrink-0">
              {([
                { key: 'products' as const, label: 'Products', Icon: RiShoppingBag3Line },
                { key: 'shops' as const, label: 'Shops', Icon: RiStore2Line },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); if (t.key === 'shops') setSelectedId(null); }}
                  className={`px-4 py-3 text-xs border-b-2 -mb-px transition-all flex items-center gap-1.5 ${tab === t.key ? 'border-[#1c1e2a] text-[#1c1e2a] font-medium' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                  <t.Icon size={14} /> {t.label}
                </button>
              ))}

              {tab === 'products' && !showCompare && (
                <>
                  <div className="w-px h-5 bg-neutral-200 mx-3" />
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mr-1">Sort</span>
                  {(['rating', 'price', 'status'] as SortKey[]).map((s) => (
                    <button key={s} onClick={() => setSortBy(s)} className={`text-[11px] px-2.5 py-1 rounded capitalize transition-all ${sortBy === s ? 'bg-[#1c1e2a] text-white font-medium' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}>
                      {s === 'rating' ? 'Stars' : s}
                    </button>
                  ))}
                </>
              )}

              <div className="flex-1" />

              {tab === 'products' && !showCompare && (
                <div className="flex items-center gap-3">
                  {archivedCount > 0 && (
                    <button onClick={() => setShowArchived(!showArchived)} className={`text-[11px] flex items-center gap-1 transition-all ${showArchived ? 'text-[#1c1e2a] font-medium' : 'text-neutral-400 hover:text-neutral-600'}`}>
                      <RiArchiveLine size={13} /> {showArchived ? 'Hide' : 'Show'} archived ({archivedCount})
                    </button>
                  )}
                  <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
                    {([
                      { key: 'big' as ViewMode, Icon: RiGridFill },
                      { key: 'medium' as ViewMode, Icon: RiGridLine },
                      { key: 'list' as ViewMode, Icon: RiListCheck },
                    ]).map((v) => (
                      <button key={v.key} onClick={() => setViewMode(v.key)} className={`p-1.5 transition-all ${viewMode === v.key ? 'bg-[#1c1e2a] text-white' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}>
                        <v.Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {/* Product grid/list */}
                {tab === 'products' && !showCompare && viewMode !== 'list' && (
                  <div className={viewMode === 'big' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'}>
                    {sorted.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => compareMode ? toggleCompareId(p.id) : selectProduct(p.id)}
                        className={`bg-white rounded overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 group shadow-sm hover:shadow-md
                          ${p.archived ? 'opacity-50' : ''}
                          ${selectedId === p.id ? 'ring-2 ring-[#1c1e2a] shadow-lg' : p.status === 'winner' && !p.archived ? 'ring-1 ring-amber-300/60' : ''}
                          ${compareMode && compareIds.has(p.id) ? 'ring-2 ring-[#1c1e2a] shadow-lg' : ''}`}
                      >
                        {compareMode && (
                          <div className={`absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center z-10 ${compareIds.has(p.id) ? 'bg-[#1c1e2a] text-white' : 'bg-white/90 border border-neutral-300 text-transparent'}`}>
                            <RiCheckLine size={12} />
                          </div>
                        )}
                        {!compareMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateProduct(p.id, { archived: !p.archived }); }}
                            title={p.archived ? 'Unarchive' : 'Archive'}
                            className={`absolute top-3 right-3 z-10 p-1 rounded bg-white/80 backdrop-blur-sm transition-all ${p.archived ? 'text-amber-500 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-600'}`}
                          >
                            <RiArchiveLine size={14} />
                          </button>
                        )}
                        <div className={`w-full bg-neutral-100 relative overflow-hidden ${viewMode === 'big' ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <RiImageLine size={viewMode === 'big' ? 48 : 36} className="text-neutral-300" />
                            </div>
                          )}
                          {!compareMode && (
                            <div className="absolute top-2.5 left-2.5 z-10 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
                              <StarRating rating={p.rating} size={12} onRate={(r) => updateProduct(p.id, { rating: r })} />
                            </div>
                          )}
                        </div>
                        <div className={viewMode === 'big' ? 'p-5' : 'p-4'}>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{p.shop_name}</p>
                          <p className={`font-medium leading-snug mb-2.5 line-clamp-2 font-serif ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'} ${viewMode === 'big' ? 'text-[15px]' : 'text-[13px]'}`}>{p.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold ${p.archived ? 'text-neutral-400' : 'text-[#1c1e2a]'} ${viewMode === 'big' ? 'text-[17px]' : 'text-[15px]'}`}>${Number(p.price).toLocaleString()}</span>
                            {p.price < p.original_price && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                <RiArrowDownSLine size={11} />${Number(p.original_price - p.price).toLocaleString()}
                              </span>
                            )}
                            {p.status !== 'considering' && <Badge status={p.status as ProductStatus} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List view */}
                {tab === 'products' && !showCompare && viewMode === 'list' && (
                  <div className="flex flex-col gap-2">
                    {sorted.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => compareMode ? toggleCompareId(p.id) : selectProduct(p.id)}
                        className={`bg-white rounded overflow-hidden cursor-pointer flex items-center gap-4 shadow-sm hover:shadow-md transition-all
                          ${p.archived ? 'opacity-50' : ''}
                          ${selectedId === p.id ? 'ring-2 ring-[#1c1e2a]' : p.status === 'winner' && !p.archived ? 'ring-1 ring-amber-300/60' : ''}
                          ${compareMode && compareIds.has(p.id) ? 'ring-2 ring-[#1c1e2a]' : ''}`}
                      >
                        {compareMode && (
                          <div className={`ml-4 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${compareIds.has(p.id) ? 'bg-[#1c1e2a] text-white' : 'border border-neutral-300 text-transparent'}`}>
                            <RiCheckLine size={12} />
                          </div>
                        )}
                        <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
                          {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : (
                            <div className="w-full h-full flex items-center justify-center"><RiImageLine size={20} className="text-neutral-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 py-3 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-medium text-[#1c1e2a] truncate font-serif">{p.title}</p>
                            <Badge status={p.status as ProductStatus} showLabel />
                          </div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{p.shop_name}</p>
                        </div>
                        <div className="w-24 flex-shrink-0 flex justify-center">
                          <StarRating rating={p.rating} size={12} onRate={(r) => updateProduct(p.id, { rating: r })} />
                        </div>
                        <div className="w-24 flex-shrink-0 text-right">
                          <span className={`text-[15px] font-semibold ${p.archived ? 'text-neutral-400 line-through' : 'text-[#1c1e2a]'}`}>${Number(p.price).toLocaleString()}</span>
                        </div>
                        <div className="w-10 flex-shrink-0 flex justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateProduct(p.id, { archived: !p.archived }); }}
                            title={p.archived ? 'Unarchive' : 'Archive'}
                            className={`p-1 rounded hover:bg-neutral-100 transition-colors ${p.archived ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500'}`}
                          >
                            <RiArchiveLine size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Compare table */}
                {tab === 'products' && showCompare && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => setShowCompare(false)} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1"><RiArrowLeftLine size={14} /> Back</button>
                      <h2 className="text-[15px] font-semibold text-[#1c1e2a] font-serif">Comparing {compareProducts.length} products</h2>
                    </div>
                    <div className="overflow-x-auto bg-white rounded shadow-sm">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-neutral-100">
                            {['#', '', 'Product', 'Price', 'Shop', 'Status', 'Rating', 'Pros', 'Cons'].map((h) => (
                              <th key={h} className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compareProducts.map((p, i) => (
                            <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                              <td className="py-4 px-4">
                                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-semibold ${i === 0 ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-400'}`}>{i + 1}</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden">
                                  {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><RiImageLine size={16} className="text-neutral-300" /></div>}
                                </div>
                              </td>
                              <td className="py-4 px-4 font-medium text-[#1c1e2a] font-serif max-w-32">{p.title}</td>
                              <td className="py-4 px-4 font-semibold text-[#1c1e2a]">${Number(p.price).toLocaleString()}</td>
                              <td className="py-4 px-4 text-neutral-500">{p.shop_name}</td>
                              <td className="py-4 px-4"><Badge status={p.status as ProductStatus} showLabel /></td>
                              <td className="py-4 px-4"><StarRating rating={p.rating} size={12} interactive={false} /></td>
                              <td className="py-4 px-4 text-neutral-500 max-w-28">{p.pros.join(', ') || '--'}</td>
                              <td className="py-4 px-4 text-neutral-500 max-w-28">{p.cons.join(', ') || '--'}</td>
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
                    <p className="text-xs text-neutral-400 mb-5">Shops discovered for this collection. This list keeps growing even when products are removed.</p>
                    <div className="bg-white rounded shadow-sm overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-neutral-100">
                            {([
                              { key: 'name' as const, label: 'Shop' },
                              { key: 'domain' as const, label: 'Domain' },
                              { key: 'products' as const, label: 'Products' },
                            ]).map((col) => (
                              <th
                                key={col.key}
                                onClick={() => setShopSortBy(col.key)}
                                className={`text-left py-3.5 px-5 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors ${shopSortBy === col.key ? 'text-[#1c1e2a]' : 'text-neutral-400 hover:text-neutral-600'}`}
                              >
                                {col.label}{shopSortBy === col.key ? ' ↓' : ''}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...shops]
                            .map((s) => ({ ...s, _count: products.filter((p) => p.shop_domain === s.domain && !p.archived).length }))
                            .sort((a, b) => {
                              if (shopSortBy === 'products') return b._count - a._count;
                              if (shopSortBy === 'domain') return a.domain.localeCompare(b.domain);
                              return a.name.localeCompare(b.name);
                            })
                            .map((s) => {
                            const count = s._count;
                            return (
                            <tr key={s.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                              <td className="py-3.5 px-5 font-medium text-[#1c1e2a] flex items-center gap-2.5">
                                <RiStore2Line size={15} className="text-neutral-400" /> {s.name}
                              </td>
                              <td className="py-3.5 px-5">
                                {s.domain ? (
                                  <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#1c1e2a] flex items-center gap-1.5 group">
                                    {s.domain} <RiExternalLinkLine size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                ) : <span className="text-neutral-300">--</span>}
                              </td>
                              <td className="py-3.5 px-5 text-neutral-500">
                                {count > 0 ? `${count} product${count !== 1 ? 's' : ''}` : <span className="text-neutral-300">--</span>}
                              </td>
                            </tr>
                            );
                          })}
                          {shops.length === 0 && (
                            <tr><td colSpan={3} className="py-8 text-center text-neutral-400">No shops yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-2.5 mt-5">
                      <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" className="flex-1 text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400" />
                      <input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="URL (optional)" className="flex-[1.5] text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400" />
                      <Button onClick={handleAddShop}>Add</Button>
                    </div>
                  </div>
                )}

                {/* Empty products state */}
                {tab === 'products' && !showCompare && products.length === 0 && (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <RiShoppingBag3Line size={32} className="text-neutral-300 mx-auto mb-3" />
                      <p className="text-xs text-neutral-400">No products yet. Paste a URL below to add one.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Drawer ── */}
              {selected && !compareMode && tab === 'products' && (
                <aside className="w-80 flex-shrink-0 bg-white border-l border-neutral-200/80 flex flex-col overflow-hidden">
                  <div
                    className="relative w-full aspect-[4/3] bg-neutral-100 flex-shrink-0 overflow-hidden group"
                    onPaste={(e) => {
                      // Handle pasted image URL from clipboard text
                      const text = e.clipboardData.getData('text/plain').trim();
                      if (text && (text.startsWith('http://') || text.startsWith('https://')) && /\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(text)) {
                        updateProduct(selected.id, { image_url: text });
                        e.preventDefault();
                      }
                      // Handle pasted image file from clipboard
                      const items = e.clipboardData.items;
                      for (const item of items) {
                        if (item.type.startsWith('image/')) {
                          const file = item.getAsFile();
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                updateProduct(selected.id, { image_url: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          e.preventDefault();
                          break;
                        }
                      }
                    }}
                    tabIndex={0}
                  >
                    {selected.image_url ? (
                      <img src={selected.image_url} alt={selected.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <RiImageLine size={40} className="text-neutral-300" />
                        <p className="text-[11px] text-neutral-400">Click here and paste an image</p>
                      </div>
                    )}
                    {/* Change image overlay */}
                    {selected.image_url && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-[11px] text-white font-medium">Paste to replace image</p>
                      </div>
                    )}
                    <button onClick={() => selectProduct(null)} className="absolute top-3 right-3 w-8 h-8 rounded bg-white/90 text-neutral-400 flex items-center justify-center hover:text-neutral-600 shadow-sm z-10">
                      <RiCloseLine size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                    <div>
                      {selected.source_url ? (
                        <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-neutral-400 hover:text-[#1c1e2a] mb-1 font-medium uppercase tracking-wider flex items-center gap-1 group transition-colors">
                          {selected.shop_name}
                          <RiExternalLinkLine size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <p className="text-[10px] text-neutral-400 mb-1 font-medium uppercase tracking-wider">{selected.shop_name}</p>
                      )}
                      <input
                        value={selected.title}
                        onChange={(e) => updateProduct(selected.id, { title: e.target.value })}
                        className="text-base font-semibold text-[#1c1e2a] leading-snug font-serif w-full bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors pb-0.5"
                        placeholder="Product name"
                      />
                    </div>

                    {/* Price */}
                    <div className="bg-neutral-50 rounded p-3.5">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-2xl font-bold text-[#1c1e2a]">$</span>
                        <input
                          type="number"
                          value={selected.price || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateProduct(selected.id, { price: val });
                          }}
                          className="text-2xl font-bold text-[#1c1e2a] bg-transparent w-28 border-b border-transparent hover:border-neutral-300 focus:border-neutral-400 focus:outline-none transition-colors"
                          placeholder="0"
                        />
                      </div>
                      {selected.price < selected.original_price && (
                        <p className="text-[11px] text-neutral-400">Was ${Number(selected.original_price).toLocaleString()} &middot; saved ${Number(selected.original_price - selected.price).toLocaleString()}</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Your rating</p>
                      <StarRating rating={selected.rating} size={18} onRate={(r) => updateProduct(selected.id, { rating: r })} />
                      {!selected.rating && <p className="text-[11px] text-neutral-300 mt-1">Not rated yet</p>}
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Decision status</p>
                      <StatusPicker value={selected.status as ProductStatus} onChange={(s) => updateProduct(selected.id, { status: s })} />
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Notes</p>
                      <textarea
                        value={selected.notes}
                        onChange={(e) => updateProduct(selected.id, { notes: e.target.value })}
                        placeholder="What do you think about this one?..."
                        className="w-full text-xs border border-neutral-200 rounded p-3 bg-white resize-none focus:outline-none focus:border-neutral-400 leading-relaxed min-h-20"
                        rows={3}
                      />
                    </div>

                    {/* Pros & Cons */}
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Pros & Cons</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/60 rounded p-3">
                          <p className="text-[11px] font-semibold text-emerald-600 mb-2">Pros</p>
                          {selected.pros.map((pro, i) => (
                            <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5"><span className="text-emerald-500">+</span>{pro}</div>
                          ))}
                          <button onClick={() => {
                            const v = prompt('Add a pro:');
                            if (v) updateProduct(selected.id, { pros: [...selected.pros, v] });
                          }} className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-emerald-300 hover:text-emerald-600 mt-1 flex items-center gap-1">
                            <RiAddLine size={12} /> add
                          </button>
                        </div>
                        <div className="bg-red-50/60 rounded p-3">
                          <p className="text-[11px] font-semibold text-red-500 mb-2">Cons</p>
                          {selected.cons.map((con, i) => (
                            <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5"><span className="text-red-400">&minus;</span>{con}</div>
                          ))}
                          <button onClick={() => {
                            const v = prompt('Add a con:');
                            if (v) updateProduct(selected.id, { cons: [...selected.cons, v] });
                          }} className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-red-300 hover:text-red-500 mt-1 flex items-center gap-1">
                            <RiAddLine size={12} /> add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {selected.source_url && selected.source_url !== '' && (
                        <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-500 hover:text-[#1c1e2a] flex items-center gap-1.5 font-medium">
                          <RiExternalLinkLine size={14} /> View on shop
                        </a>
                      )}
                      <div className="flex-1" />
                      <button onClick={() => { updateProduct(selected.id, { archived: !selected.archived }); selectProduct(null); }} className="text-xs text-neutral-400 hover:text-amber-600 flex items-center gap-1">
                        <RiArchiveLine size={13} /> {selected.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button onClick={() => { removeProduct(selected.id); selectProduct(null); }} className="text-xs text-neutral-300 hover:text-red-500 flex items-center gap-1">
                        <RiDeleteBinLine size={13} />
                      </button>
                    </div>
                  </div>
                </aside>
              )}
            </div>

            {/* URL input bar */}
            {tab === 'products' && (
              <div className="bg-white border-t border-neutral-200/80 px-6 py-3.5 flex flex-col gap-2 flex-shrink-0">
                {scrapeWarning && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded">
                    <span className="flex-1">{scrapeWarning}</span>
                    <button onClick={() => setScrapeWarning('')} className="text-amber-400 hover:text-amber-600"><RiCloseLine size={14} /></button>
                  </div>
                )}
                <div className="flex gap-2.5">
                <div className="flex-1 flex items-center gap-2.5 border border-neutral-200 rounded bg-neutral-50 px-4 focus-within:border-neutral-400 focus-within:bg-white transition-all">
                  <RiLink size={15} className="text-neutral-300 flex-shrink-0" />
                  <input
                    id="urlinput"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                    placeholder="Paste a product URL to add..."
                    className="flex-1 text-xs py-2.5 bg-transparent focus:outline-none text-neutral-700 placeholder:text-neutral-400"
                  />
                </div>
                <Button onClick={handleAddProduct} disabled={adding}>{adding ? 'Fetching...' : <><RiAddLine size={14} /> Add</>}</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
