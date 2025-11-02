import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SelectionPage from './SelectionPage';
import AdminLogin from './admin/AdminLogin';
import NurseLogin from './nurse/NurseLogin';
import NurseHome from './nurse/NurseHome';
import PatientLogin from './patient/PatientLogin';
import PatientRegister from './patient/PatientRegister';
import PatientHome from './patient/PatientHome';
import PatientRecord from './patient/PatientRecord';
import PatientProfile from './patient/PatientProfile';
import PatientBooking from './patient/PatientBooking';
import PatientResetPassword from './patient/PatientResetPassword';
import RecordsPage from './nurse/RecordsPage';
import UpdatePatientPage from './nurse/UpdatePatientPage';
import ViewPatientHistory from './nurse/ViewPatientHistory';
import AdminHome from './admin/AdminHome';
import AdminAppointments from './admin/AdminAppointments';
import NurseRegister from './nurse/NurseRegister';
import SuperAdminLogin from './superadmin/SuperAdminLogin';
import SuperAdminHome from './superadmin/SuperAdminHome';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NurseProfile from './nurse/NurseProfile';
import NurseAppointments from './nurse/NurseAppointments';
import NurseClinicVisits from './nurse/NurseClinicVisits';
import AdminProfile from './admin/AdminProfile';
import AdminSelectionPage from './AdminSelectionPage';
import AdminRegister from './admin/AdminRegister';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/nurse/login" element={<NurseLogin />} />
        <Route path="/nurse/home" element={<NurseHome />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/record" element={<PatientRecord />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/booking" element={<PatientBooking />} />
        <Route path="/patient/reset-password" element={<PatientResetPassword />} />
        <Route path="/nurse/records" element={<RecordsPage />} />
        <Route path="/nurse/update-patient" element={<UpdatePatientPage />} />
        <Route path="/nurse/view-history" element={<ViewPatientHistory />} />
        <Route path="/admin/home" element={<AdminHome />} />
  <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/nurse/register" element={<NurseRegister />} />
        <Route path="/admin-selection" element={<AdminSelectionPage />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/home" element={<SuperAdminHome />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/nurse/appointments" element={<NurseAppointments />} />
  <Route path="/nurse/profile" element={<NurseProfile />} />
  <Route path="/admin/profile" element={<AdminProfile />} />
  <Route path="/nurse/clinic-visits" element={<NurseClinicVisits />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
