import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@shelfr/shared';
import type { Product } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

interface UseProductsOptions {
  onExternalChange?: (
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    product: Product
  ) => void;
}

export function useProducts(
  collectionId: string | null,
  options?: UseProductsOptions
) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onExternalChange = useRef(options?.onExternalChange);
  onExternalChange.current = options?.onExternalChange;

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

  // Realtime helpers (extracted to avoid deep nesting)
  function insertProduct(p: Product) {
    setProducts((prev) =>
      prev.some((x) => x.id === p.id) ? prev : [p, ...prev]
    );
  }
  function replaceProduct(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }
  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  // Realtime subscription for external changes
  useEffect(() => {
    if (!collectionId || !user) return;

    function handleRealtimeChange(payload: {
      eventType: string;
      new: unknown;
      old: unknown;
    }) {
      const newRecord = payload.new as Product;
      const oldRecord = payload.old as Product;

      if (payload.eventType === 'INSERT' && newRecord) {
        insertProduct(newRecord);
        onExternalChange.current?.('INSERT', newRecord);
      } else if (payload.eventType === 'UPDATE' && newRecord) {
        replaceProduct(newRecord);
        onExternalChange.current?.('UPDATE', newRecord);
      } else if (payload.eventType === 'DELETE' && oldRecord) {
        removeProduct(oldRecord.id);
        onExternalChange.current?.('DELETE', oldRecord);
      }
    }

    const channel = supabase
      .channel(`products:${collectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `collection_id=eq.${collectionId}`,
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collectionId, user]);

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
      setError(err.message);
      fetch();
      return null;
    }
    if (data) setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }

  async function remove(id: string) {
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
