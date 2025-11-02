import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './NurseRegister.css';
import API from '../apiConfig';

function NurseRegister() {
  // South African contact number validation
  function isValidSouthAfricanContactNumber(number) {
    // Accepts formats like 0821234567, +27821234567, 27821234567
    // Must be 10 digits starting with 0, or 11/12 digits starting with 27 or +27
    const plain = number.replace(/\D/g, '');
    if (/^0\d{9}$/.test(plain)) return true;
    if (/^27\d{9}$/.test(plain)) return true;
    return false;
  }
  // South African ID validation
  function isValidSouthAfricanID(id) {
    // Must be 13 digits
    if (!/^\d{13}$/.test(id)) return false;
    // Luhn algorithm for checksum
    let sum = 0;
    let alternate = false;
    for (let i = id.length - 1; i >= 0; i--) {
      let n = parseInt(id[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }
  // Password requirements check
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
    nurse_id_number: '',
    contact_details: '',
    email: '',
    password: ''
  });
  const passwordRequirements = getPasswordRequirements(form.password);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
  // Clear error when user starts typing in a field
  setError('');
  }

  function handlePasswordBlur() {
    setPasswordTouched(true);
  }

  function handleSubmit(e) {
    // Validate contact number
    if (!isValidSouthAfricanContactNumber(form.contact_details)) {
      setError('Please enter a valid South African contact number (e.g. 0821234567 or +27821234567).');
      return;
    }
    e.preventDefault();
    // Validate South African ID
    if (!isValidSouthAfricanID(form.nurse_id_number)) {
      setError('Please enter a valid South African ID number (13 digits, valid checksum).');
      return;
    }
    (async () => {
      try {
        // Check if email already exists in nurses
        const { data: existingNurse } = await supabase
          .from('nurses')
          .select('email')
          .eq('email', form.email.trim())
          .single();
        // Check if email exists in patients
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('email')
          .eq('email', form.email.trim())
          .single();
        if (existingNurse || existingPatient) {
          setError('This email is already registered as a nurse or patient. Please login or use password reset.');
          return;
        }
        // If not exists, proceed with registration (call your API or insert here)
        const res = await fetch(`${API}/api/nurses/register_request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            id_number: form.nurse_id_number, // send as id_number
            contact_details: form.contact_details,
            email: form.email,
            password: form.password,
            role: 'nurse' // Specify the request is from a nurse
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('Registration successful!');
          setForm({ name: '', nurse_id_number: '', contact_details: '', email: '', password: '' });
        } else {
          setError(data.error || 'Failed to submit registration.');
        }
      } catch (err) {
        setError('Server error.');
      }
    })();
  }

  return (
  <div style={{ background: '#fff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <div className="nurse-register-container">
        <h2>Nurse Registration</h2>
        <form className="nurse-register-form" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" />
          <input name="nurse_id_number" value={form.nurse_id_number} onChange={handleChange} required placeholder="Nurse ID Number" />
          <input name="contact_details" value={form.contact_details} onChange={handleChange} required placeholder="Contact Details" />
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email Address" />
          {/* Phone Number field removed */}
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
        onClick={() => navigate('/nurse/login')}
      >
        &#8592; Back
      </button>
    </div>
  );
}

export default NurseRegister;
