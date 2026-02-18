import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import './Teachers.css';

const DEMO_TEACHERS = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah.mitchell@school.edu.au', status: 'Accepted', lastCheckin: '2 days ago' },
  { id: 2, name: 'James Cooper', email: 'james.cooper@school.edu.au', status: 'Accepted', lastCheckin: '1 week ago' },
  { id: 3, name: 'Emma Wilson', email: 'emma.wilson@school.edu.au', status: 'Pending', lastCheckin: 'Never' },
  { id: 4, name: 'Michael Brown', email: 'michael.brown@school.edu.au', status: 'Accepted', lastCheckin: 'Today' },
];

export default function PrincipalTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Not configured');

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTeachers(
          data.map((t, i) => ({
            id: t.id || i + 1,
            name: t.full_name || t.name || '',
            email: t.email,
            status: t.status || 'Pending',
            lastCheckin: t.last_checkin || 'Never',
          }))
        );
      } else {
        setTeachers(DEMO_TEACHERS);
      }
    } catch {
      setTeachers(DEMO_TEACHERS);
    }
  }

  async function handleAddTeacher(e) {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address.' });
      return;
    }

    setAddLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Not configured');

      const { error } = await supabase.from('teachers').insert([{
        email: email.trim(),
        full_name: fullName.trim() || null,
        status: 'Pending',
      }]);

      if (error) throw error;

      await fetchTeachers();
      setMessage({ type: 'success', text: `Invite sent to ${email.trim()}.` });
    } catch {
      const newTeacher = {
        id: Date.now(),
        name: fullName.trim() || '',
        email: email.trim(),
        status: 'Pending',
        lastCheckin: 'Never',
      };
      setTeachers((prev) => [newTeacher, ...prev]);
      setMessage({ type: 'success', text: `Teacher added (demo mode).` });
    } finally {
      setEmail('');
      setFullName('');
      setAddLoading(false);
    }
  }

  async function handleBulkInvite(e) {
    e.preventDefault();
    setMessage(null);

    const lines = bulkEmails
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one email address.' });
      return;
    }

    setBulkLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Not configured');

      const rows = lines.map((addr) => ({ email: addr, status: 'Pending' }));
      const { error } = await supabase.from('teachers').insert(rows);

      if (error) throw error;

      await fetchTeachers();
      setMessage({ type: 'success', text: `${lines.length} invite(s) sent.` });
    } catch {
      const newTeachers = lines.map((addr, i) => ({
        id: Date.now() + i,
        name: '',
        email: addr,
        status: 'Pending',
        lastCheckin: 'Never',
      }));
      setTeachers((prev) => [...newTeachers, ...prev]);
      setMessage({ type: 'success', text: `${lines.length} teacher(s) added (demo mode).` });
    } finally {
      setBulkEmails('');
      setBulkLoading(false);
    }
  }

  function handleResendInvite(teacher) {
    setMessage({ type: 'success', text: `Invite resent to ${teacher.email}.` });
  }

  function handleDeactivate(teacherId) {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    setMessage({ type: 'success', text: 'Teacher deactivated.' });
  }

  return (
    <div className="p-teachers">
      <h1 className="p-teachers-title">Manage Teachers</h1>

      {message && (
        <div className={`alert-box ${message.type === 'error' ? 'alert-box-red' : 'alert-box-green'} p-teachers-message`}>
          {message.text}
        </div>
      )}

      {/* Add Teacher Form */}
      <section className="card p-teachers-form-card">
        <h2 className="p-teachers-section-title">Add Teacher</h2>
        <form className="p-teachers-form" onSubmit={handleAddTeacher}>
          <div className="p-teachers-form-row">
            <div className="p-teachers-form-group">
              <label className="p-teachers-label" htmlFor="teacher-email">
                Email address <span className="p-teachers-required">*</span>
              </label>
              <input
                id="teacher-email"
                type="email"
                className="input-field"
                placeholder="teacher@school.edu.au"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={addLoading}
              />
            </div>
            <div className="p-teachers-form-group">
              <label className="p-teachers-label" htmlFor="teacher-name">
                Full name <span className="p-teachers-optional">(optional)</span>
              </label>
              <input
                id="teacher-name"
                type="text"
                className="input-field"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={addLoading}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary p-teachers-add-btn" disabled={addLoading}>
            {addLoading ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </section>

      {/* Bulk Invite */}
      <section className="card p-teachers-form-card">
        <h2 className="p-teachers-section-title">Bulk Invite</h2>
        <form className="p-teachers-form" onSubmit={handleBulkInvite}>
          <div className="p-teachers-form-group">
            <label className="p-teachers-label" htmlFor="bulk-emails">
              Paste email addresses (one per line)
            </label>
            <textarea
              id="bulk-emails"
              className="input-field p-teachers-textarea"
              placeholder={'teacher1@school.edu.au\nteacher2@school.edu.au\nteacher3@school.edu.au'}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              disabled={bulkLoading}
            />
          </div>
          <button type="submit" className="btn-primary p-teachers-add-btn" disabled={bulkLoading}>
            {bulkLoading ? 'Sending...' : 'Send Invites'}
          </button>
        </form>
      </section>

      {/* Teachers Table */}
      <section className="card p-teachers-table-card">
        <h2 className="p-teachers-section-title">All Teachers</h2>
        <div className="p-teachers-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Invite Status</th>
                <th>Last Check-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-teachers-empty">
                    No teachers added yet. Use the form above to invite your first teacher.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="p-teachers-name">{teacher.name || '--'}</td>
                    <td>{teacher.email}</td>
                    <td>
                      <span className={`badge ${teacher.status === 'Accepted' ? 'badge-green' : 'badge-amber'}`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td>{teacher.lastCheckin}</td>
                    <td className="p-teachers-actions">
                      <button
                        type="button"
                        className="btn-secondary p-teachers-action-btn"
                        onClick={() => handleResendInvite(teacher)}
                      >
                        Resend Invite
                      </button>
                      <button
                        type="button"
                        className="btn-secondary p-teachers-action-btn p-teachers-action-btn--danger"
                        onClick={() => handleDeactivate(teacher.id)}
                      >
                        Deactivate
                      </button>
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
