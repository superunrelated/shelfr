import { useState } from 'react';
import { supabase } from './supabase';

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin();
    }
  }

  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Logo — matches web Auth page */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-9 h-9 rounded bg-[#1c1e2a] flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-[18px] h-[18px] text-white fill-current"
          >
            <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.537A.5.5 0 014 22.143V3a1 1 0 011-1z" />
          </svg>
        </div>
        <span
          className="text-2xl font-semibold tracking-tight text-[#1c1e2a]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          shelf<span className="text-amber-500">r</span>
        </span>
      </div>

      {/* Card — matches web Auth card */}
      <div className="w-full bg-white rounded shadow-sm border border-neutral-200/80 p-5">
        <h2
          className="text-lg font-semibold text-[#1c1e2a] mb-1"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          Welcome back
        </h2>
        <p className="text-xs text-neutral-400 mb-5">
          Sign in to save products
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white
                         focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 6 characters"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white
                         focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-[#1c1e2a] text-white text-xs font-medium
                       hover:bg-[#2a2d3d] disabled:opacity-40 disabled:cursor-default transition-all duration-150"
          >
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
