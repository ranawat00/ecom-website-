import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Phone, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';
import { Analytics } from '../../utils/analytics';
import '../../assets/styles/AuthModal.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const AuthModal = ({ isOpen, onClose }) => {
  const { fetchCart } = useCart();

  // ─── Mode: 'login' | 'signup' ─────────────────────────────
  const [mode, setMode] = useState('login');

  // ─── Step: 'phone' | 'otp' ────────────────────────────────
  const [step, setStep] = useState('phone');

  // ─── Form fields ──────────────────────────────────────────
  const [mobileNo, setMobileNo] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState(''); // Optional email field
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));

  // ─── State ────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [countdown, setCountdown] = useState(0);

  const digitRefs = useRef([]);
  const timerRef = useRef(null);

  // Reset modal fully when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setMobileNo('');
      setUsername('');
      setEmail('');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setCountdown(0);
      clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Countdown timer for resend button
  const startCountdown = useCallback(() => {
    clearInterval(timerRef.current);
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ─── Send OTP ─────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    
    // If resending, clear previous digits
    if (step === 'otp') {
      setOtpDigits(Array(OTP_LENGTH).fill(''));
    }

    if (!/^[6-9]\d{9}$/.test(mobileNo)) {
      return setError('Please enter a valid 10-digit Indian mobile number.');
    }
    if (mode === 'signup' && !username.trim()) {
      return setError('Please enter your full name.');
    }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/send-otp', { mobileNo });
      if (data.success) {
        toast.success('OTP sent! Check your phone.');
        setStep('otp');
        startCountdown();
        // Auto-focus first OTP box
        setTimeout(() => digitRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP digit input handlers ─────────────────────────────
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otpDigits];
    next[index] = value.slice(-1); // one digit per box
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtpDigits(pasted.split(''));
      digitRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  // ─── Verify OTP ───────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setError('');

    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      return setError('Please enter all 6 digits of the OTP.');
    }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/verify-otp', {
        mobileNo,
        otp,
        isNew: mode === 'signup',
        username: username.trim(),
        email: email.trim() || undefined // Pass email only if provided
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('loginTimestamp', Date.now().toString());
        toast.success(data.message);
        
        // Track client-side event for network visibility
        if (data.isNew || mode === 'signup') {
          Analytics.signup('OTP');
        } else {
          Analytics.login('OTP');
        }

        window.dispatchEvent(new CustomEvent('authChange', { detail: { isNew: data.isNew } }));
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Try again.';
      setError(msg);
      // Shake and clear OTP boxes on error
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => digitRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = mobileNo
    ? `+91 ${mobileNo.slice(0, 2)}${'*'.repeat(6)}${mobileNo.slice(-2)}`
    : '';

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep('phone');
    setError('');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal otp-modal">
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrap">
            {step === 'phone' ? <Phone size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h2>
            {step === 'phone'
              ? (mode === 'login' ? 'Welcome Back' : 'Create Account')
              : 'Enter OTP'}
          </h2>
          <p>
            {step === 'phone'
              ? (mode === 'login'
                  ? 'Sign in with your mobile number'
                  : 'Join with your mobile number')
              : `We sent a 6-digit code to ${maskedPhone}`}
          </p>
        </div>

        {error && <div className="auth-error otp-error">{error}</div>}

        {/* ── Step 1: Phone ─────────────────────────────────── */}
        {step === 'phone' && (
          <form className="auth-form" onSubmit={handleSendOTP}>
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Mobile Number</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  autoFocus={mode === 'login'}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>

            <div className="auth-footer">
              {mode === 'login' ? (
                <p>New here? <span onClick={() => switchMode('signup')} className="auth-toggle-link">Create Account</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => switchMode('login')} className="auth-toggle-link">Sign In</span></p>
              )}
            </div>
          </form>
        )}

        {/* ── Step 2: OTP Verification ──────────────────────── */}
        {step === 'otp' && (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <div className="otp-boxes-row" onPaste={handleDigitPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (digitRefs.current[i] = el)}
                  className="otp-digit-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : (mode === 'login' ? '✅ Confirm & Sign In' : '✅ Confirm & Sign Up')}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="otp-back-btn"
                onClick={() => { setStep('phone'); setError(''); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
              >
                <ArrowLeft size={14} /> Change Number
              </button>

              {countdown > 0 ? (
                <span className="otp-resend-timer">
                  Resend in {countdown}s
                </span>
              ) : (
                <button type="button" className="otp-resend-btn" onClick={handleSendOTP} disabled={loading}>
                  <RefreshCw size={14} /> Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default React.memo(AuthModal);
