import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@shelfr/shared';
import type { Product } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export interface ShoppingListItem extends Product {
  collection: {
    id: string;
    name: string;
    slug: string;
    color: string;
    archived: boolean;
  } | null;
}

export function useShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*, collection:collections(id, name, slug, color, archived)')
      .eq('status', 'winner')
      .eq('archived', false);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as ShoppingListItem[];
    setItems(rows.filter((r) => r.collection && !r.collection.archived));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, error, refetch: fetch };
}
