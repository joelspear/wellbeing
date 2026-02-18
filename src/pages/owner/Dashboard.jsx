import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DEMO_STATS = {
  totalSchools: 3,
  activePrincipals: 3,
  totalCheckins: 124,
  totalTeachers: 28,
};

const DEMO_RECENT_ACTIVITY = [
  {
    id: 1,
    type: 'checkin',
    text: 'New check-in submitted at Greenfield Primary',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'school',
    text: 'Westlake Secondary principal accepted invitation',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'checkin',
    text: '3 new check-ins at Demo School',
    time: '1 day ago',
  },
  {
    id: 4,
    type: 'school',
    text: 'Riverdale College added to platform',
    time: '2 days ago',
  },
  {
    id: 5,
    type: 'flag',
    text: 'Flagged response at Greenfield Primary',
    time: '3 days ago',
  },
];

const DEMO_SCHOOLS_SUMMARY = [
  { id: 1, name: 'Demo School', principal: 'Demo Principal', teachers: 8, checkins: 47, status: 'Active' },
  { id: 2, name: 'Greenfield Primary', principal: 'Sarah Mitchell', teachers: 12, checkins: 52, status: 'Active' },
  { id: 3, name: 'Westlake Secondary', principal: 'James Nguyen', teachers: 8, checkins: 25, status: 'Active' },
];

export default function OwnerDashboard() {
  const [stats] = useState(DEMO_STATS);
  const [activity] = useState(DEMO_RECENT_ACTIVITY);
  const [schools] = useState(DEMO_SCHOOLS_SUMMARY);

  return (
    <div className="o-dashboard">
      <div className="o-dashboard-header">
        <h1>Owner Dashboard</h1>
        <span className="badge badge-amber" style={{ fontSize: '12px' }}>Demo Mode</span>
      </div>

      {/* Stats cards */}
      <div className="o-stats-grid">
        <div className="o-stat-card card">
          <div className="o-stat-icon">&#x1F3EB;</div>
          <div className="o-stat-info">
            <div className="o-stat-value">{stats.totalSchools}</div>
            <div className="o-stat-label">Schools Enrolled</div>
          </div>
        </div>

        <div className="o-stat-card card">
          <div className="o-stat-icon">&#x1F464;</div>
          <div className="o-stat-info">
            <div className="o-stat-value">{stats.activePrincipals}</div>
            <div className="o-stat-label">Active Principals</div>
          </div>
        </div>

        <div className="o-stat-card card">
          <div className="o-stat-icon">&#x1F468;&#x200D;&#x1F3EB;</div>
          <div className="o-stat-info">
            <div className="o-stat-value">{stats.totalTeachers}</div>
            <div className="o-stat-label">Total Teachers</div>
          </div>
        </div>

        <div className="o-stat-card card">
          <div className="o-stat-icon">&#x1F4CB;</div>
          <div className="o-stat-info">
            <div className="o-stat-value">{stats.totalCheckins}</div>
            <div className="o-stat-label">Total Check-ins</div>
          </div>
        </div>
      </div>

      <div className="o-dashboard-grid">
        {/* Recent activity */}
        <section className="o-section">
          <h2 className="o-section-title">Recent Activity</h2>
          <div className="o-activity-list card">
            {activity.map((item) => (
              <div className="o-activity-item" key={item.id}>
                <div className={`o-activity-dot o-activity-dot--${item.type}`} />
                <div className="o-activity-content">
                  <p className="o-activity-text">{item.text}</p>
                  <span className="o-activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Schools overview */}
        <section className="o-section">
          <div className="o-section-header">
            <h2 className="o-section-title">Schools Overview</h2>
            <Link to="/owner/schools" className="btn-secondary o-section-link">
              Manage Schools
            </Link>
          </div>
          <div className="o-schools-table-wrap card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Principal</th>
                  <th>Teachers</th>
                  <th>Check-ins</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id}>
                    <td className="o-school-name">{s.name}</td>
                    <td>{s.principal}</td>
                    <td>{s.teachers}</td>
                    <td>{s.checkins}</td>
                    <td>
                      <span className="badge badge-green">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <section className="o-section">
        <h2 className="o-section-title">Quick Actions</h2>
        <div className="o-quick-actions">
          <Link to="/owner/schools" className="o-quick-action card">
            <span className="o-quick-action-icon">&#x2795;</span>
            <span className="o-quick-action-label">Add New School</span>
          </Link>
          <Link to="/owner/schools" className="o-quick-action card">
            <span className="o-quick-action-icon">&#x2709;</span>
            <span className="o-quick-action-label">Invite Principal</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
