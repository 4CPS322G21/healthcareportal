import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';
import API from '../apiConfig';

function AdminHome() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    // Dropdown toggle logic
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('dropdownMenu');
    const icon = document.getElementById('menuIcon');
    if (toggle && menu && icon) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.style.display === 'flex';
        menu.style.display = isOpen ? 'none' : 'flex';
        icon.className = isOpen ? 'fas fa-bars' : 'fas fa-times';
      });
      window.addEventListener('click', function(e) {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
          menu.style.display = 'none';
          icon.className = 'fas fa-bars';
        }
      });
    }

    // Fetch pending nurse registration requests
    fetch(`${API}/admin/nurses`)
      .then(res => res.json())
      .then(data => {
        if (data.pending) {
          setPendingRequests(data.pending);
        }
      })
      .catch(err => console.error('Error fetching pending requests:', err));
  }, []);

  function handleApprove(requestId) {
    fetch(`${API}/admin/approve_nurse/${requestId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        }
      })
      .catch(err => console.error('Error approving request:', err));
  }

  function handleReject(requestId) {
    fetch(`${API}/admin/reject_nurse/${requestId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        }
      })
      .catch(err => console.error('Error rejecting request:', err));
  }

  return (
    <div className="admin-home-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'url("/patient.jpg") no-repeat center center/cover',
          filter: 'blur(2px) brightness(1.0)',
          zIndex: -1
        }}
      />
      <aside style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '40px 20px 0 20px', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
  <button style={{ fontSize: '1.2rem', marginBottom: '20px', width: '100%', padding: '16px', borderRadius: '8px', border: 'none', background: '#fff', color: '#1565c0', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/admin/appointments')}>Appointments</button>
  <button style={{ fontSize: '1.2rem', marginBottom: '20px', width: '100%', padding: '16px', borderRadius: '8px', border: 'none', background: '#fff', color: '#1565c0', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/admin/profile')}>My Profile</button>
  <button style={{ fontSize: '1.2rem', marginBottom: '20px', width: '100%', padding: '16px', borderRadius: '8px', border: 'none', background: '#ffebee', color: '#b22222', cursor: 'pointer', fontWeight: 700 }} onClick={() => window.location.href = '/admin/login'}>Logout</button>
      </aside>
      <div style={{ flex: 1 }}>
        <nav className="admin-nav">
          <div className="nav-header">UNIZULU DIGITAL HEALTH CARE PORTAL</div>
          <button className="menu-toggle" id="menuToggle">
            <i className="fas fa-bars" id="menuIcon"></i>
          </button>
          <div className="dropdown" id="dropdownMenu">
            <button onClick={() => window.location.href = '/appointments'}>Appointments</button>
            <button className="logout" onClick={() => window.location.href = '/admin/login'}>Logout</button>
          </div>
        </nav>
        <div className="center-content">
        <img 
          src="/unizulu-logo.png" 
          alt="UNIZULU Crest" 
          style={{ width: '150px', height: 'auto' }} 
        />
        <div className="center-text">Campus Health Clinic</div>
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Use the menu to navigate to different sections.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
