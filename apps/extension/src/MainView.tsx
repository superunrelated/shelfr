import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { getSelectedCollection, setSelectedCollection } from './storage';
import type { Collection } from '@shelfr/shared/types';
import { cleanUrl, extractDomain } from '@shelfr/shared/utils';
import { extractFromActiveTab, type ExtractedProduct } from './extract';

function formatPrice(price: number, currency: string | null): string {
  const cur = currency ?? 'NZD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${cur} ${price.toFixed(2)}`;
  }
}

function rid() {
  return crypto.randomUUID().slice(0, 6);
}

function log(reqId: string, step: string, data?: unknown) {
  if (data === undefined) {
    console.log(`[shelfr ${reqId}] ${step}`);
  } else {
    console.log(`[shelfr ${reqId}] ${step}`, data);
  }
}

interface MainViewProps {
  userId: string;
  onLogout: () => void;
}

type AddState = 'idle' | 'adding' | 'success' | 'error';

function buttonClass(state: AddState, duplicate: boolean) {
  if (state === 'success') return 'bg-emerald-600 text-white';
  if (state === 'error') return 'bg-red-500 text-white';
  if (duplicate) {
    return 'bg-neutral-200 text-neutral-500 cursor-default';
  }
  return 'bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] disabled:opacity-40 disabled:cursor-default';
}

export function MainView({ userId, onLogout }: MainViewProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addState, setAddState] = useState<AddState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [tabInfo, setTabInfo] = useState<{
    url: string;
    title: string;
    id: number;
  } | null>(null);
  const [duplicate, setDuplicate] = useState<{ title: string } | null>(null);
  const [preview, setPreview] = useState<ExtractedProduct | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [chosenImage, setChosenImage] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: true });
    setCollections(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (collections.length === 0) return;
    getSelectedCollection().then((savedId) => {
      if (savedId && collections.some((c) => c.id === savedId)) {
        setSelectedId(savedId);
      } else {
        setSelectedId(collections[0].id);
      }
    });
  }, [collections]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url && tab?.title && typeof tab.id === 'number') {
        setTabInfo({ url: tab.url, title: tab.title, id: tab.id });
      }
    });
  }, []);

  useEffect(() => {
    if (!tabInfo) return;
    if (
      tabInfo.url.startsWith('chrome://') ||
      tabInfo.url.startsWith('chrome-extension://')
    ) {
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    extractFromActiveTab(tabInfo.id).then((result) => {
      if (cancelled) return;
      setPreview(result);
      setChosenImage(result?.images[0] ?? result?.imageUrl ?? null);
      setPreviewLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tabInfo]);

  useEffect(() => {
    if (!tabInfo?.url || !selectedId) {
      setDuplicate(null);
      return;
    }
    let cancelled = false;
    const cleaned = cleanUrl(tabInfo.url);
    supabase
      .from('products')
      .select('title')
      .eq('collection_id', selectedId)
      .eq('source_url', cleaned)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setDuplicate(data ? { title: data.title } : null);
      });
    return () => {
      cancelled = true;
    };
  }, [tabInfo?.url, selectedId, addState]);

  function handleCollectionChange(id: string) {
    setSelectedId(id);
    setSelectedCollection(id);
  }

  async function handleAdd() {
    if (!selectedId || !tabInfo || duplicate) return;

    const reqId = rid();
    setAddState('adding');
    setErrorMsg('');

    try {
      const url = cleanUrl(tabInfo.url);
      const domain = extractDomain(url);
      log(reqId, 'start', { url, domain, tabId: tabInfo.id });

      let title = tabInfo.title;
      let imageUrl: string | null = null;
      let price: number | null = null;
      let currency: string | null = null;
      let shopName = domain;

      const dom = preview ?? (await extractFromActiveTab(tabInfo.id));
      log(reqId, 'dom-extract', dom);
      if (dom) {
        if (dom.title) title = dom.title;
        if (dom.imageUrl) imageUrl = dom.imageUrl;
        if (dom.price !== null) price = dom.price;
        if (dom.currency) currency = dom.currency;
        if (dom.shopName) shopName = dom.shopName;
      }
      // User-picked image overrides the extractor's primary guess.
      if (chosenImage) imageUrl = chosenImage;

      try {
        const t0 = performance.now();
        const { data: scrapeData, error: scrapeError } =
          await supabase.functions.invoke('scrape-url', {
            body: {
              url,
              hints: {
                imageUrl: chosenImage ?? dom?.imageUrl ?? null,
                title: dom?.title ?? null,
                price: dom?.price ?? null,
                currency: dom?.currency ?? null,
                shopName: dom?.shopName ?? null,
              },
            },
          });
        log(reqId, 'scrape-url', {
          ms: Math.round(performance.now() - t0),
          error: scrapeError,
          data: scrapeData,
        });
        if (scrapeData && !scrapeData.error) {
          // Server may have rehosted the image to Supabase storage — prefer that URL.
          if (scrapeData.image_url) imageUrl = scrapeData.image_url;
          if (!title || title === tabInfo.title) {
            title = scrapeData.title || title;
          }
          if (price === null && typeof scrapeData.price === 'number') {
            price = scrapeData.price;
          }
          if (!currency && scrapeData.currency) currency = scrapeData.currency;
          if (shopName === domain && scrapeData.shop_name) {
            shopName = scrapeData.shop_name;
          }
        }
      } catch (e) {
        log(reqId, 'scrape-url-threw', e);
      }

      if (price === null) {
        console.warn(
          `[shelfr ${reqId}] no price found — storing 0 (schema is NOT NULL)`
        );
      }
      if (!imageUrl) {
        console.warn(`[shelfr ${reqId}] no image found — storing null`);
      }

      const payload = {
        user_id: userId,
        collection_id: selectedId,
        title,
        source_url: url,
        image_url: imageUrl,
        price: price ?? 0,
        currency: currency ?? 'NZD',
        shop_name: shopName,
        shop_domain: domain,
        status: 'considering',
        notes: '',
        rating: 0,
        quantity: 1,
        archived: false,
        added_by: userId,
      };
      log(reqId, 'insert-product', {
        title,
        price: payload.price,
        currency: payload.currency,
        shop_name: shopName,
        hasImage: !!imageUrl,
      });

      const { error } = await supabase.from('products').insert(payload);

      if (error) {
        log(reqId, 'insert-error', error);
        throw error;
      }
      log(reqId, 'insert-ok');

      await supabase
        .from('shops')
        .upsert(
          { collection_id: selectedId, name: shopName, domain },
          { onConflict: 'collection_id,domain', ignoreDuplicates: true }
        )
        .select();

      setAddState('success');
      setTimeout(() => setAddState('idle'), 2000);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to save product'
      );
      setAddState('error');
      setTimeout(() => setAddState('idle'), 3000);
    }
  }

  const selected = collections.find((c) => c.id === selectedId);
  const isChromePage =
    tabInfo?.url?.startsWith('chrome://') ||
    tabInfo?.url?.startsWith('chrome-extension://');

  return (
    <div className="flex flex-col min-h-[420px]">
      {/* Header — dark sidebar style */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1c1e2a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-white fill-current"
            >
              <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.537A.5.5 0 014 22.143V3a1 1 0 011-1z" />
            </svg>
          </div>
          <span
            className="text-base font-semibold tracking-tight text-white"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            shelf<span className="text-amber-400">r</span>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Preview */}
      <div className="px-4 py-3 bg-white border-b border-neutral-200/80">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">
          Preview
        </p>
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded bg-neutral-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-neutral-200/80">
            {chosenImage ? (
              <img
                src={chosenImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
              />
            ) : (
              <span className="text-[10px] text-neutral-300">
                {previewLoading ? '...' : 'No image'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#1c1e2a] font-medium line-clamp-2 leading-snug">
              {preview?.title ?? tabInfo?.title ?? 'Loading...'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {preview?.price !== null && preview?.price !== undefined && (
                <span className="text-xs text-[#1c1e2a] font-semibold">
                  {formatPrice(preview.price, preview.currency)}
                </span>
              )}
              {tabInfo?.url && (
                <span className="text-[11px] text-neutral-400 truncate">
                  {extractDomain(tabInfo.url)}
                </span>
              )}
            </div>
          </div>
        </div>
        {preview && preview.images.length > 1 && (
          <div className="mt-2.5">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5">
              Choose image
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {preview.images.map((src) => {
                const active = src === chosenImage;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setChosenImage(src)}
                    className={`w-10 h-10 rounded overflow-hidden flex-shrink-0 border transition-all ${
                      active
                        ? 'border-[#1c1e2a] ring-1 ring-[#1c1e2a]'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                    aria-label="Use this image"
                    aria-pressed={active}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.parentElement!.style.display = 'none')
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Collection picker */}
      <div className="px-4 py-3 flex-1">
        <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
          Save to collection
        </label>
        {loading && (
          <div className="text-xs text-neutral-400 py-2">
            Loading collections...
          </div>
        )}
        {!loading && collections.length === 0 && (
          <div className="text-xs text-neutral-400 py-2">
            No collections yet. Create one in the Shelfr app first.
          </div>
        )}
        {!loading && collections.length > 0 && (
          <div className="relative">
            <select
              value={selectedId ?? ''}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="w-full appearance-none text-xs px-3.5 py-2.5 pr-8 rounded border border-neutral-200 bg-white
                         focus:outline-none focus:border-neutral-400 transition-colors cursor-pointer"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-3.5 h-3.5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}

        {selected && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            <span className="text-[11px] text-neutral-400">
              {selected.name}
            </span>
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-4 pb-4">
        {errorMsg && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded mb-2">
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={
            !selectedId ||
            addState === 'adding' ||
            isChromePage ||
            !tabInfo ||
            (addState === 'idle' && !!duplicate)
          }
          className={`w-full py-2.5 rounded text-xs font-medium transition-all duration-150 ${buttonClass(addState, addState === 'idle' && !!duplicate)}`}
        >
          {addState === 'adding' && 'Saving...'}
          {addState === 'success' && 'Saved to shelf!'}
          {addState === 'error' && 'Failed to save'}
          {addState === 'idle' &&
            (isChromePage
              ? 'Cannot save Chrome pages'
              : duplicate
                ? 'Already on this shelf'
                : 'Add to shelf')}
        </button>
        {addState === 'idle' && duplicate && !isChromePage && (
          <p
            className="text-[11px] text-neutral-400 mt-2 truncate"
            title={duplicate.title}
          >
            Saved as "{duplicate.title}"
          </p>
        )}
      </div>
    </div>
  );
}
