import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';

function SelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="selection-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'url("/select.jpg") no-repeat center center/cover',
          filter: 'blur(0.5px) brightness(0.7)',
          zIndex: -1
        }}
      />
      <h1>UNIZULU HEALTH CARE PORTAL</h1>
      <p>Select your role:</p>
      <div className="role-buttons">
        <button onClick={() => navigate('/admin-selection')}>Administrator</button>
        <button onClick={() => navigate('/nurse/login')}>Nurse</button>
        <button onClick={() => navigate('/patient/login')}>Patient</button>
      </div>
    </div>
  );
}

export default SelectionPage;
