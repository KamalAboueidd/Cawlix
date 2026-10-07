import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import cawlixLogo from '../assets/ICon.png';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        if (active && data?.session) {
          window.location.href = '/console';
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
    if (step !== 'verify' || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Focus first input when entering OTP step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [step]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: '#F59E0B' };
    return { score: 3, label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(newPassword);

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
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setStep('verify');
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

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResendCooldown(60);
        setSuccessMsg(`New recovery code dispatched to ${cleanEmail}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend code.');
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
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    const otpCode = otp.join('').trim();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

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
      const cleanEmail = email.trim().toLowerCase();

      // 1. Verify OTP with recovery type
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otpCode,
        type: 'recovery',
      });

      if (verifyErr) {
        setErrorMsg(verifyErr.message || 'Invalid or expired recovery code.');
        setLoading(false);
        return;
      }

      // 2. Update user password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setErrorMsg(updateErr.message || 'Failed to update password.');
        setLoading(false);
        return;
      }

      setSuccessMsg('✓ Password updated successfully. Access granted.');
      setTimeout(() => {
        window.location.href = '/console';
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset procedure failed.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px 16px 28px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'transform 150ms ease, opacity 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
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

      {/* Auth Shell Card */}
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '32px',
          backgroundColor: '#0D1117',
          boxSizing: 'border-box',
          marginBottom: 'auto',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.6875rem',
              color: '#10B981',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            TELEMETRY RECOVERY ENGINE
          </div>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {step === 'request' ? 'Reset Password' : 'Enter Recovery Code'}
          </h1>
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#71717A',
              marginTop: '8px',
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            {step === 'request'
              ? 'Enter your account email to receive a 6-digit verification code.'
              : `Enter the 6-digit code dispatched to ${email}`}
          </p>
        </header>

        {/* Phase 1: Request Email */}
        {step === 'request' ? (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="recovery-email"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
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
                  backgroundColor: '#05070A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  padding: '0 14px',
                  height: '44px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#F43F5E',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
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
                  fontSize: '0.8125rem',
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
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
                backgroundColor: '#10B981',
                color: '#05070A',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: '44px',
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
                if (!loading) e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#10B981';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="16"
                    height="16"
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
        ) : (
          /* Phase 2: 6-Slot OTP + Password Setup */
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Target Email Banner & Edit Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Target: <span style={{ color: '#F4F4F5', fontWeight: 500 }}>{email}</span>
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
                  color: '#10B981',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '2px 6px',
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
                  fontWeight: 600,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>6-DIGIT RECOVERY CODE</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
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
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      height: '50px',
                      backgroundColor: '#05070A',
                      border: digit ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                      color: '#10B981',
                      outline: 'none',
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10B981';
                      e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                    }}
                    onBlur={(e) => {
                      if (!digit) e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.target.style.boxShadow = 'none';
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
                  color: resendCooldown > 0 ? '#52525B' : '#10B981',
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

            {/* New Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="new-password"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                NEW PASSWORD
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={{
                  backgroundColor: '#05070A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  padding: '0 14px',
                  height: '44px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />

              {/* Password strength visualizer */}
              {newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
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
                  fontWeight: 600,
                  color: '#A1A1AA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                CONFIRM NEW PASSWORD
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{
                  backgroundColor: '#05070A',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  padding: '0 14px',
                  height: '44px',
                  borderRadius: '6px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#F43F5E',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
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
                  fontSize: '0.8125rem',
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
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
                backgroundColor: '#10B981',
                color: '#05070A',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: '44px',
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
                if (!loading) e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#10B981';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Verifying & Updating...</span>
                </>
              ) : (
                'Set New Password & Connect'
              )}
            </button>
          </form>
        )}

        {/* Footer Link back to Sign In */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: '#71717A', margin: 0 }}>
            Remembered credentials?{' '}
            <a href="/login" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
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
