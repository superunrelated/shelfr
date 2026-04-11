import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { LoginView } from './LoginView';
import { MainView } from './MainView';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-xs text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        onLogin={() => {
          /* re-render triggered by auth state change */
        }}
      />
    );
  }

  return (
    <MainView
      userId={user.id}
      onLogout={async () => {
        await supabase.auth.signOut();
        setUser(null);
      }}
    />
  );
}
