import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminSelectionPage() {
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
          filter: 'blur(1px) brightness(0.6)',
          zIndex: -1
        }}
      />
      <h1>Admin Role Selection</h1>
      <p>Select your admin type:</p>
      <div className="role-buttons">
        <button onClick={() => navigate('/superadmin/login')}>SuperAdmin</button>
        <button onClick={() => navigate('/admin/login')}>Admin</button>
      </div>
    </div>
  );
}

export default AdminSelectionPage;
