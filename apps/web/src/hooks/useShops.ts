import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Shop } from '@shelfr/shared';

export function useShops(collectionId: string | null) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setShops([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('shops')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: true });
    setShops(data ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(shop: { collection_id: string; name: string; domain: string; url?: string }) {
    const { data } = await supabase.from('shops').insert(shop).select().single();
    if (data) setShops((prev) => [...prev, data]);
    return data;
  }

  async function ensureShopExists(collectionId: string, name: string, domain: string) {
    const existing = shops.find((s) => s.domain === domain && s.collection_id === collectionId);
    if (existing) return existing;
    return create({ collection_id: collectionId, name, domain });
  }

  return { shops, loading, create, ensureShopExists, refetch: fetch };
}
