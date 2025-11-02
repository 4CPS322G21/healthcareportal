import React, { useState, useRef } from 'react';
import './NurseLogin.css';
import { useNavigate } from 'react-router-dom';
import API from '../apiConfig';

function NurseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [showPersonalizedGreeting, setShowPersonalizedGreeting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showInvalidLoginError, setShowInvalidLoginError] = useState(false);
  const errorTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setShowInvalidLoginError(false);
  fetch(`${API}/api/nurses/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          const name = data.nurse?.name || (email.split('@')[0] || 'Nurse');
          localStorage.setItem('nurse_email', data.nurse.email);
          localStorage.setItem('nurse_name', name);
          navigate(`/nurse/home?name=${encodeURIComponent(name)}`);
        } else {
          setShowInvalidLoginError(true);
          if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = setTimeout(() => setShowInvalidLoginError(false), 5000);
        }
      })
      .catch(() => {
        setShowInvalidLoginError(true);
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = setTimeout(() => setShowInvalidLoginError(false), 5000);
      });
  };

  return (
    <div className="nurse-login-bg" style={{ position: 'relative', overflow: 'hidden' }}>
<div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'url("/nurse-login.webp") no-repeat center center/cover',
    filter: 'blur(0.5px) brightness(0.5)',
    zIndex: -1
  }}
/>
      <header className="nurse-header">
        <div className="header-title">UNIZULU DIGITAL HEALTH CARE PORTAL</div>
      </header>
      <div className="nurse-subheader">NURSE-LOGIN</div>
      <div className="login-container">
        <img
          src="https://graduations.unizulu.ac.za/wp-content/uploads/2021/06/UNIZULU-crest-white.png"
          alt="UNIZULU Crest"
          style={{ width: '180px', maxWidth: '100%', marginBottom: '20px', cursor: 'pointer' }}
          onClick={() => window.location.href = '/'}
          title="Go to Selection Page"
        />
        {showPersonalizedGreeting && userName ? (
          <p className="greeting">Hello {userName}! Please log in below</p>
        ) : (
          <p className="greeting">Hello! Please log in below</p>
        )}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder=" "
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
          </div>
          {showForgotPassword && (
            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
          )}
          <button type="submit">Login</button>
        </form>
        {showInvalidLoginError && (
          <p className="error">Invalid login</p>
        )}
        <div className="register-link" style={{ marginTop: 18 }}>
          <span>Don't have an account? </span>
          <a href="#" className="register" onClick={e => { e.preventDefault(); navigate('/nurse/register'); }}>Register</a>
        </div>
      </div>
    </div>
  );
}

export default NurseLogin;
