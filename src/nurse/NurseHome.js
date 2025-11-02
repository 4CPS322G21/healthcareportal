import React, { useEffect } from 'react';
import './NurseHome.css';
import { useNavigate } from 'react-router-dom';

function NurseHome() {
	const navigate = useNavigate();

	// Redirect to login if nurse session is missing
	useEffect(() => {
		const nurseEmail = localStorage.getItem('nurse_email');
		if (!nurseEmail) {
			window.location.href = '/nurse/login';
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('nurse_email');
		localStorage.removeItem('nurse_name');
		window.location.href = '/nurse/login';
	};

	return (
		<div className="nurse-home-bg nurse-home-layout" style={{ position: 'relative', overflow: 'hidden' }}>
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					background: 'url("/nurse-room.jpg") no-repeat center center/cover',
					filter: 'blur(1px) brightness(0.8)',
					zIndex: -1
				}}
			/>
			<aside className="nurse-sidebar nurse-sidebar-new">
				<div className="sidebar-links-new">
					<button className="sidebar-btn" onClick={() => navigate('/nurse/appointments')}>Appointments</button>
					<button className="sidebar-btn" onClick={() => navigate('/nurse/records')}>Records</button>
					<button className="sidebar-btn" onClick={() => navigate('/nurse/profile')}>Profile</button>
					<button className="sidebar-btn" onClick={() => navigate('/nurse/clinic-visits')}>Clinic Visit</button>
					<button className="sidebar-btn logout" onClick={handleLogout}>Logout</button>
				</div>
			</aside>
			<main className="nurse-main-content">
				<div className="nurse-header-new" style={{textAlign: 'center'}}>
					<div className="center-text">UNIZULU HEALTH CARE CLINIC</div>
				</div>
				<div className="center-content">
					<div className="center-text">Welcome to Unizulu Nurse Dashboard</div>
				</div>
			</main>
		</div>
	);
}

export default NurseHome;
