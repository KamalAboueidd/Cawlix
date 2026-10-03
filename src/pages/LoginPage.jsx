import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/tracker` },
      });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter a valid email address.');
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

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(error.message);
        } else {
          window.location.href = '/tracker';
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/tracker` },
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '40px 16px 28px 16px',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      color: '#EDEDED',
    }}>
      {/* Top Anchor Brand */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L6 14V34L24 44L42 34V14L24 4Z" stroke="#3ECF8E" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 14L14 20V30L24 36L34 30V20L24 14Z" fill="rgba(62, 207, 142, 0.12)" stroke="#3ECF8E" strokeWidth="1.75" />
            <circle cx="24" cy="24" r="3" fill="#3ECF8E" />
          </svg>
        </a>
      </div>

      {/* Form Shell: Max 380px Vercel / Supabase Spec */}
      <div style={{
        maxWidth: '380px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '32px',
        backgroundColor: 'rgba(13, 13, 13, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxSizing: 'border-box',
        marginBottom: 'auto',
      }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
            Sign in to Cawlix
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
            Enter your telemetry terminal and monitoring engine.
          </p>
        </header>

        {/* 1-Click Exclusive Google Provider */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              height: '40px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              color: '#EDEDED',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ position: 'relative', backgroundColor: '#0D0D0D', padding: '0 8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#525252', letterSpacing: '0.06em' }}>
            OR
          </span>
        </div>

        {/* Auth Method Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '18px', gap: '16px' }}>
          <button
            type="button"
            onClick={() => setMode('password')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: mode === 'password' ? '#3ECF8E' : '#737373',
              borderBottom: mode === 'password' ? '2px solid #3ECF8E' : 'none',
              padding: '0 0 8px 0',
              cursor: 'pointer',
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
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: mode === 'magic' ? '#3ECF8E' : '#737373',
              borderBottom: mode === 'magic' ? '2px solid #3ECF8E' : 'none',
              padding: '0 0 8px 0',
              cursor: 'pointer',
            }}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="react-email" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
              EMAIL ADDRESS
            </label>
            <input
              id="react-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#EDEDED',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono, monospace)',
                padding: '0 14px',
                height: '40px',
                borderRadius: '6px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3ECF8E'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
            />
          </div>

          {mode === 'password' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="react-password" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  PASSWORD
                </label>
                <a href="#reset" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: '#737373', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <input
                id="react-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '0 14px',
                  height: '40px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3ECF8E'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
            </div>
          )}

          {errorMsg && (
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#EF4444', lineHeight: 1.4 }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#3ECF8E', lineHeight: 1.4 }}>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#3ECF8E',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '0.875rem',
              height: '40px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 150ms ease',
              width: '100%',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#34B27B'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#3ECF8E'; }}
          >
            {loading ? 'Processing...' : (mode === 'password' ? 'Continue with Email' : 'Send Magic Link')}
          </button>
        </form>

        {/* Footer */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
            Don't have an account? <a href="/register" style={{ color: '#EDEDED', textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '10px', marginBottom: 0, lineHeight: 1.5 }}>
            By signing in, you agree to the Cawlix Telemetry Terms and Security Protocol.
          </p>
        </footer>
      </div>

      {/* Bottom Telemetry */}
      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#525252', letterSpacing: '0.04em', textAlign: 'center', marginTop: '32px' }}>
        <span style={{ color: '#3ECF8E' }}>●</span> ALL RECOGNITION NODES OPERATIONAL · STRICT ENCRYPTION (AES-256)
      </div>
    </div>
  );
}
