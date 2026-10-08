/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check active session on initial mount
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('Session retrieval error:', error);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to get session:', err);
        setLoading(false);
      });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      try {
        if (typeof window !== 'undefined') {
          for (let i = window.localStorage.length - 1; i >= 0; i--) {
            const key = window.localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              window.localStorage.removeItem(key);
            }
          }
          window.sessionStorage.clear();
        }
      } catch {
        // Ignore storage errors
      }
      setSession(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Route wrapper that enforces authentication for protected terminal routes.
 * If unauthenticated, immediately redirects to /login with returnTo query param.
 */
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  // Block Back/Forward Cache (BFCache) after sign out
  useEffect(() => {
    const handleBfCacheKill = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    window.addEventListener('pageshow', handleBfCacheKill);
    window.addEventListener('popstate', handleBfCacheKill);

    return () => {
      window.removeEventListener('pageshow', handleBfCacheKill);
      window.removeEventListener('popstate', handleBfCacheKill);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EDEDED',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          letterSpacing: '0.06em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3ECF8E',
              boxShadow: '0 0 10px #3ECF8E',
              display: 'inline-block',
            }}
          />
          <span>VERIFYING TELEMETRY CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    const returnPath = typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '/console';

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(search);
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    const errorCode = hashParams.get('error_code') || searchParams.get('error_code') || hashParams.get('error') || searchParams.get('error');

    let targetUrl = `/login?returnTo=${encodeURIComponent(returnPath)}`;
    if (errorDesc || errorCode) {
      targetUrl = `/login?error=${encodeURIComponent(errorCode || 'oauth_error')}&error_description=${encodeURIComponent(errorDesc || '')}`;
    }

    if (typeof window !== 'undefined') {
      window.location.replace(targetUrl);
    }
    return null;
  }

  return children;
}

/**
 * Route wrapper for public auth pages (login, register).
 * If session exists, auto-redirects directly to /console or returnTo.
 */
export function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#737373',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
        }}
      >
        <span>SYNCHRONIZING SESSION...</span>
      </div>
    );
  }

  if (session) {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('returnTo') || '/console';
      window.location.replace(target);
    }
    return null;
  }

  return children;
}
