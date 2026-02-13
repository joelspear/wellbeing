import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Checkin from './pages/Checkin';
import Results from './pages/Results';
import Resources from './pages/Resources';
import Report from './pages/Report';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTeachers from './pages/admin/Teachers';
import AdminResponses from './pages/admin/Responses';
import AdminReports from './pages/admin/Reports';

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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/checkin/results" element={<Results />} />
          <Route path="/checkin/resources" element={<Resources />} />
          <Route path="/report" element={<Report />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/responses" element={<AdminResponses />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Routes>
      </div>
    </>
  );
}
