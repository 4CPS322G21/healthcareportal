import React, { useState } from 'react';
import '../admin/AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

function SuperAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Check credentials against Supabase table 'superadmins'
    const { data, error: dbError } = await supabase
      .from('superadmins')
      .select('username, password')
      .eq('username', username.trim());
    if (dbError || !data || data.length === 0) {
      setError('Invalid username or password.');
      return;
    }
    const match = data.find(row => row.password === password);
    if (!match) {
      setError('Invalid username or password.');
      return;
    }
    navigate('/superadmin/home');
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
          background: 'url("/select.jpg") no-repeat center center/cover',
          filter: 'blur(1px) brightness(0.6)',
          zIndex: -1
        }}
      />
      <header className="admin-header">
        <img src="https://www.pngall.com/wp-content/uploads/10/Plus-Symbol-PNG-Cutout.png" alt="UNIZULU Logo" className="header-logo" />
        <div className="header-title">UNIZULU DIGITAL HEALTH PORTAL</div>
      </header>
      <div className="admin-subheader">SUPERADMIN-LOGIN</div>
      <div className="login-container">
        <img
          src="https://graduations.unizulu.ac.za/wp-content/uploads/2021/06/UNIZULU-crest-white.png"
          alt="UNIZULU Crest"
          style={{ cursor: 'pointer', border: 'none', background: 'none' }}
          onClick={() => navigate('/')}
        />
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input type="text" id="username" name="username" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-group">
            <input type="password" id="password" name="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default SuperAdminLogin;
