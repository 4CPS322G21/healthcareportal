import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/ManageNurses.css';
import API from '../apiConfig';


function SuperAdminHome() {
  const [pendingNurses, setPendingNurses] = useState([]);
  const [approvedNurses, setApprovedNurses] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [approvedAdmins, setApprovedAdmins] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNurses();
    fetchAdmins();
  }, []);

  function fetchNurses() {
    setError('');
    fetch(`${API}/admin/nurses`)
      .then(res => res.json())
      .then(data => {
        setPendingNurses(data.pending || []);
        setApprovedNurses(data.approved || []);
      })
      .catch(() => setError('Failed to fetch nurses.'));
  }

  function fetchAdmins() {
    fetch(`${API}/superadmin/admins`)
      .then(res => res.json())
      .then(data => {
        setPendingAdmins(data.pending || []);
        setApprovedAdmins(data.approved || []);
      })
      .catch(() => setError('Failed to fetch admin requests.'));
  }

  function handleApproveNurse(id) {
    setMessage('');
    setError('');
  fetch(`${API}/admin/approve_nurse/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Nurse approved!');
          fetchNurses();
        } else {
          setError(data.error || 'Failed to approve nurse.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  function handleRejectNurse(id) {
    setMessage('');
    setError('');
  fetch(`${API}/admin/reject_nurse/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Nurse rejected.');
          fetchNurses();
        } else {
          setError(data.error || 'Failed to reject nurse.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  function handleDeleteNurse(id) {
    setMessage('');
    setError('');
  fetch(`${API}/admin/delete_nurse/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Nurse deleted.');
          fetchNurses();
        } else {
          setError(data.error || 'Failed to delete nurse.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  function handleApproveAdmin(id) {
    setMessage('');
    setError('');
  fetch(`${API}/superadmin/approve_admin/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Admin approved!');
          fetchAdmins();
        } else {
          setError(data.error || 'Failed to approve admin.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  function handleRejectAdmin(id) {
    setMessage('');
    setError('');
  fetch(`${API}/superadmin/reject_admin/${id}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Admin rejected.');
          fetchAdmins();
        } else {
          setError(data.error || 'Failed to reject admin.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  function handleDeleteAdmin(id) {
    setMessage('');
    setError('');
  fetch(`${API}/superadmin/delete_admin/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Admin deleted.');
          fetchAdmins();
        } else {
          setError(data.error || 'Failed to delete admin.');
        }
      })
      .catch(() => setError('Server error.'));
  }

  // Combine pending nurses and admins for unified pending requests table
  const allPending = [
    ...pendingNurses.map(n => ({ ...n, role: n.role || 'nurse', type: 'nurse' })),
    ...pendingAdmins.map(a => ({ ...a, role: a.role || 'admin', type: 'admin' }))
  ];

  return (
    <div className="manage-nurses-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#fff', zIndex: 0 }}>
      <h2>Manage Clinic Staff</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="nurse-section">
        <h3>Pending Requests</h3>
        {allPending.length === 0 ? <div>No pending requests.</div> : (
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Details</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPending.map(req => (
                <tr key={req.type + '-' + req.id}>
                  <td>{req.name}</td>
                  <td>{req.email}</td>
                  <td>{req.type === 'nurse' ? req.contact_details : req.phone}</td>
                  <td>{req.role}</td>
                  <td>
                    {req.type === 'nurse' ? (
                      <>
                        <button className="approve-btn" onClick={() => handleApproveNurse(req.id)}>Accept</button>
                        <button className="reject-btn" onClick={() => handleRejectNurse(req.id)}>Reject</button>
                      </>
                    ) : (
                      <>
                        <button className="approve-btn" onClick={() => handleApproveAdmin(req.id)}>Accept</button>
                        <button className="reject-btn" onClick={() => handleRejectAdmin(req.id)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="nurse-section">
        <h3>Clinic Staff</h3>
        {approvedNurses.length === 0 && approvedAdmins.length === 0 ? <div>No staff in list.</div> : (
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact Details</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedNurses.map(nurse => (
                <tr key={'nurse-' + nurse.id}>
                  <td>{nurse.name}</td>
                  <td>{nurse.email}</td>
                  <td>{nurse.contact_details}</td>
                  <td>{nurse.role || 'nurse'}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteNurse(nurse.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {approvedAdmins.map(admin => (
                <tr key={'admin-' + admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.role || 'admin'}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Removed separate Pending Admin Requests section, now unified above */}
      <button
        style={{
          position: 'fixed',
          left: 20,
          bottom: 20,
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 100
        }}
        onClick={() => navigate('/superadmin/login')}
      >
        &#8592; Back
      </button>
    </div>
  );
}

export default SuperAdminHome;
