import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import cawlixLogo from '../assets/ICon.png';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getReturnTo = () => {
  if (typeof window === 'undefined') return '/console';
  const params = new URLSearchParams(window.location.search);
  const target = params.get('returnTo');
  return target && target.startsWith('/') ? target : '/console';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [loading, setLoading] = useState(false);
  const [highlightGoogle, setHighlightGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check for OAuth / Redirect error from URL hash or query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const error = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

    if (error || errorCode || errorDescription) {
      const rawMsg = errorDescription || error || 'Authentication failed.';
      const cleanMsg = decodeURIComponent(rawMsg.replace(/\+/g, ' '));

      if (
        errorCode === 'identity_already_exists' ||
        cleanMsg.toLowerCase().includes('already exists') ||
        cleanMsg.toLowerCase().includes('already registered')
      ) {
        setErrorMsg('This email is already registered with a password. Please sign in using your email and password below.');
        setMode('password');
      } else {
        setErrorMsg(cleanMsg);
      }

      // Clean the URL without reload
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        const returnToVal = searchParams.get('returnTo');
        const cleanUrl = window.location.pathname + (returnToVal ? `?returnTo=${encodeURIComponent(returnToVal)}` : '');
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  }, []);

  // Session Check & Auto-Redirect on page mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active && data?.session) {
          window.location.href = getReturnTo();
        }
      } catch {
        // Ignore session read errors
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleGoogleAuth = async () => {
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work or personal email address.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'password') {
        if (!password) {
          setErrorMsg('Please enter your password.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes('invalid login credentials') ||
            error.message?.toLowerCase().includes('invalid credentials')
          ) {
            setErrorMsg(
              "Invalid credentials. Try Google sign-in or reset password."
            );
            setHighlightGoogle(true);
            setTimeout(() => setHighlightGoogle(false), 6000);
          } else {
            setErrorMsg(error.message);
          }
        } else if (data?.session) {
          window.location.href = '/console';
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: { emailRedirectTo: `${window.location.origin}/console` },
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('✓ Magic link dispatched. Check your inbox.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px 16px 28px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#EDEDED',
      }}
    >
      {/* Top Anchor Brand with Interactive Hover Motion */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <a
          href="/"
          aria-label="Return to Cawlix Terminal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <img
            src={cawlixLogo}
            alt="Cawlix Logo"
            className="brand-logo-img"
            width={26}
            height={26}
            style={{
              width: '26px',
              height: '26px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: '1.1875rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Cawlix
          </span>
        </a>
      </div>

      {/* Form Shell: Max 400px Container Bounds (Vercel True Black) */}
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          padding: '32px',
          backgroundColor: '#000000',
          boxSizing: 'border-box',
          marginBottom: 'auto',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: '#EDEDED',
              letterSpacing: '-0.02em',
              margin: 0,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Sign in to Cawlix
          </h1>
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#888888',
              marginTop: '6px',
              marginBottom: 0,
              lineHeight: 1.5,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Enter your telemetry terminal and monitoring engine.
          </p>
        </header>

        {/* 1-Click Exclusive Google Provider */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              height: '42px',
              border: highlightGoogle ? '1px solid #10B981' : '1px solid #222222',
              backgroundColor: highlightGoogle ? 'rgba(16, 185, 129, 0.08)' : '#0A0A0A',
              color: '#EDEDED',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 200ms ease',
              fontFamily: "'Geist', sans-serif",
              boxShadow: highlightGoogle
                ? '0 0 16px rgba(16, 185, 129, 0.35), 0 0 0 2px rgba(16, 185, 129, 0.25)'
                : 'none',
              animation: highlightGoogle ? 'pulseGoogle 1.6s infinite ease-in-out' : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = highlightGoogle ? 'rgba(16, 185, 129, 0.15)' : '#111111';
              e.currentTarget.style.borderColor = highlightGoogle ? '#10B981' : '#333333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = highlightGoogle ? 'rgba(16, 185, 129, 0.08)' : '#0A0A0A';
              e.currentTarget.style.borderColor = highlightGoogle ? '#10B981' : '#222222';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Institutional Divider */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '22px 0' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: '#1F1F1F' }} />
          <span
            style={{
              position: 'relative',
              backgroundColor: '#000000',
              padding: '0 10px',
              fontSize: '0.75rem',
              color: '#666666',
              fontWeight: 500,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            OR
          </span>
        </div>

        {/* Auth Method Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1F1F1F', marginBottom: '18px', gap: '20px' }}>
          <button
            type="button"
            onClick={() => setMode('password')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: mode === 'password' ? 500 : 400,
              color: mode === 'password' ? '#EDEDED' : '#666666',
              borderBottom: mode === 'password' ? '2px solid #EDEDED' : '2px solid transparent',
              padding: '0 0 8px 0',
              cursor: 'pointer',
              transition: 'color 150ms ease',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Credentials
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: mode === 'magic' ? 500 : 400,
              color: mode === 'magic' ? '#EDEDED' : '#666666',
              borderBottom: mode === 'magic' ? '2px solid #EDEDED' : '2px solid transparent',
              padding: '0 0 8px 0',
              cursor: 'pointer',
              transition: 'color 150ms ease',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              htmlFor="login-email"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#666666',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                display: 'block',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              WORK OR PERSONAL EMAIL
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              style={{
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                color: '#EDEDED',
                fontSize: '0.875rem',
                padding: '0 12px',
                height: '40px',
                borderRadius: '6px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
                fontFamily: "'Geist Mono', monospace",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#333333')}
              onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')}
            />
          </div>

          {mode === 'password' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#666666',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 0,
                    display: 'block',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  PASSWORD
                </label>
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: '0.75rem',
                    color: '#888888',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EDEDED')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  padding: '0 12px',
                  height: '40px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                  fontFamily: "'Geist Mono', monospace",
                }}
                onFocus={(e) => (e.target.style.borderColor = '#333333')}
                onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')}
              />
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: highlightGoogle ? '#F59E0B' : '#EF4444',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '2px 0',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              <span style={{ fontSize: '0.875rem', lineHeight: 1, flexShrink: 0 }}>
                {highlightGoogle ? '⚠️' : '✕'}
              </span>
              <div style={{ wordBreak: 'break-word' }}>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: '#10B981',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '2px 0',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              <span style={{ fontSize: '0.875rem', lineHeight: 1, flexShrink: 0 }}>✓</span>
              <div style={{ wordBreak: 'break-word' }}>{successMsg}</div>
            </div>
          )}

          {/* Vercel High-Contrast Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontWeight: 500,
              fontSize: '0.875rem',
              height: '42px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 150ms ease, opacity 150ms ease',
              width: '100%',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#E4E4E7';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {loading ? 'Connecting...' : mode === 'password' ? 'Continue with Email' : 'Send Magic Link'}
          </button>
        </form>

        {/* Footer */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0 }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#FFFFFF', textDecoration: 'underline', fontWeight: 500 }}>
              Sign up
            </a>
          </p>
          <p style={{ fontSize: '0.6875rem', color: '#666666', marginTop: '10px', marginBottom: 0, lineHeight: 1.5 }}>
            By signing in, you agree to the Cawlix Telemetry Terms and Security Protocol.
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes pulseGoogle {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5), 0 0 12px rgba(16, 185, 129, 0.3);
            border-color: rgba(16, 185, 129, 0.95);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0), 0 0 20px rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.5);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0), 0 0 12px rgba(16, 185, 129, 0.3);
            border-color: rgba(16, 185, 129, 0.95);
          }
        }
      `}</style>
    </div>
  );
}
