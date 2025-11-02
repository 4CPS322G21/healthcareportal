import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import API from '../apiConfig';

function RecordsPage() {
  // State for new patient
  const [newPatient, setNewPatient] = useState({
    email: '',
    studentStaffNumber: '',
    name: '',
    phoneNumber: '',
    address: ''
  });
  // State for search
  const [search, setSearch] = useState({
    email: '',
    studentStaffNumber: ''
  });
  // State for search result
  const [patientResult, setPatientResult] = useState(null);
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const handleNewChange = e => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const handleSearchChange = e => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const createPatient = async () => {
    const { email, studentStaffNumber, name, phoneNumber, address } = newPatient;
    if (!email || !studentStaffNumber || !name) {
      setMessage('Please fill in all required fields.');
      return;
    }
    const payload = {
      email,
      student_staff_number: studentStaffNumber,
      name,
      phone_number: phoneNumber,
      address
    };
    try {
  const response = await fetch(`${API}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error creating patient: ' + error);
    }
  };

  const searchPatient = async () => {
    const { email, studentStaffNumber } = search;
    if (!email && !studentStaffNumber) {
      setMessage('Please enter either email or student/staff number.');
      return;
    }
  let url = `${API}/patients?`;
    if (email) {
      url += `email=${email}`;
    } else if (studentStaffNumber) {
      url += `student_staff_number=${studentStaffNumber}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        setPatientResult({ error: data.error });
      } else {
        setPatientResult(data);
      }
    } catch (error) {
      setPatientResult({ error: 'Error searching patient: ' + error });
    }
  };

  if (showCreate) {
    return (
      <div style={{ background: '#ffffff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 10010, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 48 }}>
        <div style={{ padding: 28, borderRadius: 12, maxWidth: 1000, width: '95%', margin: '24px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#ffffff', position: 'relative', zIndex: 10011 }}>
          <h1 style={{ textAlign: 'center', marginBottom: 18 }}>Create a New Patient File</h1>
        <style>{`
          ::placeholder {
            color: #444 !important;
            font-size: 1rem !important;
            opacity: 1 !important;
          }
        `}</style>
        <form>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <input type="email" id="new-email" name="email" placeholder="Enter patient email" value={newPatient.email} onChange={handleNewChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <input type="text" id="new-student-staff-number" name="studentStaffNumber" placeholder="Enter student/staff number" value={newPatient.studentStaffNumber} onChange={handleNewChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <input type="text" id="new-name" name="name" placeholder="Enter patient name" value={newPatient.name} onChange={handleNewChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <input type="text" id="new-phone-number" name="phoneNumber" placeholder="Enter phone number" value={newPatient.phoneNumber} onChange={handleNewChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <textarea id="new-address" name="address" placeholder="Enter address" value={newPatient.address} onChange={handleNewChange} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', minHeight: 80, background: '#fff', fontSize: '1rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <button type="button" onClick={createPatient} style={{ padding: '14px 28px', background: '#007BFF', color: 'white', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', width: '100%' }}>Create Patient</button>
          </div>
          </form>
          {message && <div style={{ color: 'green', marginBottom: 20, textAlign: 'center' }}>{message}</div>}
        </div>
        {/* Back button fixed bottom-left */}
        <button
          onClick={() => navigate('/nurse/home')}
          style={{ position: 'fixed', left: 18, bottom: 18, background: '#1976d2', color: 'white', border: 'none', borderRadius: 20, width: 90, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.13)', cursor: 'pointer', zIndex: 10012, fontWeight: 600 }}
        >
          Back
        </button>
      </div>
    );
  }

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
          filter: 'blur(4px) brightness(0.6)',
          zIndex: -1
        }}
      />
      <h1>UNIZULU HEALTH CARE PORTAL</h1>
      <p>Select an action:</p>
      {message && (
        <div style={{ color: '#d32f2f', marginTop: 8, marginBottom: 8 }}>{message}</div>
      )}
      <div className="role-buttons">
        <button onClick={() => { setMessage(''); setShowCreate(true); }}>Create a New Patient File</button>
        <button onClick={() => { setMessage(''); navigate('/nurse/update-patient'); }}>Update an Existing Patient File</button>
      </div>
    </div>
  );
}

export default RecordsPage;
