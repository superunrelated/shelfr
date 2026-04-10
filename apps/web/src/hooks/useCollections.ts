import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { Collection } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: true });
    setCollections(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function create(name: string, color: string) {
    if (!user) return null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name, slug, color })
      .select()
      .single();
    if (data) setCollections((prev) => [...prev, data]);
    return data;
  }

  async function remove(id: string) {
    await supabase.from('collections').delete().eq('id', id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  return { collections, loading, create, remove, refetch: fetch };
}
