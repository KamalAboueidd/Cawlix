import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import cawlixLogo from '../assets/ICon.png';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Cryptographically secure strong password generator
function generateStrongPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*-_+=';

  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const res = [pick(upper), pick(lower), pick(numbers), pick(symbols)];
  const all = upper + lower + numbers + symbols;

  for (let i = 0; i < 12; i++) {
    res.push(pick(all));
  }

  // Fisher-Yates shuffle
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }

  return res.join('');
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify_otp' | 'new_password'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef([]);

  // Check if session already active
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active && data?.session && step === 'request') {
          window.location.href = '/console';
        }
      } catch {
        // Ignore session read errors
      }
    })();
    return () => {
      active = false;
    };
  }, [step]);

  // Cooldown countdown for resending code
  useEffect(() => {
    if (step !== 'verify_otp' || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Focus first input when entering OTP step
  useEffect(() => {
    if (step === 'verify_otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [step]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#27272A' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#FB7185' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: '#FBBF24' };
    return { score: 3, label: 'Strong', color: '#34D399' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSuggestPassword = async () => {
    const strong = generateStrongPassword();
    setNewPassword(strong);
    setConfirmPassword(strong);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setErrorMsg('');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(strong);
      }
    } catch {
      // ignore clipboard error
    }
  };

  // Step 1: Request recovery email
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work or personal email address.');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/forgot-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setStep('verify_otp');
        setOtp(['', '', '', '', '', '']);
        setResendCooldown(60);
        setSuccessMsg(`Recovery code dispatched to ${cleanEmail}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch recovery code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectTo = `${window.location.origin}/forgot-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResendCooldown(60);
        setSuccessMsg(`New recovery code dispatched to ${cleanEmail}`);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Inputs
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

    // Auto verify if last digit is filled
    if (char && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerifyOtpDirect(newOtp.join(''));
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
      handleVerifyOtpDirect(digits);
    }
  };

  // Direct OTP verification helper
  const handleVerifyOtpDirect = async (codeStr) => {
    const token = (codeStr || otp.join('')).trim();
    if (token.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit recovery code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'recovery',
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired recovery code.');
      } else {
        setSuccessMsg('✓ Identity verified. Please set your new password.');
        setErrorMsg('');
        setStep('new_password');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    handleVerifyOtpDirect();
  };

  // Step 3: Update Password in Authenticated Recovery Session
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setErrorMsg(updateErr.message || 'Failed to update password.');
        setLoading(false);
        return;
      }

      setSuccessMsg('✓ Password set successfully. You can now log in using either Google or your email and password.');
      setTimeout(() => {
        window.location.href = '/console';
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || 'Password update failed.');
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
        fontFamily: "'Inter', 'Geist', system-ui, -apple-system, sans-serif",
        color: '#EDEDED',
      }}
    >
      {/* Top Brand Mark */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <a
          href="/"
          aria-label="Return to Cawlix Home"
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
            }}
          >
            Cawlix
          </span>
        </a>
      </div>

      {/* Auth Shell Card */}
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          border: '1px solid #27272A',
          borderRadius: '12px',
          padding: '32px',
          backgroundColor: '#0A0A0A',
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
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {step === 'request' && 'Reset Password'}
            {step === 'verify_otp' && 'Enter Recovery Code'}
            {step === 'new_password' && 'Create New Password'}
          </h1>
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#888888',
              marginTop: '8px',
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            {step === 'request' && 'Enter your account email to receive a 6-digit verification code.'}
            {step === 'verify_otp' && `Enter the 6-digit code dispatched to ${email}`}
            {step === 'new_password' && 'Identity verified. Configure your new password below.'}
          </p>
        </header>

        {/* STEP 1: Request Email */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="recovery-email"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                ACCOUNT EMAIL
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #27272A',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  padding: '0 12px',
                  height: '42px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#71717A')}
                onBlur={(e) => (e.target.style.borderColor = '#27272A')}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#F87171',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✕</span>
                <div style={{ wordBreak: 'break-word' }}>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#34D399',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                <div style={{ wordBreak: 'break-word' }}>{successMsg}</div>
              </div>
            )}

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
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#E4E4E7';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Dispatching Code...</span>
                </>
              ) : (
                'Send Recovery Code'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP Only */}
        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Email Banner & Edit Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#111111',
                borderRadius: '6px',
                border: '1px solid #27272A',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Target: <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{email}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EDEDED',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '2px 4px',
                }}
              >
                Change
              </button>
            </div>

            {/* 6-Digit Segmented OTP Input */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>6-DIGIT RECOVERY CODE</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6875rem',
                    color: '#71717A',
                  }}
                >
                  SEC-OTP
                </span>
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      height: '46px',
                      backgroundColor: '#000000',
                      border: digit ? '1px solid #EDEDED' : '1px solid #27272A',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                      padding: 0,
                      transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      if (!digit) e.target.style.borderColor = '#27272A';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Resend Code Trigger */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendCode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#52525B' : '#A1A1AA',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Resend code {resendCooldown > 0 && <span style={{ fontFamily: 'monospace' }}>({resendCooldown}s)</span>}
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#F87171',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✕</span>
                <div style={{ wordBreak: 'break-word' }}>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#34D399',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                <div style={{ wordBreak: 'break-word' }}>{successMsg}</div>
              </div>
            )}

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
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#E4E4E7';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Verifying Code...</span>
                </>
              ) : (
                'Verify Recovery Code'
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Set New Password & Confirm Password */}
        {step === 'new_password' && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Verified Identity Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#34D399', fontWeight: 500 }}>Code verified for {email}</span>
              </div>
            </div>

            {/* New Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  htmlFor="new-password"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#A1A1AA',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  NEW PASSWORD
                </label>
                <button
                  type="button"
                  onClick={handleSuggestPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10B981',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '2px 0',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  title="Generate a high-entropy password"
                >
                  Suggest Strong Password
                </button>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #27272A',
                    color: '#EDEDED',
                    fontSize: '0.875rem',
                    padding: '0 40px 0 12px',
                    height: '42px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: showPassword ? "'JetBrains Mono', monospace" : 'inherit',
                    transition: 'border-color 150ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#71717A')}
                  onBlur={(e) => (e.target.style.borderColor = '#27272A')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#71717A',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength visualizer */}
              {newPassword && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '3px', marginBottom: '4px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '2px',
                        backgroundColor: strength.score >= 1 ? strength.color : '#27272A',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '2px',
                        backgroundColor: strength.score >= 2 ? strength.color : '#27272A',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '2px',
                        backgroundColor: strength.score >= 3 ? strength.color : '#27272A',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: strength.color, fontWeight: 500 }}>
                    Entropy: {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="confirm-password"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                CONFIRM NEW PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #27272A',
                    color: '#EDEDED',
                    fontSize: '0.875rem',
                    padding: '0 40px 0 12px',
                    height: '42px',
                    borderRadius: '6px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: showConfirmPassword ? "'JetBrains Mono', monospace" : 'inherit',
                    transition: 'border-color 150ms ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#71717A')}
                  onBlur={(e) => (e.target.style.borderColor = '#27272A')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#71717A',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#F87171',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✕</span>
                <div style={{ wordBreak: 'break-word' }}>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#34D399',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                <div style={{ wordBreak: 'break-word' }}>{successMsg}</div>
              </div>
            )}

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
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#E4E4E7';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : (
                'Save New Password & Connect'
              )}
            </button>
          </form>
        )}

        {/* Footer Link back to Sign In */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0 }}>
            Remembered credentials?{' '}
            <a href="/login" style={{ color: '#FFFFFF', textDecoration: 'underline', fontWeight: 500 }}>
              Back to sign in
            </a>
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
