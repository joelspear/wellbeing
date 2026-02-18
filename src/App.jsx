import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import Checkin from './pages/Checkin';
import ThankYou from './pages/ThankYou';
import Resources from './pages/Resources';
import Report from './pages/Report';
import PrincipalLayout from './components/PrincipalLayout';
import PrincipalDashboard from './pages/principal/Dashboard';
import PrincipalResponses from './pages/principal/Responses';
import PrincipalTeachers from './pages/principal/Teachers';
import PrincipalReports from './pages/principal/Reports';
import OwnerLayout from './components/OwnerLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerSchools from './pages/owner/Schools';

function BackgroundOrbs() {
  return (
    <div className="bg-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <BackgroundOrbs />
      <div className="page-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/report" element={<Report />} />
          <Route path="/checkin/resources" element={<Resources />} />

          {/* Teacher check-in (self-contained auth + survey) */}
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/checkin/thankyou" element={<ThankYou />} />

          {/* Owner portal */}
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner" element={<OwnerLayout><OwnerDashboard /></OwnerLayout>} />
          <Route path="/owner/schools" element={<OwnerLayout><OwnerSchools /></OwnerLayout>} />

          {/* Principal portal */}
          <Route path="/principal" element={<PrincipalLayout><PrincipalDashboard /></PrincipalLayout>} />
          <Route path="/principal/responses" element={<PrincipalLayout><PrincipalResponses /></PrincipalLayout>} />
          <Route path="/principal/teachers" element={<PrincipalLayout><PrincipalTeachers /></PrincipalLayout>} />
          <Route path="/principal/reports" element={<PrincipalLayout><PrincipalReports /></PrincipalLayout>} />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/principal" replace />} />
          <Route path="/admin/*" element={<Navigate to="/principal" replace />} />
          <Route path="/checkin/results" element={<Navigate to="/checkin/thankyou" replace />} />
        </Routes>
      </div>
    </>
  );
}
