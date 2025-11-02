import React, { useState } from 'react';
import '../admin/AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import API from '../apiConfig';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
  const res = await fetch(`${API}/api/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // Save logged-in admin email for profile lookup
        try { localStorage.setItem('admin_email', email); } catch (e) { /* ignore */ }
        navigate('/admin/home');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="admin-login-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'url("/admin-login.webp") no-repeat center center/cover',
          filter: 'blur(0.5px) brightness(0.7)',
          zIndex: -1
        }}
      />
      <header className="admin-header">
        <img src="https://www.pngall.com/wp-content/uploads/10/Plus-Symbol-PNG-Cutout.png" alt="UNIZULU Logo" className="header-logo" />
        <div className="header-title">UNIZULU DIGITAL HEALTH CARE PORTAL</div>
      </header>
      <div className="admin-subheader">ADMIN-LOGIN</div>
      <div className="login-container">
        <img
          src="https://graduations.unizulu.ac.za/wp-content/uploads/2021/06/UNIZULU-crest-white.png"
          alt="UNIZULU Crest"
          style={{ cursor: 'pointer', border: 'none', background: 'none' }}
          onClick={() => navigate('/')}
        />
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input type="email" id="email" name="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-group">
            <input type="password" id="password" name="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
            <label htmlFor="password">Password</label>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit">Login</button>
        </form>
        <div style={{ marginTop: '16px', textAlign: 'center', fontWeight: 'bold' }}>
          <span style={{ color: '#000000ff' }}>Don't have an account? </span>
          <span
            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
            onClick={() => navigate('/admin/register')}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
