import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminAppointments.css';
import API from '../apiConfig';

function getMonthName(month) {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const apiBase = API;

function AdminAppointments() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [bookingDates, setBookingDates] = useState(new Set());

  React.useEffect(() => {
    loadBookings(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  function updateMonthDisplay() {
    return `${getMonthName(selectedDate.getMonth())} ${selectedDate.getFullYear()}`;
  }

  function loadBookings(date) {
    const dateStr = formatDate(date);
  fetch(`${apiBase}/api/admin/bookings?date=${dateStr}`)
      .then(response => response.json())
      .then(data => {
        setBookings(data);
        // Update bookingDates set with dates from the returned bookings
        try {
          const dates = new Set();
          data.forEach(b => {
            if (b.visit_date) dates.add(b.visit_date);
          });
          setBookingDates(dates);
        } catch (err) {
          setBookingDates(new Set());
        }
      })
      .catch(error => {
        setBookings([]);
      });
  }

  // When selected date changes, load bookings (this already runs via effect above)

  React.useEffect(() => {
    const canceledBy = localStorage.getItem('canceled_by');
    if (canceledBy) {
      setMessage(`Booking was canceled by: ${canceledBy}`);
      localStorage.removeItem('canceled_by'); // Clear after displaying
    }
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#fff', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      {/* Back button in top left corner */}
      <button
        type="button"
        onClick={() => window.location.href = '/admin/home'}
        style={{
          position: 'fixed',
          left: 18,
          top: 18,
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
          zIndex: 1002,
          fontWeight: 500,
          fontSize: 16
        }}
        aria-label="Back to Admin Home"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}>
          <path d="M12.5 15L8 10L12.5 5" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <h1 style={{ textAlign: 'center', marginBottom: 10, fontSize: '1.5em' }}>Clinic Admin Calendar</h1>
      <div className="calendar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px auto', maxWidth: 900 }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 720, width: '100%' }}>
            <Calendar
              onChange={(date) => {
                // react-calendar may return an array if range is enabled; ensure a Date
                const chosen = Array.isArray(date) ? date[0] : date;
                setSelectedDate(chosen);
                loadBookings(chosen);
              }}
              value={selectedDate}
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const dateStr = formatDate(date);
                  if (date.toDateString() === today.toDateString()) return 'react-calendar__tile--today';
                  if (date.toDateString() === selectedDate.toDateString()) return 'react-calendar__tile--active';
                  if (bookingDates.has(dateStr)) return 'has-bookings';
                }
                return null;
              }}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dateStr = formatDate(date);
                  if (bookingDates.has(dateStr)) {
                    return <div className="booking-dot" aria-hidden="true" />;
                  }
                }
                return null;
              }}
            />
          </div>
        </div>
        <div className="bookings" id="bookings" style={{ marginTop: 20, width: '100%', maxWidth: '1200px', minWidth: '900px', maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '20px' }}>
          <h3>Active Bookings</h3>
          {bookings.length === 0 ? (
            <div>No bookings for the selected day.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Patient</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Student/Staff Number</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phone Number</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Visit Date</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Slot</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{booking.patient_name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{booking.student_staff_number || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{booking.email || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{booking.phone_number || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{booking.visit_date}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{booking.visit_time}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      {booking.status === 'checked-in' ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Checked-in</span>
                      ) : (
                        <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                          <button style={{background:'#1976d2', color:'#fff', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}} onClick={async () => {
                            const checkInData = {
                              bookingId: booking.id,
                              patientName: booking.patient_name,
                              studentStaffNumber: booking.student_staff_number,
                              email: booking.email,
                              visitDate: booking.visit_date,
                              timeSlot: booking.visit_time,
                            };

                            // Debug: log payload to console
                            console.log('Check-in payload:', checkInData);

                            // Store all visits in localStorage array
                            let visits = JSON.parse(localStorage.getItem('checkedInPatientVisits') || '[]');
                            visits.push(checkInData);
                            localStorage.setItem('checkedInPatientVisits', JSON.stringify(visits));

                            // Also store the latest visit for compatibility
                            localStorage.setItem('checkedInPatientDetails', JSON.stringify(checkInData));

                            // Send payload to backend to insert into patient_checkin_payloads table
                            try {
                              await fetch(`${apiBase}/api/patient/checkin`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(checkInData)
                              });
                            } catch (err) {
                              console.error('Failed to send check-in to backend:', err);
                            }

                            // Also inform backend to mark this booking as checked-in
                              try {
                              const resp = await fetch(`${apiBase}/api/admin/check_in`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ bookingId: booking.id })
                              });
                              const result = await resp.json();
                              if (resp.ok) {
                                setMessage(result.message || 'Patient checked in successfully!');
                                // Remove the checked-in booking from the list so admin view shows remaining active bookings
                                const updatedBookings = bookings.filter(b => b.id !== booking.id);
                                setBookings(updatedBookings);
                              } else {
                                setMessage(result.error || 'Failed to mark booking as checked-in.');
                              }
                            } catch (err) {
                              console.error('Error marking booking checked-in:', err);
                              setMessage('Failed to mark booking as checked-in.');
                            }
                          }}>
                            Check-in
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAppointments;
