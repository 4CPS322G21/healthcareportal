import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../nurse/NurseRegister.css';
import API from '../apiConfig';

function AdminRegister() {
  function getPasswordRequirements(password) {
    const requirements = [];
    if (password.length < 8) requirements.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('At least one lowercase letter');
    if (!/\d/.test(password)) requirements.push('At least one number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) requirements.push('At least one special character');
    return requirements;
  }

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    password: ''
  });
  const passwordRequirements = getPasswordRequirements(form.password);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePasswordBlur() {
    setPasswordTouched(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const unmet = getPasswordRequirements(form.password);
    if (unmet.length > 0) {
      setError('Password requirements not met: ' + unmet.join(', '));
      return;
    }
    (async () => {
      try {
        // Check if email already exists in admins
        const { data: existingAdmin } = await supabase
          .from('admins')
          .select('email')
          .eq('email', form.email.trim())
          .single();
        // Check if email exists in nurses
        const { data: existingNurse } = await supabase
          .from('nurses')
          .select('email')
          .eq('email', form.email.trim())
          .single();
        if (existingAdmin || existingNurse) {
          setError('This email is already registered as an admin or nurse. Please login or use password reset.');
          return;
        }
        // If not exists, proceed with registration (call your API or insert here)
        fetch(`${API}/api/admins/register_request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            gender: form.gender,
            dob: form.dob,
            phone: form.phone,
            email: form.email,
            password: form.password,
            role: 'admin' // Specify the request is from an admin
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setMessage('Registration successful!');
              setForm({ name: '', email: '', phone: '', password: '' });
            } else {
              setError(data.error || 'Failed to submit registration.');
            }
          })
          .catch(() => setError('Server error.'));
      } catch (err) {
        setError('Server error.');
      }
    })();
  }

  return (
  <div style={{ background: '#fff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <div className="nurse-register-container">
        <h2>Admin Registration</h2>
        <form className="nurse-register-form" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" />
          <select name="gender" value={form.gender} onChange={handleChange} required style={{ marginBottom: 12 }}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input name="dob" type="date" value={form.dob} onChange={handleChange} placeholder="Date of Birth (optional)" style={{ marginBottom: 12 }} />
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Contact Number" />
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Work Email Address" />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handlePasswordBlur}
            required
            placeholder="Password"
          />
          {passwordTouched && passwordRequirements.length > 0 && (
            <ul style={{ color: '#d32f2f', margin: '6px 0 0 0', fontSize: '0.95rem', paddingLeft: 18 }}>
              {passwordRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          )}
          <button type="submit">Register</button>
        </form>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
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
        onClick={() => navigate('/admin/login')}
      >
        &#8592; Back
      </button>
    </div>
  );
}

export default AdminRegister;
