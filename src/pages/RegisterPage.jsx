import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import cawlixLogo from '../assets/ICon.png';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getReturnTo = () => {
  if (typeof window === 'undefined') return '/console';
  const params = new URLSearchParams(window.location.search);
  const target = params.get('returnTo');
  return target && target.startsWith('/') ? target : '/console';
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef([]);

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

  // Cooldown countdown for resending code
  useEffect(() => {
    if (step !== 'otp' || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Focus first input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [step]);

  const handleGoogleSignup = async () => {
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${getReturnTo()}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google registration failed.');
      setLoading(false);
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work or personal email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must include both letters and numbers for telemetry entropy.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.session) {
        window.location.href = getReturnTo();
      } else {
        // Transition to OTP verification step
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setResendCooldown(60);
        setSuccessMsg(`✓ Verification code sent to ${cleanEmail}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMsg('');

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);
    setErrorMsg('');

    const nextFocus = Math.min(digits.length, 5);
    inputRefs.current[nextFocus]?.focus();

    if (digits.length === 6) {
      handleVerifyOtp(digits);
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const token = (codeToVerify || otp.join('')).trim();
    if (token.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'signup',
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired code.');
        setLoading(false);
      } else if (data?.session || data?.user) {
        window.location.href = getReturnTo();
      } else {
        window.location.href = '/console';
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please retry.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to resend code.');
      } else {
        setResendCooldown(60);
        setSuccessMsg('✓ New verification code sent to your inbox.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
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
        <a
          href="/"
          aria-label="Return to Cawlix Terminal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'transform 150ms ease, opacity 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <img
            src={cawlixLogo}
            alt="Cawlix Logo"
            width={28}
            height={28}
            style={{ width: '28px', height: '28px', objectFit: 'contain', display: 'block' }}
          />
          <span style={{
            fontSize: '1.1875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}>
            Cawlix
          </span>
        </a>
      </div>

      {/* Form Shell: Max 400px Container Bounds */}
      <div style={{
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '32px',
        backgroundColor: '#0A0A0A',
        boxSizing: 'border-box',
        marginBottom: 'auto',
      }}>
        {step === 'form' ? (
          <div>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                Create your account
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Deploy your telemetry terminal and monitoring engine.
              </p>
            </header>

            {/* 1-Click Exclusive Google Provider */}
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignup}
                style={{
                  width: '100%',
                  height: '44px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Institutional Divider */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '22px 0' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
              <span style={{ position: 'relative', backgroundColor: '#0D0D0D', padding: '0 8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#525252', letterSpacing: '0.06em' }}>
                OR
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="react-reg-email" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#737373', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  WORK OR PERSONAL EMAIL
                </label>
                <input
                  id="react-reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  style={{
                    backgroundColor: '#0D0D0D',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#EDEDED',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0 14px',
                    height: '44px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3ECF8E'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="react-reg-password" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#737373', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  CREATE PASSWORD
                </label>
                <input
                  id="react-reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    backgroundColor: '#0D0D0D',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#EDEDED',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0 14px',
                    height: '44px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3ECF8E'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#525252', marginTop: '6px' }}>
                  Minimum 8 characters with letters and numbers.
                </span>
              </div>

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
                  height: '44px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: 'none',
                  transition: 'background-color 150ms ease, opacity 150ms ease',
                  width: '100%',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#34B27B'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#3ECF8E'; }}
              >
                {loading ? 'CONNECTING...' : 'Create Account'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: 6-Digit OTP Verification in Cawlix aesthetic */
          <div>
            <header style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                Verify Your Email
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Enter the 6-digit verification code sent to:
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#EDEDED', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3ECF8E',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Edit
                </button>
              </div>
            </header>

            {/* 6 Segmented OTP Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                marginBottom: '18px',
              }}
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#0D0D0D',
                    border: digit ? '1px solid #3ECF8E' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#EDEDED',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono, monospace)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3ECF8E')}
                  onBlur={(e) => (e.target.style.borderColor = digit ? '#3ECF8E' : 'rgba(255, 255, 255, 0.12)')}
                />
              ))}
            </div>

            {errorMsg && (
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#EF4444', lineHeight: 1.4, marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#3ECF8E', lineHeight: 1.4, marginBottom: '14px' }}>
                {successMsg}
              </div>
            )}

            <button
              type="button"
              disabled={loading || otp.some((d) => d === '')}
              onClick={() => handleVerifyOtp()}
              style={{
                backgroundColor: '#3ECF8E',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: '0.875rem',
                height: '44px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading || otp.some((d) => d === '') ? 'not-allowed' : 'pointer',
                opacity: loading || otp.some((d) => d === '') ? 0.6 : 1,
                boxShadow: 'none',
                transition: 'background-color 150ms ease, opacity 150ms ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (!loading && otp.every((d) => d !== '')) {
                  e.currentTarget.style.backgroundColor = '#34B27B';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#3ECF8E';
                }
              }}
            >
              {loading ? 'VERIFYING...' : 'Verify Code & Continue'}
            </button>

            {/* Resend and Back actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#737373',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResend}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendCooldown > 0 ? '#525252' : '#3ECF8E',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: resendCooldown > 0 || loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                }}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code ↻'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
            Already have an account? <a href="/login" style={{ color: '#3ECF8E', textDecoration: 'none', fontWeight: 600 }}>Log in</a>
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '10px', marginBottom: 0, lineHeight: 1.5 }}>
            By signing up, you agree to the Cawlix Telemetry Terms and Security Protocol.
          </p>
        </footer>
      </div>
    </div>
  );
}
