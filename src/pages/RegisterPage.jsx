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

/** Mask user email for privacy (e.g. j***e@domain.com) */
function maskEmail(emailStr) {
  if (!emailStr || !emailStr.includes('@')) return emailStr || '';
  const [userPart, domain] = emailStr.split('@');
  if (userPart.length <= 2) {
    return `${userPart[0]}*@${domain}`;
  }
  const first = userPart[0];
  const last = userPart[userPart.length - 1];
  const starsCount = Math.min(Math.max(userPart.length - 2, 2), 4);
  return `${first}${'*'.repeat(starsCount)}${last}@${domain}`;
}

export default function RegisterPage() {
  // Step 1: Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Flow State: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Step 2: 6-Digit OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isShaking, setIsShaking] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Refs for 6 OTP input boxes
  const inputRefs = useRef([]);

  // Auto-redirect if session already exists
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

  // Cooldown Countdown Timer for Resend Code
  useEffect(() => {
    if (step !== 'otp' || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Trigger error shake animation
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  // Google OAuth Signup
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
        triggerShake();
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google registration failed.');
      triggerShake();
      setLoading(false);
    }
  };

  // Step 1: Submit email & password to trigger OTP
  const handleInitialSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work or personal email address.');
      triggerShake();
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      triggerShake();
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must include both letters and numbers for telemetry entropy.');
      triggerShake();
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
        triggerShake();
      } else if (data?.session) {
        // If Supabase has email auto-confirm enabled, session is directly established
        window.location.href = getReturnTo();
      } else {
        // Normal production flow: Email OTP verification dispatched
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setResendCooldown(60);
        setSuccessMsg(`✓ Cryptographic verification code dispatched to ${cleanEmail}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration dispatch failed.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP box input
  const handleOtpChange = (index, value) => {
    const char = value.slice(-1); // Only take latest char
    if (char && !/^\d$/.test(char)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMsg('');

    // Auto-focus next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are filled, automatically attempt verification
    if (char && index === 5 && newOtp.every((d) => d !== '')) {
      executeVerifyOtp(newOtp.join(''));
    }
  };

  // Step 2: Handle backspace & navigation keys
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Focus previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
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

  // Step 2: Clipboard Auto-Paste Across All 6 Inputs
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text') || '';
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);
    setErrorMsg('');

    // Focus the next empty box or the last box
    const nextIdx = Math.min(digits.length, 5);
    inputRefs.current[nextIdx]?.focus();

    // If 6 digits pasted, auto-trigger verification immediately
    if (digits.length === 6) {
      executeVerifyOtp(digits);
    }
  };

  // Step 2: Verify 6-Digit OTP with Supabase
  const executeVerifyOtp = async (codeToVerify) => {
    const token = (codeToVerify || otp.join('')).trim();
    if (token.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the cryptographic code.');
      triggerShake();
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
        setErrorMsg(error.message || 'Invalid or expired verification code.');
        triggerShake();
        setLoading(false);
      } else if (data?.session || data?.user) {
        // Persistence verified, redirect directly into Telemetry Console
        window.location.href = getReturnTo();
      } else {
        // Fallback session retrieval
        const { data: refreshedSession } = await supabase.auth.getSession();
        if (refreshedSession?.session) {
          window.location.href = getReturnTo();
        } else {
          window.location.href = '/login?verified=true';
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please retry.');
      triggerShake();
      setLoading(false);
    }
  };

  // Step 2: Resend Code with 60s Cooldown
  const handleResendCode = async () => {
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
        setErrorMsg(error.message || 'Failed to resend verification code.');
        triggerShake();
      } else {
        setResendCooldown(60);
        setSuccessMsg('✓ New 6-digit verification code dispatched.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Resend request failed.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0F17',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px 16px 28px 16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        color: '#F8FAFC',
      }}
    >
      <style>{`
        @keyframes cawlixShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes cawlixPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.92); }
        }
        .cawlix-otp-box:focus {
          border-color: #9F1239 !important;
          box-shadow: 0 0 0 1px #9F1239, 0 0 18px rgba(159, 18, 57, 0.4) !important;
        }
      `}</style>

      {/* Top Anchor Brand */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
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
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <img
            src={cawlixLogo}
            alt="Cawlix Logo"
            width={28}
            height={28}
            style={{ width: '28px', height: '28px', objectFit: 'contain', display: 'block' }}
          />
          <span
            style={{
              fontSize: '1.1875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Cawlix
          </span>
        </a>
      </div>

      {/* Main Container Shell (Vercel / Linear / Stripe Dark Aesthetic) */}
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '32px 28px',
          backgroundColor: '#0E131F',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          boxSizing: 'border-box',
          marginBottom: 'auto',
          animation: isShaking ? 'cawlixShake 500ms ease' : 'none',
          transition: 'all 200ms ease',
        }}
      >
        {/* Telemetry Indicator Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(159, 18, 57, 0.12)',
              border: '1px solid rgba(159, 18, 57, 0.35)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#FDA4AF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#E11D48',
                boxShadow: '0 0 8px #E11D48',
                animation: 'cawlixPulse 2s infinite',
              }}
            />
            <span>Cawlix Auth Engine · {step === 'form' ? 'Step 1/2' : 'Step 2/2'}</span>
          </div>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 'form' ? (
          <div>
            <header style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                Create your account
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Deploy your telemetry terminal and monitoring engine.
              </p>
            </header>

            {/* Google OAuth Provider */}
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignup}
                style={{
                  width: '100%',
                  height: '42px',
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
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }
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

            {/* Divider */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
              <span style={{ position: 'relative', backgroundColor: '#0E131F', padding: '0 8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#64748B', letterSpacing: '0.06em' }}>
                OR ENTER CREDENTIALS
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleInitialSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label
                  htmlFor="react-reg-email"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: '#94A3B8',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
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
                    backgroundColor: '#080C14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0 14px',
                    height: '42px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#9F1239')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label
                  htmlFor="react-reg-password"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: '#94A3B8',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
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
                    backgroundColor: '#080C14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0 14px',
                    height: '42px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#9F1239')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', color: '#64748B', marginTop: '6px' }}>
                  Minimum 8 characters with letters & numbers.
                </span>
              </div>

              {errorMsg && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: '#FDA4AF',
                    backgroundColor: 'rgba(159, 18, 57, 0.18)',
                    border: '1px solid rgba(159, 18, 57, 0.4)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    lineHeight: 1.4,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: '#3ECF8E',
                    backgroundColor: 'rgba(62, 207, 142, 0.1)',
                    border: '1px solid rgba(62, 207, 142, 0.3)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    lineHeight: 1.4,
                  }}
                >
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#9F1239',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: '42px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 0 16px rgba(159, 18, 57, 0.3)',
                  transition: 'background-color 150ms ease, opacity 150ms ease',
                  width: '100%',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#BE123C';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#9F1239';
                }}
              >
                {loading ? 'DISPATCHING TELEMETRY OTP...' : 'Send Verification Code →'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: Production 6-Digit OTP Verification Screen */
          <div>
            <header style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                Verify Your Identity
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Enter the 6-digit cryptographic verification code sent to:
              </p>

              {/* Masked Email Badge + Edit Button */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '10px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#080C14',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)', color: '#F1F5F9', fontWeight: 600 }}>
                  {maskEmail(email)}
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
                    color: '#FDA4AF',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Edit
                </button>
              </div>
            </header>

            {/* 6-Box Segmented OTP Input Grid */}
            <div style={{ margin: '22px 0 16px 0' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
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
                    className="cawlix-otp-box"
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: '#080C14',
                      border: digit ? '1px solid #9F1239' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono, monospace)',
                      outline: 'none',
                      transition: 'border-color 140ms ease, box-shadow 140ms ease',
                      boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  color: '#FDA4AF',
                  backgroundColor: 'rgba(159, 18, 57, 0.18)',
                  border: '1px solid rgba(159, 18, 57, 0.4)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  lineHeight: 1.4,
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  color: '#3ECF8E',
                  backgroundColor: 'rgba(62, 207, 142, 0.1)',
                  border: '1px solid rgba(62, 207, 142, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  lineHeight: 1.4,
                  marginBottom: '14px',
                }}
              >
                {successMsg}
              </div>
            )}

            {/* Verify CTA */}
            <button
              type="button"
              disabled={loading || otp.some((d) => d === '')}
              onClick={() => executeVerifyOtp()}
              style={{
                backgroundColor: '#9F1239',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: '44px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading || otp.some((d) => d === '') ? 'not-allowed' : 'pointer',
                opacity: loading || otp.some((d) => d === '') ? 0.6 : 1,
                boxShadow: '0 0 16px rgba(159, 18, 57, 0.3)',
                transition: 'background-color 150ms ease, opacity 150ms ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.02em',
                marginBottom: '14px',
              }}
              onMouseEnter={(e) => {
                if (!loading && otp.every((d) => d !== '')) {
                  e.currentTarget.style.backgroundColor = '#BE123C';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#9F1239';
                }
              }}
            >
              {loading ? 'VALIDATING CRYPTOGRAPHIC TOKEN...' : 'Verify Code & Launch Terminal'}
            </button>

            {/* Resend Code Ticker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
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
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendCode}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendCooldown > 0 ? '#64748B' : '#FDA4AF',
                  cursor: resendCooldown > 0 || loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: resendCooldown > 0 ? 400 : 600,
                  textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                }}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code ↻'}
              </button>
            </div>
          </div>
        )}

        {/* Institutional Footer */}
        <footer style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#FDA4AF', textDecoration: 'none', fontWeight: 600 }}>
              Log in
            </a>
          </p>
          <p style={{ fontSize: '10px', color: '#64748B', marginTop: '8px', marginBottom: 0, lineHeight: 1.5, fontFamily: 'var(--font-mono, monospace)' }}>
            Secured by Cawlix Telemetry Protocol & Supabase Cryptographic Vault.
          </p>
        </footer>
      </div>
    </div>
  );
}
