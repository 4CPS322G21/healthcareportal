import React, { useState } from 'react';
import API from '../apiConfig';
import './AddStaff.css';

function AddStaff() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Nurse', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API}/admin/add_staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Staff member added successfully.');
        setForm({ name: '', email: '', phone: '', role: 'Nurse', password: '' });
      } else {
        setError(data.error || 'Failed to add staff member.');
      }
    } catch (err) {
      setError('Server error.');
    }
  }

  return (
    <div className="add-staff-container">
      <h2>Add Nurse/Staff</h2>
      <form className="add-staff-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" />
        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email Address" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact Number" />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Nurse">Nurse</option>
          <option value="Doctor">Doctor</option>
          <option value="Receptionist">Receptionist</option>
        </select>
        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Password" />
        <button type="submit">Add Staff</button>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default AddStaff;
