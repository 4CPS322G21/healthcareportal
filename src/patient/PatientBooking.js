import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PatientBooking.css';
import './PatientBookingHighlight.css';
import { useLocation } from 'react-router-dom';
import backendUrl from '../apiConfig';

function PatientBooking() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [timeSlots, setTimeSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [monthSlotStatus, setMonthSlotStatus] = useState({});
  const [activeBooking, setActiveBooking] = useState(null);
  const [profile, setProfile] = useState(null);
  // backendUrl is imported from src/apiConfig.js
  const location = useLocation();

  // Helper to get YYYY-MM-DD string in local time (not UTC)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch patient profile info
  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) return;
    fetch(`${backendUrl}/api/user_profile?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  // Check for active booking on page load
  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) return;
    fetch(`${backendUrl}/api/active_booking?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.active) {
          setActiveBooking(data.booking);
        } else {
          setActiveBooking(null);
        }
      });
  }, []);

  // Load time slots for a given date (Date object)
  const loadTimeSlots = React.useCallback(async (dateObj) => {
    setLoadingSlots(true);
    setSlotsError('');
    setTimeSlots({});
    try {
      const dateStr = formatDate(dateObj);
      console.log('[DEBUG] Fetching time slots for:', dateStr);
      const res = await fetch(`${backendUrl}/time-slots?date=${dateStr}`);
      if (!res.ok) {
        setSlotsError('Failed to fetch time slots.');
        setLoadingSlots(false);
        return;
      }
      const data = await res.json();
      console.log('[DEBUG] Backend response for', dateStr, ':', data);

      // Backend now returns slot objects: { start, end, remaining }
      // Normalize into a consistent map: start -> slotObj
      const updatedSlots = {};
      for (const [start, slotObj] of Object.entries(data)) {
        // slotObj may be either a number (backwards-compat) or an object
        if (slotObj && typeof slotObj === 'object' && 'remaining' in slotObj) {
          updatedSlots[start] = slotObj;
        } else {
          // fallback: numeric or old format
          const remaining = typeof slotObj === 'number' ? slotObj : (slotObj === 'Not Available' ? 0 : (slotObj > 0 ? slotObj : 0));
          updatedSlots[start] = { start, end: start, remaining };
        }
      }

      setTimeSlots(updatedSlots);
    } catch (err) {
      setSlotsError('Failed to fetch time slots.');
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Fetch time slots from backend whenever selectedDay changes
  useEffect(() => {
    if (selectedDay) loadTimeSlots(selectedDay);
  }, [selectedDay, loadTimeSlots]);

  // Fetch booking status on page load (placeholder for profile-based logic)
  useEffect(() => {
    // Removed admin cancel logic
  }, [profile]);

  // Fetch slot status for all days in the visible month
  const fetchMonthSlotStatus = ({ activeStartDate }) => {
    const days = [];
    const year = activeStartDate.getFullYear();
    const month = activeStartDate.getMonth();
    for (let d = 1; d <= 31; d++) {
      const date = new Date(year, month, d);
      if (date.getMonth() !== month) break;
      days.push(formatDate(date));
    }
    Promise.all(
      days.map(dateStr =>
        fetch(`${backendUrl}/time-slots?date=${dateStr}`)
          .then(res => res.ok ? res.json() : {})
          .then(data => ({ dateStr, slots: data }))
      )
    ).then(results => {
      const status = {};
      for (const { dateStr, slots } of results) {
        if (slots && Object.keys(slots).length > 0) {
          // If every slot has remaining === 0, mark fully booked
          const allZero = Object.values(slots).every(s => {
            if (s && typeof s === 'object' && 'remaining' in s) return s.remaining === 0
            if (typeof s === 'number') return s === 0
            return false
          })
          if (allZero) status[dateStr] = 'fully-booked'
        }
      }
      setMonthSlotStatus(status);
    });
  };


  function handleDayChange(date) {
    setSelectedDay(date);
    setSelectedTimeSlot(null);
    setConfirmationMessage('');
  }

  async function handleConfirmBooking() {
    if (!selectedDay || !selectedTimeSlot) {
      setConfirmationMessage('⚠️ Please select a slot.');
      return;
    }
    if (!profile) {
      setConfirmationMessage('⚠️ Unable to fetch profile. Please contact support or try logging in again.');
      return;
    }
    // Submit booking to backend with patient info
    const bookingData = {
      patient_name: profile.full_name,
      student_staff_number: profile.student_staff_number,
      email: profile.email,
      phone_number: profile.contact_details,
      visit_date: formatDate(selectedDay),
      visit_time: selectedTimeSlot
    };
    const res = await fetch(`${backendUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (res.ok) {
      setConfirmationMessage('✅ Booking confirmed!');
      setActiveBooking(data.booking);
      // Refresh slots to reflect the newly booked slot
      loadTimeSlots(selectedDay);
    } else {
      setConfirmationMessage(data.error || 'Failed to confirm booking.');
    }
  }

  // Helper to check if selectedDay is in the past (before today)
  const isPastDay = (() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const sel = new Date(selectedDay);
    sel.setHours(0,0,0,0);
    return sel < today;
  })();

  // Helper to check if a particular slot (slotObj) is already in the past using its END time
  const isSlotInPast = (slotObj) => {
    if (!selectedDay || !slotObj) return false;
    if (isPastDay) return true;
    try {
      // Consider a slot passed if the start time + GRACE_MINUTES has passed
      const GRACE_MINUTES = 15;
      const [startH, startM] = slotObj.start.split(':').map(s => parseInt(s, 10));
      const slotStartDate = new Date(selectedDay);
      slotStartDate.setHours(startH, startM, 0, 0);
      const graceDate = new Date(slotStartDate.getTime() + GRACE_MINUTES * 60 * 1000);
      const now = new Date();
      return now >= graceDate;
    } catch (e) {
      return false;
    }
  };

  const hasCompleteProfile = (p) => {
    if (!p) return false;
    // Expect these fields for a complete profile
    return p.full_name && p.student_staff_number && p.email && p.contact_details;
  };

  // Set confirmation message from navigation state (e.g. after cancellation)
  useEffect(() => {
    if (location.state?.message) {
      setConfirmationMessage(location.state.message);
    }
  }, [location.state]);

  // Removed admin cancel localStorage logic

  const handleOkClick = () => {
    setConfirmationMessage('');
    localStorage.removeItem('canceled_by'); // Clear the canceled_by field
  };

  return (
    <div className="booking-bg">
      <button
        className="booking-back-btn"
        title="Go Back"
        onClick={() => window.history.back()}
        aria-label="Go back"
      >
        <span style={{fontSize: '1.7rem', color: '#0d3b66'}}>&#8592;</span>
      </button>
      <div className="booking-header">Appointment Booking</div>
      <div className="booking-content">
        <React.Fragment>
          {confirmationMessage === 'show-active-booking' && activeBooking ? (
            <div className="active-booking-info" style={{color:'#1976d2', fontWeight:'bold', fontSize:'1.2rem', margin:'0 auto'}}>
              <div>You already have an active booking:</div>
              <div>Date: {activeBooking.visit_date}</div>
              <div>Time: {activeBooking.visit_time}</div>
              <div>Patient: {activeBooking.patient_name}</div>
              <div>Student/Staff Number: {activeBooking.student_staff_number}</div>
              <div>Email: {activeBooking.email}</div>
              <div>Phone: {activeBooking.phone_number}</div>
              <div style={{color:'#d32f2f', marginTop:10}}>Cancel your booking to book again.</div>
              <button style={{marginTop:16, background:'#d32f2f', color:'#fff', border:'none', padding:'10px 20px', borderRadius:6, cursor:'pointer', marginRight:8}} onClick={async () => {
                const res = await fetch(`${backendUrl}/api/cancel_booking`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: activeBooking.id })
                });
                if (res.ok) {
                  setActiveBooking(null);
                  setConfirmationMessage('Booking cancelled. You can book again.');
                } else {
                  setConfirmationMessage('Failed to cancel booking.');
                }
              }}>Cancel Booking</button>
              <button style={{marginTop:16, background:'#1976d2', color:'#fff', border:'none', padding:'6px 14px', borderRadius:6, cursor:'pointer'}} onClick={() => setConfirmationMessage('')}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="calendar-section">
                <Calendar
                  onChange={handleDayChange}
                  value={selectedDay}
                  className="react-calendar"
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      const dateStr = formatDate(date);
                      if (monthSlotStatus[dateStr] === 'fully-booked') {
                        return 'fully-booked';
                      }
                    }
                    return null;
                  }}
                  onActiveStartDateChange={fetchMonthSlotStatus}
                  formatShortWeekday={(locale, date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                />
                <div className="calendar-legend">
                  <span className="legend available">Available</span>
                  <span className="legend booked">Fully Booked</span>
                </div>
              </div>
              <div className="timeslot-section">
                <div className="timeslot-title">Time</div>
                {/* Scrollable list container - only this area scrolls */}
                <div className="timeslot-list">
                {/* Profile error message is now shown only after booking attempt. */}
                {isPastDay ? (
                  <div style={{ color: '#888', margin: '10px 0' }}>No time slots available for this day.</div>
                ) : loadingSlots ? (
                  <div style={{ color: '#888', margin: '10px 0' }}>Loading time slots...</div>
                ) : slotsError ? (
                  <div style={{ color: '#d32f2f', margin: '10px 0' }}>{slotsError}</div>
                ) : Object.keys(timeSlots).length === 0 ? (
                  <div style={{ color: '#888', margin: '10px 0' }}>No time slots available for this day.</div>
                ) : (
                  Object.entries(timeSlots).map(([time, slotObj]) => {
                    const past = isSlotInPast(slotObj);
                    const remaining = slotObj?.remaining ?? 0;
                    const cls = past ? 'past' : (remaining > 0 ? 'available' : 'booked');
                    const disabledCondition = remaining === 0 || past;
                      return (
                      <div key={time} className={`timeslot-row ${cls}`}>
                        {/* Left: radio button */}
                        <div className="timeslot-radio">
                          <input
                            type="radio"
                            name="timeslot"
                            value={slotObj.start}
                            checked={selectedTimeSlot === slotObj.start}
                            disabled={disabledCondition}
                            onChange={() => {
                              if (activeBooking) {
                                setConfirmationMessage('active-booking-blocked');
                              } else {
                                setSelectedTimeSlot(slotObj.start);
                              }
                            }}
                            style={{ width: 16, height: 16 }}
                          />
                        </div>

                        {/* Middle: time range */}
                        <div className="timeslot-time">
                          <div style={{ fontWeight: 600 }}>{slotObj.start} - {slotObj.end}</div>
                        </div>

                        {/* Right: status / badge */}
                        <div className="timeslot-status">
                          {past ? (
                            <span style={{ color: '#888' }}>Passed</span>
                          ) : remaining > 0 ? (
                            <span className="slot-available">Available Slots: {remaining}</span>
                          ) : (
                            <span className="slot-full">Fully Booked</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
                {/* Confirm button below the scrollable list so it remains visible */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <button className="confirm-btn" onClick={handleConfirmBooking} disabled={isPastDay || !hasCompleteProfile(profile)}>
                    Confirm Booking
                  </button>
                </div>
                {/* Only show generic confirmation messages if not a special case */}
                {confirmationMessage && !['active-booking-blocked', 'show-active-booking'].includes(confirmationMessage) && (
                  <div className="friendly-message">
                    <p>{confirmationMessage}</p>
                    <button onClick={handleOkClick} className="confirm-btn">OK</button>
                  </div>
                )}
                {confirmationMessage === 'active-booking-blocked' && activeBooking && (
                  <div className="friendly-message" style={{color:'#1976d2', background:'none', border:'none'}}>
                    <p style={{color:'#1976d2'}}>You do have an active booking, only one booking is allowed.</p>
                    <button
                      className="my-booking-btn"
                      style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem', marginRight: 8 }}
                      onClick={() => setConfirmationMessage('show-active-booking')}
                    >
                      MyBooking
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </React.Fragment>
      </div>
    </div>
  );
}

export default PatientBooking;
