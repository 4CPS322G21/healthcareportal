import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRecord.css';

import backendUrl from '../apiConfig';

function PatientRecord() {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('user_email');

  useEffect(() => {
    if (!email) {
      setError('No patient email found.');
      return;
    }
    fetch(`${backendUrl}/patients/update_patient?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPatient(data);
        }
      })
      .catch(err => setError('Failed to fetch patient record.'));
  }, [email]);

  return (
    <div className="record-container" style={{position: 'fixed', inset: 0, minHeight: '100vh', margin: 0, padding: 0, zIndex: 0}}>
      <div className="record-appbar">
        <button className="back-arrow" onClick={() => navigate(-1)}>&larr;</button>
        <span className="record-title">Patient Record</span>
      </div>
      <div className="record-body" style={{ padding: 20, boxSizing: 'border-box', maxHeight: 'calc(100vh - 72px)', overflowY: 'auto', paddingBottom: 40 }}>
        {error && <div style={{ color: '#d32f2f', marginBottom: 16 }}>{error}</div>}
        {patient && (
          <>
            <div className="patient-details" style={{ border: '1px solid #ccc', padding: 10, marginBottom: 12, background: '#fff', color: '#111' }}>
              <h2 style={{color:'#111'}}>Patient Details</h2>
              <p style={{color:'#111'}}><strong>Email:</strong> <span>{patient.email}</span></p>
              <p style={{color:'#111'}}><strong>Name:</strong> <span>{patient.name || 'N/A'}</span></p>
              <p style={{color:'#111'}}><strong>Student/Staff Number:</strong> <span>{patient.student_staff_number || 'N/A'}</span></p>
              <p style={{color:'#111'}}><strong>Phone Number:</strong> <span>{patient.phone_number || 'N/A'}</span></p>
              <p style={{color:'#111'}}><strong>Address:</strong> <span>{patient.address || 'N/A'}</span></p>
            </div>

            <h2 style={{color:'#111', marginTop: 6}}>Visit Records</h2>
            {/* Scrollable table container - keeps header and patient details pinned */}
            <div className="records-table-wrap">
              {Array.isArray(patient.records) && patient.records.length > 0 ? (
                <div className="table-responsive">
                  <table className="visit-records-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Nurse Name</th>
                        <th>Nurse Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.records.map((rec, idx) => (
                        <tr key={idx}>
                          <td>{rec.visit_date || rec.date || 'N/A'}</td>
                          <td>{rec.diagnosis || 'N/A'}</td>
                          <td>{rec.treatment || 'N/A'}</td>
                          <td>{rec.nurse_name || 'N/A'}</td>
                          <td>{rec.nurse_email || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-records">No visit records found.</div>
              )}
              <div style={{ height: 24 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientRecord;
