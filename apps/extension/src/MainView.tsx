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

  // Restore remembered collection
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

  // Get current tab info
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

      // Try the scrape edge function for richer metadata
      let title = tabInfo.title;
      let imageUrl: string | null = null;
      let price: number | null = null;
      let shopName = domain;

      try {
        const { data: scrapeData } = await supabase.functions.invoke(
          'scrape-url',
          {
            body: { url },
          }
        );
        if (scrapeData) {
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

      // Upsert shop
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">
          shelfr
        </h1>
        <button
          onClick={onLogout}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Current page */}
      <div className="px-4 py-3 bg-white border-b border-stone-200">
        <p className="text-xs text-stone-400 mb-1">Current page</p>
        <p className="text-sm text-stone-700 font-medium truncate">
          {tabInfo?.title ?? 'Loading...'}
        </p>
        {tabInfo?.url && (
          <p className="text-xs text-stone-400 truncate mt-0.5">
            {extractDomain(tabInfo.url)}
          </p>
        )}
      </div>

      {/* Collection picker */}
      <div className="px-4 py-3">
        <label className="block text-xs font-medium text-stone-500 mb-1.5">
          Save to collection
        </label>
        {loading ? (
          <div className="text-sm text-stone-400">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-sm text-stone-400">
            No collections yet. Create one in the Shelfr app first.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedId ?? ''}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-stone-300 bg-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent cursor-pointer"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-stone-400"
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
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
            <span className="text-xs text-stone-400">{selected.name}</span>
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-4 pb-4 mt-auto">
        {errorMsg && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2">
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={
            !selectedId || addState === 'adding' || isChromePage || !tabInfo
          }
          className={`w-full py-3 rounded-lg text-sm font-medium transition-all
            ${
              addState === 'success'
                ? 'bg-emerald-600 text-white'
                : addState === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
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
