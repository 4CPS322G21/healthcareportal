import React, { useState, useEffect } from 'react';
import './NurseAppointments.css';
import API from '../apiConfig';

const NurseClinicVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);
      try {
  const res = await fetch(`${API}/api/patient/checkin/recent`);
        const data = await res.json();
        setVisits(data || []);
      } catch (err) {
        console.error('Failed to fetch clinic visits:', err);
        setVisits([]);
      }
      setLoading(false);
    }
    fetchVisits();
  }, []);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'auto', zIndex: 0 }}>
  <div style={{ position: 'fixed', left: 18, top: 18, zIndex: 1002 }}>
        <button
          type="button"
          onClick={() => window.location.href = '/nurse/home'}
          style={{
            background: 'white',
            border: '1px solid #b0c4de',
            borderRadius: '20px',
            width: 'auto',
            padding: '6px 14px',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 16
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 8}}>
            <path d="M12.5 15L8 10L12.5 5" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>Back</span>
        </button>
      </div>
      <div className="nurse-appointments" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
        <h1>Clinic Visits</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Student/Staff Number</th>
                <th>Email</th>
                <th>Visit Date</th>
                <th>Time Slot</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No clinic visits found.</td>
                </tr>
              ) : (
                visits.map((v, i) => (
                  <tr key={i}>
                    <td>{v.patient_name}</td>
                    <td>{v.student_staff_number}</td>
                    <td>{v.email}</td>
                    <td>{v.visit_date}</td>
                    <td>{v.time_slot}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NurseClinicVisits;
