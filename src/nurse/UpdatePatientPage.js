import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

import API from '../apiConfig';
const backendUrl = API; // Update with your backend URL

function UpdatePatientPage() {
  const today = new Date().toISOString().split('T')[0];
  const [email, setEmail] = useState('');
  const [patient, setPatient] = useState(null);
  const [visitDate, setVisitDate] = useState(today); // Default to today's date
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [message, setMessage] = useState('');
  const [errorText, setErrorText] = useState(null);
  const navigate = useNavigate();

  const searchPatient = async () => {
    if (!email) {
      setMessage('Please enter the patient email.');
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/patients/update_patient?email=${email}`);
      const data = await response.json();
      if (data.error) {
        setMessage(data.error);
        setPatient(null);
        return;
      }
      setPatient(data);
      // Persist the searched email so other pages (e.g., ViewPatientHistory) can use it
      try { localStorage.setItem('user_email', email); } catch (e) { /* ignore if storage not available */ }
    } catch (error) {
      setMessage('Error searching for patient: ' + error);
    }
  };

  const updateRecord = async () => {
    if (!email || !visitDate) {
      setMessage('Please enter the patient email and visit date.');
      return;
    }
    // Client-side validation: require both diagnosis and treatment
    if (!diagnosis || diagnosis.trim() === '' || !treatment || treatment.trim() === '') {
      // Show friendly inline message (same area used for success messages)
      setMessage('Please provide both a diagnosis and a treatment before updating the record.');
      return;
    }
    const payload = {
      email,
      date: visitDate,
      diagnosis,
      treatment,
      nurse_name: localStorage.getItem('nurse_name'), 
      nurse_email: localStorage.getItem('nurse_email') 
    };
    console.log('Payload being sent to backend:', JSON.stringify(payload, null, 2)); // Debugging log
    try {
      const response = await fetch(`${backendUrl}/patients/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        // Try to read error message from server and show inline
        let errorMsg = 'An error occurred while updating the record.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // ignore JSON parse error
        }
        setMessage(errorMsg);
        return;
      }
      const data = await response.json();
      setMessage(data.message || 'Record updated successfully.');
    } catch (error) {
      setMessage('Error updating record: ' + error.message);
    }
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      {/* Back button outside the container */}
      <button
        onClick={() => navigate('/nurse/home')}
        style={{ position: 'absolute', top: 20, left: 20, padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', zIndex: 10 }}
      >
        Back
      </button>
      <div style={{ fontFamily: 'Arial, sans-serif', margin: 20, background: 'transparent', minHeight: '80vh', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, maxWidth: 800, width: '100%', marginLeft: 'auto', marginRight: 'auto', position: 'relative', zIndex: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 40px)' }}>
        <h1>Search Patient</h1>
        <h2>Update Patient File</h2>
        <form onSubmit={e => e.preventDefault()} id="searchPatientForm">
          <style>{`
            ::placeholder { color: #444 !important; font-size: 1rem !important; opacity: 1 !important; }
          `}</style>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter patient email"
              required
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }}
            />
          </div>
          <div className="form-group">
            <button type="button" onClick={searchPatient} style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
        </form>

        {patient && patient.email && (
          <div className="patient" style={{ border: '1px solid #ccc', padding: 10, marginTop: 20, background: '#fff', color: '#111' }}>
            <h2 style={{color:'#111'}}>Patient Details</h2>
            <p style={{color:'#111'}}><strong>Email:</strong> <span>{patient.email}</span></p>
            <p style={{color:'#111'}}><strong>Name:</strong> <span>{patient.name || 'N/A'}</span></p>
            <p style={{color:'#111'}}><strong>Student/Staff Number:</strong> <span>{patient.student_staff_number || 'N/A'}</span></p>
            <p style={{color:'#111'}}><strong>Phone Number:</strong> <span>{patient.phone_number || 'N/A'}</span></p>
            <p style={{color:'#111'}}><strong>Address:</strong> <span>{patient.address || 'N/A'}</span></p>

            {/* Update Record Fields */}
            <form onSubmit={e => e.preventDefault()} id="updateRecordForm">
              <div className="form-group">
                <input
                  type="date"
                  id="visitDate"
                  value={visitDate}
                  readOnly
                  placeholder="Visit Date"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <textarea
                  id="diagnosis"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Diagnosis"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <textarea
                  id="treatment"
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}
                  placeholder="Treatment"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="nurseName"
                  value={localStorage.getItem('nurse_name') || 'Not Applicable'}
                  readOnly
                  placeholder="Nurse Name"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: '1rem' }}
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  id="nurseEmail"
                  value={localStorage.getItem('nurse_email') || 'Not Applicable'}
                  readOnly
                  placeholder="Nurse Email"
                />
              </div>
              <div className="form-group">
                <button type="button" onClick={updateRecord} style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>Update Record</button>
              </div>
            </form>

            {/* View History Button */}
            <div>
              <button
                onClick={() => {
                  try { localStorage.setItem('user_email', email); } catch (e) { }
                  navigate('/nurse/view-history', { state: { email } });
                }}
                style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', marginTop: 10 }}
              >
                View History
              </button>
            </div>
          </div>
        )}

        {message && (
          <div style={{ color: message.toLowerCase().includes('success') ? '#388e3c' : '#d32f2f', marginTop: 10, fontWeight: 'bold' }}>{message}</div>
        )}
      </div>
    </div>
  );
}

export default UpdatePatientPage;
