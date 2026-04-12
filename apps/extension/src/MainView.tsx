import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { getSelectedCollection, setSelectedCollection } from './storage';
import type { Collection } from '@shelfr/shared';
import { cleanUrl, extractDomain } from '@shelfr/shared';

interface MainViewProps {
  userId: string;
  onLogout: () => void;
}

type AddState = 'idle' | 'adding' | 'success' | 'error';

function buttonClass(state: AddState) {
  if (state === 'success') return 'bg-emerald-600 text-white';
  if (state === 'error') return 'bg-red-500 text-white';
  return 'bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] disabled:opacity-40 disabled:cursor-default';
}

export function MainView({ userId, onLogout }: MainViewProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addState, setAddState] = useState<AddState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [tabInfo, setTabInfo] = useState<{ url: string; title: string } | null>(
    null
  );

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
      if (tab?.url && tab?.title) {
        setTabInfo({ url: tab.url, title: tab.title });
      }
    });
  }, []);

  function handleCollectionChange(id: string) {
    setSelectedId(id);
    setSelectedCollection(id);
  }

  async function handleAdd() {
    if (!selectedId || !tabInfo) return;

    setAddState('adding');
    setErrorMsg('');

    try {
      const url = cleanUrl(tabInfo.url);
      const domain = extractDomain(url);

      let title = tabInfo.title;
      let imageUrl: string | null = null;
      let price: number | null = null;
      let shopName = domain;

      try {
        const { data: scrapeData } = await supabase.functions.invoke(
          'scrape-url',
          { body: { url } }
        );
        if (scrapeData && !scrapeData.error) {
          title = scrapeData.title || title;
          imageUrl = scrapeData.image_url || null;
          price = scrapeData.price || null;
          shopName = scrapeData.shop_name || domain;
        }
      } catch {
        // Scrape failed — continue with tab metadata
      }

      const { error } = await supabase.from('products').insert({
        user_id: userId,
        collection_id: selectedId,
        title,
        source_url: url,
        image_url: imageUrl,
        price: price ?? 0,
        currency: 'NZD',
        shop_name: shopName,
        shop_domain: domain,
        status: 'considering',
        notes: '',
        rating: 0,
        quantity: 1,
        archived: false,
        added_by: userId,
      });

      if (error) throw error;

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

      {/* Current page */}
      <div className="px-4 py-3 bg-white border-b border-neutral-200/80">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">
          Current page
        </p>
        <p className="text-xs text-[#1c1e2a] font-medium truncate">
          {tabInfo?.title ?? 'Loading...'}
        </p>
        {tabInfo?.url && (
          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
            {extractDomain(tabInfo.url)}
          </p>
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
            !selectedId || addState === 'adding' || isChromePage || !tabInfo
          }
          className={`w-full py-2.5 rounded text-xs font-medium transition-all duration-150 ${buttonClass(addState)}`}
        >
          {addState === 'adding' && 'Saving...'}
          {addState === 'success' && 'Saved to shelf!'}
          {addState === 'error' && 'Failed to save'}
          {addState === 'idle' &&
            (isChromePage ? 'Cannot save Chrome pages' : 'Add to shelf')}
        </button>
      </div>
    </div>
  );
}
