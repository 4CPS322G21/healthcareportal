import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { createClient } from '@supabase/supabase-js';
import backendUrl from '../apiConfig';

function PatientResetPassword() {
  // Password requirements check
  function getPasswordRequirements(password) {
    const requirements = [];
    if (password.length < 8) requirements.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('At least one lowercase letter');
    if (!/\d/.test(password)) requirements.push('At least one number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) requirements.push('At least one special character');
    return requirements;
  }

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendMessage, setResendMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isRequestingOtp, setIsRequestingOtp] = React.useState(false);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) {
            setResendMessage('');
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);
  const [showRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Now that password is defined, we can safely compute requirements
  const passwordRequirements = getPasswordRequirements(password);

  const handleRequestOtp = async () => {
  // Remove usage of 'e' since it's not passed from button click
    setError('');
    setIsRequestingOtp(true);
    if (!email || !email.trim()) {
      setError('Please enter your email.');
      setIsRequestingOtp(false);
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/patient/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes('security purposes')) {
          // Extract seconds from error message
          const match = data.error.match(/after (\d+) seconds/);
          if (match) {
            setResendCooldown(Number(match[1]));
            setResendMessage(data.error);
          }
        }
        if (!data.error.includes('security purposes')) {
          setError(data.error || 'Failed to send OTP.');
        }
        setIsRequestingOtp(false);
        return;
      }
  setOtpSent(true);
  setError('');
  setResendCooldown(0);
  setResendMessage('');
  setSuccessMessage('OTP has been resent to your email.');
    } catch (err) {
      setError('Server error.');
    }
    setIsRequestingOtp(false);
  };
  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/patient/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setOtpVerified(true);
        setSuccessMessage('OTP verified! You can now set your password.');
      } else {
        setError(data.error || 'Invalid OTP.');
      }
    } catch (e) {
      setError('Failed to verify OTP.');
    }
    setLoading(false);
  };

  // Supabase client setup
  const SUPABASE_URL = 'https://xjdstsoceomfftanuhjy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZHN0c29jZW9tZmZ0YW51aGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjMxOTEsImV4cCI6MjA3MDEzOTE5MX0.Gxo9ctAls5hCVMh_MsfANFstc64cL2uuiVaaHjWViAE';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!password || !confirmPassword) {
        setError('Please enter and confirm your password.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      // Strong password validation
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        setLoading(false);
        return;
      }
      // Hash new password before updating (SHA256)
      const hashedPassword = CryptoJS.SHA256(password.trim()).toString();
      // Update password in patients table for the given email
      const { error: updateError } = await supabase
        .from('patients')
        .update({ password: hashedPassword })
        .eq('email', email.trim());
      if (updateError) {
        setError('Failed to update password.');
        setLoading(false);
        return;
      }
  setSuccessMessage('Password set! You can now log in.');
  // small delay so user reads message
  setTimeout(() => window.location.href = '/patient/login', 900);
    } catch (e) {
      setError('Error setting password.');
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 18, boxShadow: '0 4px 16px rgba(33,147,176,0.12)', maxWidth: 'min(92vw, 400px)', width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#0d3b66', marginBottom: 24 }}>Set Your Password</h2>
        {!otpSent && (
          <form onSubmit={e => { e.preventDefault(); handleRequestOtp(); }}>
            <div className="input-group" style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder=" "
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b0c4de', boxSizing: 'border-box' }}
                required
              />
              <label htmlFor="reset-email" style={{ position: 'absolute', left: 12, top: 10, background: 'white', padding: '0 4px', color: '#888', pointerEvents: 'none', transition: '0.2s', fontSize: 14 }}>Email</label>
            </div>
            <button type="submit" disabled={loading || isRequestingOtp} style={{ width: '100%', padding: 12, background: '#0d3b66', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10 }}>{isRequestingOtp ? 'Requesting...' : 'Request OTP'}</button>
          </form>
        )}
        {otpSent && !otpVerified && (
          <form onSubmit={e => { e.preventDefault(); handleVerifyOtp(); }}>
            <div className="input-group" style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="text"
                id="reset-otp"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder=" "
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b0c4de', boxSizing: 'border-box' }}
                required
              />
              <label htmlFor="reset-otp" style={{ position: 'absolute', left: 12, top: 10, background: 'white', padding: '0 4px', color: '#888', pointerEvents: 'none', transition: '0.2s', fontSize: 14 }}>OTP</label>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10 }}>Verify OTP</button>
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: '1rem' }}>
              Haven't got the email yet?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{resendMessage ? resendMessage : `For security purposes, you can only request this after ${resendCooldown} seconds.`}</span>
              ) : (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: isRequestingOtp ? 'default' : 'pointer', fontSize: '1rem', padding: 0 }}
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp}
                >
                  {isRequestingOtp ? 'Resending...' : 'Resend email'}
                </button>
              )}
            </div>
          </form>
        )}
        {otpVerified && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group" style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="password"
                id="reset-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                placeholder=" "
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b0c4de', boxSizing: 'border-box' }}
                required
              />
              <label htmlFor="reset-password" style={{ position: 'absolute', left: 12, top: 10, background: 'white', padding: '0 4px', color: '#888', pointerEvents: 'none', transition: '0.2s', fontSize: 14 }}>Create Password</label>
            </div>
            {passwordTouched && passwordRequirements.length > 0 && (
              <ul style={{ color: '#d32f2f', margin: '6px 0 0 0', fontSize: '0.95rem', paddingLeft: 18 }}>
                {passwordRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            )}
            <div className="input-group" style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="password"
                id="reset-confirm-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder=" "
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b0c4de', boxSizing: 'border-box' }}
                required
              />
              <label htmlFor="reset-confirm-password" style={{ position: 'absolute', left: 12, top: 10, background: 'white', padding: '0 4px', color: '#888', pointerEvents: 'none', transition: '0.2s', fontSize: 14 }}>Confirm Password</label>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#0d3b66', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10 }}>Set Password</button>
          </form>
        )}
        {successMessage && (
          <div style={{ color: '#2e7d32', marginTop: 16, textAlign: 'center' }}>
            {successMessage}
          </div>
        )}
        {error && (
          <div style={{ color: '#d32f2f', marginTop: 16, textAlign: 'center' }}>
            {error}
            {showRegister && (
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: 16 }}
                  onClick={() => window.location.href = '/patient/register'}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientResetPassword;
