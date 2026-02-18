import { useState } from 'react';
import './Schools.css';

const DEMO_SCHOOLS = [
  {
    id: 1,
    name: 'Demo School',
    principalName: 'Demo Principal',
    principalEmail: 'principal@demoschool.com.au',
    teachers: 8,
    checkins: 47,
    status: 'Active',
    joinedDate: '2026-01-15',
  },
  {
    id: 2,
    name: 'Greenfield Primary',
    principalName: 'Sarah Mitchell',
    principalEmail: 'sarah.m@greenfield.edu.au',
    teachers: 12,
    checkins: 52,
    status: 'Active',
    joinedDate: '2026-01-20',
  },
  {
    id: 3,
    name: 'Westlake Secondary',
    principalName: 'James Nguyen',
    principalEmail: 'j.nguyen@westlake.edu.au',
    teachers: 8,
    checkins: 25,
    status: 'Active',
    joinedDate: '2026-02-01',
  },
];

export default function OwnerSchools() {
  const [schools, setSchools] = useState(DEMO_SCHOOLS);
  const [schoolName, setSchoolName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const handleAddSchool = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!schoolName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a school name.' });
      return;
    }
    if (!principalEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter the principal\'s email address.' });
      return;
    }

    setAddLoading(true);

    // Demo mode - simulate adding
    setTimeout(() => {
      const newSchool = {
        id: Date.now(),
        name: schoolName.trim(),
        principalName: principalName.trim() || 'Pending',
        principalEmail: principalEmail.trim(),
        teachers: 0,
        checkins: 0,
        status: 'Invited',
        joinedDate: new Date().toISOString().slice(0, 10),
      };

      setSchools((prev) => [newSchool, ...prev]);
      setMessage({
        type: 'success',
        text: `Invitation sent to ${principalEmail.trim()}. They'll receive an email to set up their principal account for ${schoolName.trim()}.`,
      });
      setSchoolName('');
      setPrincipalName('');
      setPrincipalEmail('');
      setAddLoading(false);
    }, 800);
  };

  const handleResendInvite = (school) => {
    setMessage({ type: 'success', text: `Invitation resent to ${school.principalEmail}.` });
  };

  const handleDeactivate = (schoolId) => {
    setSchools((prev) =>
      prev.map((s) => s.id === schoolId ? { ...s, status: 'Deactivated' } : s)
    );
    setMessage({ type: 'success', text: 'School deactivated.' });
  };

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="o-schools">
      <h1 className="o-schools-title">Schools & Principals</h1>

      {message && (
        <div className={`alert-box ${message.type === 'error' ? 'alert-box-red' : 'alert-box-green'} o-schools-message`}>
          {message.text}
        </div>
      )}

      {/* Add School Form */}
      <section className="card o-schools-form-card">
        <h2 className="o-schools-section-title">Enrol New School</h2>
        <p className="o-schools-form-desc">
          Add a school and invite their principal. They'll receive an email with a link to create their principal account and set up their school portal.
        </p>
        <form className="o-schools-form" onSubmit={handleAddSchool}>
          <div className="o-schools-form-row">
            <div className="o-schools-form-group">
              <label className="o-schools-label" htmlFor="school-name">
                School Name <span className="o-schools-required">*</span>
              </label>
              <input
                id="school-name"
                type="text"
                className="input-field"
                placeholder="e.g. Greenfield Primary School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={addLoading}
              />
            </div>
          </div>
          <div className="o-schools-form-row">
            <div className="o-schools-form-group">
              <label className="o-schools-label" htmlFor="principal-name">
                Principal's Name <span className="o-schools-optional">(optional)</span>
              </label>
              <input
                id="principal-name"
                type="text"
                className="input-field"
                placeholder="e.g. Sarah Mitchell"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                disabled={addLoading}
              />
            </div>
            <div className="o-schools-form-group">
              <label className="o-schools-label" htmlFor="principal-email">
                Principal's Email <span className="o-schools-required">*</span>
              </label>
              <input
                id="principal-email"
                type="email"
                className="input-field"
                placeholder="principal@school.edu.au"
                value={principalEmail}
                onChange={(e) => setPrincipalEmail(e.target.value)}
                disabled={addLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary o-schools-submit"
            disabled={addLoading}
          >
            {addLoading ? 'Sending Invitation...' : 'Enrol School & Invite Principal'}
          </button>
        </form>
      </section>

      {/* Schools Table */}
      <section className="card o-schools-table-card">
        <h2 className="o-schools-section-title">All Schools</h2>
        <div className="o-schools-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>School</th>
                <th>Principal</th>
                <th>Email</th>
                <th>Teachers</th>
                <th>Check-ins</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan="8" className="o-schools-empty">
                    No schools enrolled yet. Use the form above to add your first school.
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id}>
                    <td className="o-school-name-cell">{school.name}</td>
                    <td>{school.principalName}</td>
                    <td className="o-school-email">{school.principalEmail}</td>
                    <td>{school.teachers}</td>
                    <td>{school.checkins}</td>
                    <td>
                      <span className={`badge ${
                        school.status === 'Active' ? 'badge-green' :
                        school.status === 'Invited' ? 'badge-amber' :
                        'badge-red'
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td>{formatDate(school.joinedDate)}</td>
                    <td className="o-schools-actions">
                      {school.status === 'Invited' && (
                        <button
                          type="button"
                          className="btn-secondary o-schools-action-btn"
                          onClick={() => handleResendInvite(school)}
                        >
                          Resend
                        </button>
                      )}
                      {school.status !== 'Deactivated' && (
                        <button
                          type="button"
                          className="btn-secondary o-schools-action-btn o-schools-action-btn--danger"
                          onClick={() => handleDeactivate(school.id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
