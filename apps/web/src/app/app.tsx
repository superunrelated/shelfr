import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = lazy(() =>
  import('../pages/Landing').then((m) => ({ default: m.LandingPage }))
);
const AuthPage = lazy(() =>
  import('../pages/Auth').then((m) => ({ default: m.AuthPage }))
);
const HomePage = lazy(() =>
  import('../pages/Home').then((m) => ({ default: m.HomePage }))
);
const PrivacyPage = lazy(() =>
  import('../pages/Privacy').then((m) => ({ default: m.PrivacyPage }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-neutral-400">
        Loading...
      </div>
    );
  }
  if (user) return <Navigate to="/shelfs" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route
          path="/shelfs"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shelfs/:slug"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shelfs/:slug/:productId"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
