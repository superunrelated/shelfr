import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Poll every 30s for new notifications
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [user, fetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function dismiss(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllRead,
    dismiss,
    refetch: fetch,
  };
}
