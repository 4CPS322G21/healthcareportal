import React, { useState } from 'react';
import API from '../apiConfig';
import CryptoJS from 'crypto-js';
import supabase from '../supabaseClient';
import './PatientRegister.css';

function PatientRegister() {
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
  // Helper to detect role from email
  function detectRole(email) {
    const studentReg = /^[0-9]+@stu\.unizulu\.ac\.za$/;
    const staffReg1 = /^[A-Za-z]+@unizulu\.ac\.za$/;
    const staffReg2 = /^[A-Za-z]+@stu\.unizulu\.ac\.za$/;
    if (studentReg.test(email)) return 'Student';
    if (staffReg1.test(email) || staffReg2.test(email)) return 'Staff';
    return null;
  }

  // State declarations (must be before any useEffect or function)
  const [staffNumber, setStaffNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [residence, setResidence] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  // Now that password is defined, we can safely compute requirements
  const passwordRequirements = getPasswordRequirements(password);

  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

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

  async function requestOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
  setErrorText(null);
  setSuccessMessage('');
  setIsRegistering(true);
  if (!email.trim()) {
    setErrorText('Please enter your email.');
    setIsRegistering(false);
    return;
  }
  // Validate student/staff number: digits only, max 10
  if (!/^[0-9]{1,10}$/.test(staffNumber.trim())) {
    setErrorText('Student number must be 1 to 10 digits.');
    setIsRegistering(false);
    return;
  }
  // Validate phone is exactly 10 digits
  if (!/^[0-9]{10}$/.test(phone.trim())) {
    setErrorText('Phone number must be exactly 10 digits.');
    setIsRegistering(false);
    return;
  }
  // Email restrictions
  const role = detectRole(email.trim());
  if (!role) {
    setErrorText('Please use a valid UNIZULU email:\nStudent → numbers@stu.unizulu.ac.za\nStaff → letters@unizulu.ac.za or letters@stu.unizulu.ac.za');
    setIsRegistering(false);
    return;
  }
  try {
    // Check if email already exists in patients
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('email')
      .eq('email', email.trim())
      .single();
    // Check if email exists in nurses
    const { data: existingNurse } = await supabase
      .from('nurses')
      .select('email')
      .eq('email', email.trim())
      .single();
    if (existingPatient || existingNurse) {
      setErrorText('This email is already registered. Please login or use password reset.');
      setIsRegistering(false);
      return;
    }
    // Only check other fields after email is confirmed unique
    if (!name.trim() || !staffNumber.trim() || !phone.trim() || !residence.trim()) {
      setErrorText('Please fill in all fields.');
      setIsRegistering(false);
      return;
    }
    // Now send OTP
  const res = await fetch(`${API}/api/patient/request-otp`, {
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
        setErrorText(data.error || 'Failed to send OTP.');
      }
      setIsRegistering(false);
      return;
    }
    setOtpSent(true);
    setErrorText(null);
    setResendCooldown(0);
    setResendMessage('');
    setSuccessMessage('OTP has been sent to your email.');
  } catch (err) {
    setErrorText('Server error.');
  }
  setIsRegistering(false);
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setErrorText(null);
    setIsRegistering(true);
    if (!otp.trim()) {
      setErrorText('Please enter the OTP sent to your email.');
      setIsRegistering(false);
      return;
    }
    try {
  const res = await fetch(`${API}/api/patient/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorText(data.error || 'OTP verification failed.');
        setIsRegistering(false);
        return;
      }
      if (data.access_token) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setOtpVerified(true);
        setErrorText(null);
      } else {
        setErrorText(data.error || 'OTP verified but no access token received.');
      }
    } catch (err) {
      setErrorText('Server error.');
    }
    setIsRegistering(false);
  }

  function handlePasswordBlur() {
    setPasswordTouched(true);
  }

  async function registerUser(e) {
    e.preventDefault();
    setErrorText(null);
    setIsRegistering(true);
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorText('Please enter and confirm your password.');
      setIsRegistering(false);
      return;
    }
    if (password !== confirmPassword.trim()) {
      setErrorText('Passwords do not match.');
      setIsRegistering(false);
      return;
    }
    // Show specific password requirements if not met
    const unmet = getPasswordRequirements(password);
    if (unmet.length > 0) {
      setErrorText('Password requirements not met: ' + unmet.join(', '));
      setIsRegistering(false);
      return;
    }
    // Validate phone is exactly 10 digits as a final safety check
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setErrorText('Phone number must be exactly 10 digits.');
      setIsRegistering(false);
      return;
    }
    try {
      // Check if email already exists in patients
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('email')
        .eq('email', email.trim())
        .single();
      // Check if email exists in nurses
      const { data: existingNurse } = await supabase
        .from('nurses')
        .select('email')
        .eq('email', email.trim())
        .single();
      if (existingPatient || existingNurse) {
        setErrorText('This email is already registered as a patient or nurse. Please login or use password reset.');
        setIsRegistering(false);
        return;
      }
      // Hash password before saving (SHA256)
      const hashedPassword = CryptoJS.SHA256(password.trim()).toString();
      // Save registration info to Supabase table
      const { error: insertError } = await supabase
        .from('patients')
        .insert({
          student_number: staffNumber.trim(),
          name_surname: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          residence: residence.trim(),
          password: hashedPassword
        });
      if (insertError) {
        setErrorText('Failed to register patient.');
        setIsRegistering(false);
        return;
      }
      setSuccessMessage('Registration complete! Please login.');
      setTimeout(() => {
        window.location.href = '/patient/login';
      }, 2000);
    } catch (err) {
      setErrorText('Client error.');
    }
    setIsRegistering(false);
  }

  return (
    <div className="patient-register-bg">
      {/* Back arrow button */}
      <button
        type="button"
        onClick={() => window.location.href = '/patient/login'}
        style={{
          position: 'fixed',
          top: 18,
          left: 18,
          background: 'white',
          border: '1px solid #b0c4de',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          cursor: 'pointer',
          zIndex: 1002,
          pointerEvents: 'auto',
        }}
        aria-label="Back to login"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L8 10L12.5 5" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <header className="patient-header" style={{background: 'none', boxShadow: 'none'}}>
        <img src="https://www.pngall.com/wp-content/uploads/10/Plus-Symbol-PNG-Cutout.png" alt="UNIZULU Logo" className="header-logo" />
        <div className="header-title">UNIZULU DIGITAL HEALTH CARE PORTAL</div>
      </header>
      <div className="register-container">
        <h2 className="register-title">Register New Patient Account</h2>
        <form className="register-form" onSubmit={otpVerified ? registerUser : otpSent ? verifyOtp : requestOtp}>
          <div className="input-group">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              placeholder=" "
              id="staffNumber"
              value={staffNumber}
              onChange={e => {
                // keep digits only and cap at 10 chars
                const cleaned = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                setStaffNumber(cleaned);
              }}
              required
              disabled={otpSent || otpVerified}
            />
            <label htmlFor="staffNumber">Student/Staff Number</label>
          </div>
          <div className="input-group">
            <input type="text" placeholder=" " id="name" value={name} onChange={e => setName(e.target.value)} required disabled={otpSent || otpVerified} />
            <label htmlFor="name">Name & Surname</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              placeholder=" "
              id="phone"
              value={phone}
              onChange={e => {
                // keep digits only and cap at 10 characters
                const cleanedPhone = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                setPhone(cleanedPhone);
              }}
              required={!otpSent && !otpVerified}
              disabled={otpSent || otpVerified}
            />
            <label htmlFor="phone">Phone Number</label>
          </div>
          <div className="input-group">
            <input type="text" placeholder=" " id="residence" value={residence} onChange={e => setResidence(e.target.value)} required={!otpSent && !otpVerified} disabled={otpSent || otpVerified} />
            <label htmlFor="residence">Residence</label>
          </div>
          <div className="input-group">
            <input type="email" placeholder=" " id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent || otpVerified} />
            <label htmlFor="email">Student/Staff Email</label>
          </div>
          {!otpSent && !otpVerified && (
            <button type="submit" disabled={isRegistering} className="register-btn">Request OTP</button>
          )}
          {otpSent && !otpVerified && (
            <>
              <div className="input-group">
                <input type="text" placeholder=" " id="otp" value={otp} onChange={e => setOtp(e.target.value)} required />
                <label htmlFor="otp">Enter OTP</label>
              </div>
              <button type="submit" disabled={isRegistering} className="register-btn">Verify OTP</button>
              <div style={{ marginTop: 12, textAlign: 'center', fontSize: '1rem' }}>
                Haven't got the email yet?{' '}
                {resendCooldown > 0 ? (
                  <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{resendMessage || `Please wait ${resendCooldown} seconds`}</span>
                ) : (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                    onClick={requestOtp}
                  >
                    Resend email
                  </button>
                )}
              </div>
            </>
          )}
          {otpVerified && (
            <>
              <div className="input-group">
                <input
                  type="password"
                  placeholder=" "
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={handlePasswordBlur}
                  required
                />
                <label htmlFor="password">Create Password</label>
              </div>
              {passwordTouched && passwordRequirements.length > 0 && (
                <ul style={{ color: '#d32f2f', margin: '6px 0 0 0', fontSize: '0.95rem', paddingLeft: 18 }}>
                  {passwordRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              )}
              <div className="input-group">
                <input type="password" placeholder=" " id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>
              <button type="submit" disabled={isRegistering} className="register-btn">Submit Registration</button>
            </>
          )}
          {successMessage && <div className="success-message" style={{ color: '#388e3c', background: '#e8f5e9', border: '1px solid #c8e6c9', padding: 10, borderRadius: 6, margin: '10px 0', textAlign: 'center' }}>{successMessage}</div>}
          {errorText && (
            <div
              className="error-text"
              style={{
                color: '#d32f2f',
                background: '#fff',
                border: '1px solid #f8bbd0',
                padding: '10px',
                borderRadius: '6px',
                margin: '10px 0',
                textAlign: 'center',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {errorText}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default PatientRegister;
