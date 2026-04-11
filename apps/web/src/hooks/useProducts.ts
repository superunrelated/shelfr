import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Product } from '@shelfr/shared';

export function useProducts(collectionId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setProducts(data ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(
    product: Partial<Product> & { collection_id: string; user_id: string }
  ) {
    const { data, error: err } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    if (data) setProducts((prev) => [data, ...prev]);
    return data;
  }

  // Optimistic update — apply locally first, reconcile with server
  async function update(id: string, changes: Partial<Product>) {
    // Optimistic: apply immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );

    const { data, error: err } = await supabase
      .from('products')
      .update(changes)
      .eq('id', id)
      .select()
      .single();

    if (err) {
      // Revert on failure
      setError(err.message);
      fetch();
      return null;
    }
    // Reconcile with server response
    if (data) setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }

  async function remove(id: string) {
    // Optimistic
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error: err } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      fetch();
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    products,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetch,
    clearError,
  };
}
