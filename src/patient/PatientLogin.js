import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { FaUser, FaLock } from 'react-icons/fa';
import './PatientLogin.css';

function PatientLogin({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const SUPABASE_URL = 'https://xjdstsoceomfftanuhjy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZHN0c29jZW9tZmZ0YW51aGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjMxOTEsImV4cCI6MjA3MDEzOTE5MX0.Gxo9ctAls5hCVMh_MsfANFstc64cL2uuiVaaHjWViAE';
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('password, name_surname, student_number')
        .eq('email', username.trim())
        .single();
      if (!patient) {
        setError('Email not found.');
        return;
      }
      const enteredHash = CryptoJS.SHA256(password.trim()).toString();
      if (patient.password !== enteredHash) {
        setError('Incorrect password.');
        return;
      }
      localStorage.setItem('user_email', username);
      window.location.href = `/patient/home?name=${encodeURIComponent(patient.name_surname)}`;
    } catch (err) {
      setError('Login failed.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (onRegister) onRegister();
    else window.location.href = '/patient/register';
  };

  // Inline styles (kept small); most layout is in PatientLogin.css
  const styles = {
    body: {
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      background: 'url("/select.jpg") no-repeat center center/cover',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginContainer: {
      background: 'white',
      padding: '32px 20px',
      borderRadius: '10px',
      width: '92%',
      maxWidth: 'min(420px, 92vw)',
      textAlign: 'center',
      boxShadow: '0px 4px 20px rgba(0,0,0,0.3)',
    },
    logo: {
      width: 'clamp(120px, 25vw, 180px)',
      maxWidth: '100%',
      marginBottom: '20px',
    },
    icon: { marginRight: '10px', color: '#666' },
    input: { border: 'none', outline: 'none', flex: 1, fontSize: 'clamp(0.95rem,1.6vw,1.05rem)', padding: '8px' },
    loginBtn: { backgroundColor: '#0066cc', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', width: '100%', fontSize: 'clamp(0.95rem,1.6vw,1.05rem)', cursor: 'pointer', marginTop: '10px' },
    link: { display: 'block', margin: '10px 0', fontSize: '14px', color: '#0066cc', textDecoration: 'none' },
    hr: { margin: '20px 0' },
    guest: { margin: '20px 0 10px', fontWeight: 'bold', fontSize: '14px' },
    guestBtn: { backgroundColor: '#555', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', width: '100%', fontSize: 'clamp(0.95rem,1.6vw,1.05rem)', cursor: 'pointer' },
    error: { color: '#d32f2f', marginTop: '10px', fontSize: '14px' },
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0, overflow: 'hidden' }}>
        {/* Background overlay: dimmed and blurred */}
        <div style={{ position: 'fixed', inset: 0, background: 'url("/select.jpg") no-repeat center center/cover', filter: 'blur(1px) brightness(0.55)', zIndex: -1 }} />

        <div style={styles.loginContainer}>
          <img src="https://th.bing.com/th/id/R.ce5c0d690f8cb1147d253011e1820cf5?rik=mS5MQKQDoNuwtg&riu=http%3a%2f%2flearn.unizulu.ac.za%2fimages%2funizulu_logo.jpg&ehk=pu50sp5fsUEd2rm%2fPiihezphCmU6n%2bSuaCxKj69YcLI%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1" alt="Unizulu Logo" style={styles.logo} onClick={() => window.location.href = '/'} title="Go to Selection Page" />

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <FaUser style={styles.icon} />
              <input type="email" id="email" name="email" placeholder=" " style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-group">
              <FaLock style={styles.icon} />
              <input type="password" id="password" name="password" placeholder=" " style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" style={styles.loginBtn}>Log in</button>
          </form>

          {error && (
            <a href="#" style={styles.link} onClick={e => { e.preventDefault(); window.location.href = '/patient/reset-password'; }}>Forgot password?</a>
          )}

          <hr style={styles.hr} />

          <div style={styles.guest}>
            Don't have an account?{' '}
            <a href="#" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '4px' }} onClick={e => { e.preventDefault(); handleRegister(e); }}>Sign Up</a>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>

      {/* Emergency footer fixed at the bottom of the viewport */}
      <div className="emergency-footer">
        <p>24 Hour Emergency - 035 9026599. UNIZULU AMBULANCE: 0718839289 </p>
      </div>
    </>
  );
}

export default PatientLogin;
