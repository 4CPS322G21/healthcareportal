import React, { useState, useEffect } from 'react';
import '../patient/PatientBooking.css';
import API from '../apiConfig';

const EditIcon = () => (
  <svg className="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25z" fill="#1976d2" />
    <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#1976d2" />
  </svg>
);
const SaveIcon = () => (
  <svg className="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H7V5h10v14zm-5-3a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#1976d2" />
  </svg>
);
const UserIcon = () => (
  <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="#1976d2" />
    <path d="M4 20v-1c0-2.8 5.3-4 8-4s8 1.2 8 4v1H4z" fill="#1976d2" />
  </svg>
);
const EmailIcon = () => (
  <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16v16H4V4zm8 8l8-6H4l8 6zm0 2l-8-6v10h16V8l-8 6z" fill="#1976d2" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C7.61 22 2 16.39 2 9.5a1 1 0 0 1 1-1H6.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z" fill="#1976d2" />
  </svg>
);

function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', gender: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('admin_email') || localStorage.getItem('email') || (() => {
      try { const u = JSON.parse(localStorage.getItem('user') || 'null'); return u?.email; } catch (e) { return null; }
    })();
  if (email) {
      setLoading(true);
      fetch(`${API}/api/admin/profile?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && (data.name || data.full_name)) {
            setProfile({ name: data.name || data.full_name, gender: data.gender || '', email: data.email, phone: data.phone || data.contact_details || '' });
            setIsEditing(false);
          } else {
            setProfile(p => ({ ...p, email }));
          }
          setLoading(false);
        })
        .catch(err => { setError('Failed to load profile.'); setLoading(false); });
    } else {
      setError('No logged-in user.');
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleToggleEdit = async () => {
      if (isEditing) {
      const payload = { email: profile.email, phone: (profile.phone || '').trim() };
      if (!payload.phone) { setMessage('Contact number cannot be empty.'); return; }
      setLoading(true);
  const res = await fetch(`${API}/api/admin/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setLoading(false);
      if (res.ok) { setMessage('Profile saved.'); setIsEditing(false); } else { setMessage(data.error || 'Failed to save profile.'); }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="booking-bg">
  <button className="profile-back-btn" title="Go Back" onClick={() => window.history.back()} style={{ position: 'fixed', top: 16, left: 16, background: 'white', color: 'blue', border: 'none', cursor: 'pointer', zIndex: 9999 }}>&#8592;</button>
  <button className="profile-edit-btn profile-edit-btn-floating" onClick={handleToggleEdit} disabled={loading} style={{ position: 'fixed', top: 16, right: 24, zIndex: 9999 }}>
        {isEditing ? <><SaveIcon /> Save</> : <><EditIcon /> Edit</>}
      </button>
      <div className="booking-header">Admin Profile</div>
  <div className="booking-content" style={{ width: '98%', maxWidth: '1300px' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div className="profile-avatar" style={{ marginBottom: 24 }}><UserIcon /></div>
          {!isEditing && !loading && !error && (
            <div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <UserIcon /> Full Name:</strong> {profile.name}</div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> Gender:</strong> {profile.gender}</div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <PhoneIcon /> Contact Number:</strong> {profile.phone}</div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <EmailIcon /> Email:</strong> {profile.email}</div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div className="profile-body">
            {loading ? <div style={{ color: '#888', margin: '20px 0', textAlign: 'center' }}>Loading profile...</div> : error ? <div style={{ color: '#d32f2f', margin: '20px 0', textAlign: 'center' }}>{error}</div> : isEditing ? (
              <form className="profile-form">
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <UserIcon />
                  <input name="name" value={profile.name || ''} disabled placeholder=" " style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }} id="name" />
                  <label htmlFor="name">Full Name</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <input name="gender" value={profile.gender || ''} disabled placeholder=" " style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }} id="gender" />
                  <label htmlFor="gender">Gender</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <EmailIcon />
                  <input name="email" value={profile.email || ''} disabled placeholder=" " type="email" style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }} id="email" />
                  <label htmlFor="email">Email Address</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <PhoneIcon />
                  <input name="phone" value={profile.phone || ''} onChange={handleChange} placeholder=" " required style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10 }} id="phone" />
                  <label htmlFor="phone">Contact Number</label>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
