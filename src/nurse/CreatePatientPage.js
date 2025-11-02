import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../apiConfig';

function CreatePatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    student_staff_number: '',
    name: '',
    phone_number: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    const { email, student_staff_number, name, phone_number, address } = form;
    if (!email || !student_staff_number || !name) {
      setError('Please fill in all required fields.');
      return;
    }
    const payload = {
      email,
      student_staff_number,
      name,
      phone_number,
      address
    };
    try {
  const res = await fetch(`${API}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setSuccess(data.message);
        setForm({ email: '', student_staff_number: '', name: '', phone_number: '', address: '' });
        navigate('/nurse/update-patient');
      } else {
        setError(data.error || 'Error creating patient file.');
      }
    } catch (err) {
      setError('Error creating patient: ' + (err.message || err));
    }
  };

  return (
  <div style={{ background: '#ffffff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 10010, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 48 }}>
      {/* Back button in bottom left corner */}
      <button
        type="button"
        onClick={() => navigate('/nurse/home')}
        style={{
          position: 'fixed',
          left: 18,
          bottom: 18,
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          width: 80,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
          cursor: 'pointer',
          zIndex: 1002,
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: 1
        }}
        aria-label="Back to Nurse Home"
      >
        Back
      </button>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', width: '100vw', background: 'transparent', paddingTop: 12 }}>
    <h1 style={{ marginTop: 6 }}>New Patient File</h1>
  <form onSubmit={handleSubmit} style={{ width: '95%', maxWidth: 1000, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: 28, background: '#ffffff', position: 'relative', zIndex: 10011 }}>
          <div className="form-group">
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Patient Email" required />
          </div>
          <div className="form-group">
            <input type="text" name="student_staff_number" value={form.student_staff_number} onChange={handleChange} placeholder="Student/Staff Number" required />
          </div>
          <div className="form-group">
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Patient Name" required />
          </div>
          <div className="form-group">
            <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Phone Number" />
          </div>
          <div className="form-group">
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" />
          </div>
          <div className="form-group">
            <button type="submit">Create Patient File</button>
          </div>
          {success && <div style={{ color: '#388e3c', marginTop: 10 }}>{success}</div>}
          {error && <div style={{ color: '#d32f2f', marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default CreatePatientPage;
