
import React, { useState } from 'react';
import {  } from 'react-router-dom';
import './PatientHome.css';
import backendUrl from '../apiConfig';

function PatientHome() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState('');

  React.useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) {
      window.location.href = '/patient/login';
      return;
    }
    fetch(`${backendUrl}/api/user_profile?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.full_name && data.surname) {
          setUserName(`${data.full_name} ${data.surname}`);
        } else if (data && data.full_name) {
          setUserName(data.full_name);
        } else {
          setUserName('');
        }
      })
      .catch(() => setUserName(''));
  }, []);

  const handleDrawerNav = (nav) => {
    setDrawerOpen(false);
    if (nav === 'booking') window.location.href = '/patient/booking';
    if (nav === 'record') window.location.href = '/patient/record';
    if (nav === 'profile') window.location.href = '/patient/profile';
    if (nav === 'logout') {
      localStorage.removeItem('user_email');
      localStorage.removeItem('token');
      window.location.href = '/patient/login';
    }
  };

  return (
    <div className="patient-home-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background image same as SelectionPage */}
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
      {/* Drawer */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <img src="https://graduations.unizulu.ac.za/wp-content/uploads/2021/06/UNIZULU-crest-white.png" alt="UNIZULU Crest" style={{width:80, height:80}} />
          <div className="drawer-title">DIGITAL HEALTH CARE</div>
        </div>
        <div className="drawer-list">
          <button className="drawer-item" onClick={() => handleDrawerNav('booking')}>
            📅 Make the bookings
          </button>
          <button className="drawer-item" onClick={() => handleDrawerNav('record')}>
            📁 Check the record
          </button>
          <button className="drawer-item" onClick={() => handleDrawerNav('profile')}>
            👤 Profile
          </button>
          <button className="drawer-item" onClick={() => handleDrawerNav('logout')}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Overlay for drawer */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}></div>}

      {/* Header */}
      <header className="patient-header">
  {/* Sidebar menu button only, logo removed */}
        <div className="header-title">WELCOME TO UNIZULU HEALTH CARE PORTAL</div>
  <div className="header-user">{userName}</div>
        {/* Arrow button removed as requested */}
        <button className="drawer-toggle" title="Open Menu" onClick={() => setDrawerOpen(true)}>
          <span>&#9776;</span>
        </button>
      </header>

      <div className="home-container">
        <button className="home-btn" onClick={() => window.location.href = '/patient/booking'}>
          <span role="img" aria-label="calendar">📅</span> Make the bookings
        </button>
        <button className="home-btn" onClick={() => window.location.href = '/patient/record'}>
          <span role="img" aria-label="folder">📁</span> <span style={{cursor: 'pointer', color: '#0d3b66', fontWeight: 500}}>Check the record</span>
        </button>
      </div>
    </div>
  );
}

export default PatientHome;
