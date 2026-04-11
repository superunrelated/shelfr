import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { RiBookmarkLine } from '@remixicon/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@shelfr/ui';

export function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/c" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded bg-[#1c1e2a] flex items-center justify-center">
            <RiBookmarkLine size={18} className="text-white" />
          </div>
          <span
            className="text-2xl font-semibold tracking-tight text-[#1c1e2a]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            shelf<span className="text-amber-500">r</span>
          </span>
        </div>

        {/* Form */}
        <div className="bg-white rounded shadow-sm border border-neutral-200/80 p-6">
          <h2
            className="text-lg font-semibold text-[#1c1e2a] mb-1"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            {mode === 'signin'
              ? 'Sign in to your account'
              : 'Start tracking your product research'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="you@example.com"
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
                minLength={6}
                className="w-full text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} fullWidth>
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-4">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[#1c1e2a] font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-[#1c1e2a] font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
        <Link
          to="/privacy"
          className="text-[11px] text-neutral-300 hover:text-neutral-500 transition-colors text-center mt-6 block"
        >
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
