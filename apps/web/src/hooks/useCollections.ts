import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Collection } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setError(null);
    const { data, error: err } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setCollections(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(name: string, color: string) {
    if (!user) return null;
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existingSlugs = new Set(collections.map((c) => c.slug));
    let slug = baseSlug;
    let i = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${i++}`;
    }
    const { data, error: err } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name, slug, color })
      .select()
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    if (data) setCollections((prev) => [...prev, data]);
    return data;
  }

  async function remove(id: string) {
    const { error: err } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  async function archive(id: string, archived: boolean) {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived } : c))
    );
    const { error: err } = await supabase
      .from('collections')
      .update({ archived })
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
    collections,
    loading,
    error,
    create,
    remove,
    archive,
    refetch: fetch,
    clearError,
  };
}
