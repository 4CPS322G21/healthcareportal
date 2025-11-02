import React, { useState, useEffect } from 'react';
import '../patient/PatientBooking.css';
import API from '../apiConfig';

// SVG icon components
const EditIcon = () => {
  return (
    <svg className="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25z" fill="#1976d2" />
      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#1976d2" />
    </svg>
  );
};
const SaveIcon = () => {
  return (
    <svg className="profile-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H7V5h10v14zm-5-3a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#1976d2" />
    </svg>
  );
};
const UserIcon = () => {
  return (
    <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="#1976d2" />
      <path d="M4 20v-1c0-2.8 5.3-4 8-4s8 1.2 8 4v1H4z" fill="#1976d2" />
    </svg>
  );
};
const IdIcon = () => {
  return (
    <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#1976d2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">
        ID
      </text>
    </svg>
  );
};
const EmailIcon = () => {
  return (
    <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16v16H4V4zm8 8l8-6H4l8 6zm0 2l-8-6v10h16V8l-8 6z" fill="#1976d2" />
    </svg>
  );
};
const PhoneIcon = () => {
  return (
    <svg className="profile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C7.61 22 2 16.39 2 9.5a1 1 0 0 1 1-1H6.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z" fill="#1976d2" />
    </svg>
  );
};

function NurseProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    nurse_id_number: '',
    email: '',
    contact_details: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Try multiple keys that might hold the logged-in nurse's email
    const email = localStorage.getItem('nurse_email') || localStorage.getItem('user_email') || localStorage.getItem('email') || (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        return u?.email;
      } catch (e) {
        return null;
      }
    })();
    if (email) {
      setLoading(true);
      fetch(`${API}/api/nurse/profile?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          console.debug('[NurseProfile] fetched profile data:', data);
          
          // backend returns { name, id_number, email, contact_details }
          if (data && (data.name || data.full_name)) {
            setProfile({
              full_name: data.name || data.full_name, // use 'name' column for Full Name
              nurse_id_number: data.id_number || data.nurse_id_number, // use 'id_number' column for Nurse ID Number
              email: data.email,
              contact_details: data.contact_details,
            });
            setIsEditing(false); // Always start in read mode
          } else {
            setProfile((p) => ({ ...p, email }));
            setIsEditing(false); // Also start in read mode if no profile found
          }
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load profile.');
          setLoading(false);
        });
    } else {
      setError('No logged-in user.');
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      // Only contact_details is editable — POST email + contact_details
      const payload = {
        email: profile.email,
        contact_details: (profile.contact_details || '').trim(),
      };
      if (!payload.contact_details) {
        setMessage('Contact details cannot be empty.');
        return;
      }
      setLoading(true);
      const res = await fetch(`${API}/api/nurse/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMessage('Profile saved successfully!');
        setIsEditing(false);
      } else {
        setMessage(data.error || 'Failed to save profile.');
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="booking-bg">
      <button
        className="profile-back-btn"
        title="Go Back"
        onClick={() => window.history.back()}
        style={{ position: 'fixed', top: 16, left: 16, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
      >
        <span style={{ fontSize: '1.7rem', color: '#0d3b66' }}>&#8592;</span>
      </button>
      <button
        className="profile-edit-btn profile-edit-btn-floating"
        onClick={handleToggleEdit}
        disabled={loading}
        style={{ position: 'fixed', top: 16, right: 24, zIndex: 9999 }}
      >
        {isEditing ? (
          <>
            <SaveIcon /> Save
          </>
        ) : (
          <>
            <EditIcon /> Edit
          </>
        )}
      </button>
      <div className="booking-header">Profile Details</div>
      <div className="booking-content">
        <div style={{ flex: 1, minWidth: 320 }}>
          <div className="profile-avatar" style={{ marginBottom: 24 }}>
            <UserIcon />
          </div>
          {!isEditing && !loading && !error && (
            <div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <UserIcon /> Full Name:</strong> {profile.full_name}</div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <IdIcon /> Nurse ID Number:</strong> {profile.nurse_id_number}</div>
              {/* Phone Number field removed */}
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <EmailIcon /> Email:</strong> {profile.email}</div>
              <div className="profile-summary-item" style={{fontSize: '1.5rem', padding: '24px 28px'}}><strong style={{fontSize: '1.5rem'}}> <PhoneIcon /> Contact Details:</strong> {profile.contact_details}</div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div className="profile-body">
            {loading ? (
              <div style={{ color: '#888', margin: '20px 0', textAlign: 'center' }}>Loading profile...</div>
            ) : error ? (
              <div style={{ color: '#d32f2f', margin: '20px 0', textAlign: 'center' }}>{error}</div>
            ) : isEditing ? (
              <form className="profile-form">
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <UserIcon />
                  <input
                    name="full_name"
                    value={profile.full_name || ''}
                    disabled
                    placeholder=" "
                    style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }}
                    id="full_name"
                  />
                  <label htmlFor="full_name">Full Name</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <IdIcon />
                  <input
                    name="nurse_id_number"
                    value={profile.nurse_id_number || ''}
                    disabled
                    placeholder=" "
                    style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }}
                    id="nurse_id_number"
                  />
                  <label htmlFor="nurse_id_number">Nurse ID Number</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <EmailIcon />
                  <input
                    name="email"
                    value={profile.email || ''}
                    disabled
                    placeholder=" "
                    type="email"
                    style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10, background: '#eee', color: '#888' }}
                    id="email"
                  />
                  <label htmlFor="email">Email Address</label>
                </div>
                <div className="update-input-group" style={{ position: 'relative', width: '100%' }}>
                  <PhoneIcon />
                  <input
                    name="contact_details"
                    value={profile.contact_details || ''}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    style={{ width: '100%', minWidth: 280, maxWidth: 700, height: 44, fontSize: '1.1rem', padding: '14px 18px 14px 44px', marginBottom: 22, borderRadius: 10 }}
                    id="contact_details"
                  />
                  <label htmlFor="contact_details">Contact Details</label>
                </div>
              </form>
            ) : null}
            {message && (
              <div style={{ color: message.toLowerCase().includes('success') ? '#388e3c' : '#d32f2f', marginTop: 12, fontWeight: 'bold', textAlign: 'center' }}>{message}</div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default NurseProfile;