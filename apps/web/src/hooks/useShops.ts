import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Shop } from '@shelfr/shared';

export function useShops(collectionId: string | null) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setShops([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shops')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setShops(data ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(shop: {
    collection_id: string;
    name: string;
    domain: string;
    url?: string;
  }) {
    const { data, error: err } = await supabase
      .from('shops')
      .insert(shop)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    if (data) setShops((prev) => [...prev, data]);
    return data;
  }

  function clearError() {
    setError(null);
  }

  return { shops, loading, error, create, refetch: fetch, clearError };
}
