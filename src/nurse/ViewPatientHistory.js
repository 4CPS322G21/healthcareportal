import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendUrl from '../apiConfig';
import '../patient/PatientRecord.css';

export default function ViewPatientHistory() {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem('user_email');

  useEffect(() => {
    // Automatically fetch patient details for the logged-in user (no search box)
    const fetchData = async () => {
      if (!email) {
        setError('No patient email found.');
        return;
      }
      setLoading(true);
      setError('');
  try {
  // Use the patient blueprint endpoint (same as PatientRecord) to fetch full patient file
  const res = await fetch(`${backendUrl}/patients/update_patient?email=${encodeURIComponent(email)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || 'Failed to fetch patient record.');
          return;
        }
        const data = await res.json();
        // If backend returns an array, treat it as records, else assume it's a patient object
        if (Array.isArray(data)) {
          setPatient({ email, name: '', student_staff_number: '', phone_number: '', address: '', records: data });
        } else if (data && typeof data === 'object') {
          const records = data.records || data.history || (Array.isArray(data) ? data : []);
          const profile = data.profile || data.patient || data;
          setPatient({
            email: profile.email || email,
            name: profile.name || profile.full_name || '',
            student_staff_number: profile.student_staff_number || profile.student_number || '',
            phone_number: profile.phone_number || profile.phone || '',
            address: profile.address || profile.residence || '',
            records: Array.isArray(records) ? records : [],
          });
        } else {
          setError('No patient record found.');
        }
      } catch (e) {
        setError('Failed to fetch patient record.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email]);

  return (
    <div className="record-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', minHeight: '100vh', margin: 0, padding: 0, zIndex: 0 }}>
      <div className="record-appbar">
        <button className="back-arrow" onClick={() => navigate(-1)}>&larr;</button>
        <span className="record-title">Patient Record</span>
      </div>
  <div className="record-body" style={{ padding: 20, boxSizing: 'border-box', maxHeight: 'calc(100vh - 72px)', overflowY: 'auto', paddingBottom: 40 }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: '#d32f2f', marginBottom: 16 }}>{error}</div>}
        {patient && (
          <>
            <div className="patient-details" style={{ border: '1px solid #ccc', padding: 10, marginBottom: 12, background: '#fff', color: '#111' }}>
              <h2 style={{ color: '#111' }}>Patient Details</h2>
              <p style={{ color: '#111' }}><strong>Email:</strong> <span>{patient.email}</span></p>
              <p style={{ color: '#111' }}><strong>Name:</strong> <span>{patient.name || 'N/A'}</span></p>
              <p style={{ color: '#111' }}><strong>Student/Staff Number:</strong> <span>{patient.student_staff_number || 'N/A'}</span></p>
              <p style={{ color: '#111' }}><strong>Phone Number:</strong> <span>{patient.phone_number || 'N/A'}</span></p>
              <p style={{ color: '#111' }}><strong>Address:</strong> <span>{patient.address || 'N/A'}</span></p>
            </div>

            <h2 style={{ color: '#111', marginTop: 6 }}>Visit Records</h2>
            <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', paddingRight: 12, marginTop: 8, paddingBottom: 20 }}>
              {Array.isArray(patient.records) && patient.records.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafafa' }}>
                  <thead>
                    <tr style={{ background: '#e3f2fd' }}>
                      <th style={{ border: '1px solid #ccc', padding: 8 }}>Date</th>
                      <th style={{ border: '1px solid #ccc', padding: 8 }}>Diagnosis</th>
                      <th style={{ border: '1px solid #ccc', padding: 8 }}>Treatment</th>
                      <th style={{ border: '1px solid #ccc', padding: 8 }}>Nurse Name</th>
                      <th style={{ border: '1px solid #ccc', padding: 8 }}>Nurse Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.records.map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{rec.visit_date || rec.date || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{rec.diagnosis || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{rec.treatment || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{rec.nurse_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{rec.nurse_email || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: '#888', marginTop: 10 }}>No visit records found.</div>
              )}
              {/* spacer to ensure the last row can scroll fully into view on small screens */}
              <div style={{ height: 24 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
