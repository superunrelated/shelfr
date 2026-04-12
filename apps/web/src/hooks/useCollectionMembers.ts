import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import type { CollectionMember } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export type { CollectionMember } from '@shelfr/shared';

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

/** Hook for the current user's pending invitations (across all collections) */
export function useMyInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<CollectionMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('collection_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('accepted', false);
    setInvitations(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function accept(memberId: string) {
    const { error } = await supabase
      .from('collection_members')
      .update({ accepted: true })
      .eq('id', memberId);
    if (error) {
      console.error('Failed to accept invite:', error.message);
    }
    // Always refetch to ensure consistency with DB
    await fetch();
  }

  async function decline(memberId: string) {
    const { error } = await supabase
      .from('collection_members')
      .delete()
      .eq('id', memberId);
    if (error) {
      console.error('Failed to decline invite:', error.message);
    }
    await fetch();
  }

  return { invitations, loading, accept, decline, refetch: fetch };
}
