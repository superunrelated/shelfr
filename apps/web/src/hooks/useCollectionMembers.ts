import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export interface CollectionMember {
  id: string;
  collection_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  invited_by: string;
  created_at: string;
  email?: string;
}

export function useCollectionMembers(collectionId: string | null) {
  const { user } = useAuth();
  const [members, setMembers] = useState<CollectionMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!collectionId) {
      setMembers([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('collection_members')
      .select('*')
      .eq('collection_id', collectionId);
    setMembers(data ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function invite(email: string, role: 'viewer' | 'editor') {
    const { data, error } = await supabase.functions.invoke('invite-member', {
      body: { email, collection_id: collectionId, role },
    });
    if (error || data?.error) {
      return { error: data?.error ?? error?.message ?? 'Invite failed' };
    }
    await fetch();
    return { error: null, isNewUser: data?.isNewUser };
  }

  async function remove(memberId: string) {
    await supabase.from('collection_members').delete().eq('id', memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  async function updateRole(memberId: string, role: 'viewer' | 'editor') {
    await supabase
      .from('collection_members')
      .update({ role })
      .eq('id', memberId);
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
  }

  // Current user's role in this collection (null = owner or not a member)
  const myRole = members.find((m) => m.user_id === user?.id)?.role ?? null;

  return {
    members,
    loading,
    invite,
    remove,
    updateRole,
    myRole,
    refetch: fetch,
  };
}
