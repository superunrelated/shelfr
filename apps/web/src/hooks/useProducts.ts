import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Product } from '@shelfr/shared';

export function useProducts(collectionId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(product: Partial<Product> & { collection_id: string; user_id: string }) {
    const { data } = await supabase.from('products').insert(product).select().single();
    if (data) setProducts((prev) => [data, ...prev]);
    return data;
  }

  async function update(id: string, changes: Partial<Product>) {
    const { data } = await supabase
      .from('products')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (data) setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }

  async function remove(id: string) {
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return { products, loading, create, update, remove, refetch: fetch };
}
