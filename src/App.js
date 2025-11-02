import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientLogin from './patient/PatientLogin';
import PatientHome from './patient/PatientHome';
import ProtectedRoute from './components/ProtectedRoute';
import PatientResetPassword from './patient/PatientResetPassword';
import NurseProfile from './nurse/NurseProfile';
import NurseHome from './nurse/NurseHome';
import ViewPatientHistory from './nurse/ViewPatientHistory';
import RecordsPage from './nurse/RecordsPage';
import PatientRecord from './patient/PatientRecord';
import PatientBooking from './patient/PatientBooking';
import PatientProfile from './patient/PatientProfile';
import AdminSelectionPage from './AdminSelectionPage';
import NurseAppointments from './nurse/NurseAppointments';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
    <Route path="/patient/login" element={<PatientLogin />} />
    <Route path="/patient/home" element={<ProtectedRoute><PatientHome /></ProtectedRoute>} />
    <Route path="/patient/reset-password" element={<PatientResetPassword />} />
    <Route path="/patient/record" element={<ProtectedRoute><PatientRecord /></ProtectedRoute>} />
    <Route path="/patient/booking" element={<ProtectedRoute><PatientBooking /></ProtectedRoute>} />
    <Route path="/patient/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
    <Route path="/nurse/home" element={<ProtectedRoute><NurseHome /></ProtectedRoute>} />
    <Route path="/nurse/profile" element={<ProtectedRoute><NurseProfile /></ProtectedRoute>} />
    <Route path="/nurse/records" element={<ProtectedRoute><RecordsPage /></ProtectedRoute>} />
    <Route path="/nurse/view-patient-history" element={<ProtectedRoute><ViewPatientHistory /></ProtectedRoute>} />
    <Route path="/nurse/appointments" element={<ProtectedRoute><NurseAppointments /></ProtectedRoute>} />
    <Route path="/admin-selection" element={<AdminSelectionPage />} />
    {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
