import React, { useState, useEffect } from 'react';
import './NurseAppointments.css';

const NurseAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecent, setShowRecent] = useState(false);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showRecent) {
        const checkedInPatientDetails = localStorage.getItem('checkedInPatientDetails');
        if (checkedInPatientDetails) {
          const patientDetails = JSON.parse(checkedInPatientDetails);
          setAppointments([patientDetails]);
        } else {
          setAppointments([]);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showRecent]);

  useEffect(() => {
    if (showRecent) {
      // Fill Clinic Visit table from localStorage, mapping keys to expected format
      const checkedInPatientDetails = localStorage.getItem('checkedInPatientDetails');
      if (checkedInPatientDetails) {
        const patientDetails = JSON.parse(checkedInPatientDetails);
        // Map keys to expected format for table
        const mappedDetails = {
          patient_name: patientDetails.patientName || '',
          student_staff_number: patientDetails.studentStaffNumber || '',
          email: patientDetails.email || '',
          visit_date: patientDetails.visitDate || '',
          time_slot: patientDetails.timeSlot || ''
        };
        setRecentVisits([mappedDetails]);
      } else {
        setRecentVisits([]);
      }
    }
  }, [showRecent]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      {/* Back and Recent Visit buttons in bottom left corner */}
      <div style={{ position: 'fixed', left: 18, bottom: 18, display: 'flex', gap: '10px', zIndex: 1002 }}>
        <button
          type="button"
          onClick={() => window.location.href = '/nurse/home'}
          style={{
            background: 'white',
            border: '1px solid #b0c4de',
            borderRadius: '20px',
            width: 70,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 16
          }}
          aria-label="Back to Nurse Home"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}>
            <path d="M12.5 15L8 10L12.5 5" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>
      <div className="nurse-appointments" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
        <div className="card">
          <h1>Nurse Appointments</h1>
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
            {showRecent
              ? (recentVisits.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No recent visits found.</td>
                  </tr>
                ) : (
                  recentVisits.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.student_staff_number}</td>
                      <td>{appointment.email}</td>
                      <td>{appointment.visit_date}</td>
                      <td>{appointment.time_slot}</td>
                    </tr>
                  ))
                ))
              : (appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No patient checked-in yet.</td>
                  </tr>
                ) : (
                  appointments.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.studentStaffNumber}</td>
                      <td>{appointment.email}</td>
                      <td>{appointment.visitDate}</td>
                      <td>{appointment.timeSlot}</td>
                    </tr>
                  ))
                ))}
          </tbody>
        </table>
          <div className="controls">
            {!showRecent && appointments.length > 0 && (
              <button
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setAppointments([]);
                  localStorage.removeItem('checkedInPatientDetails');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseAppointments;