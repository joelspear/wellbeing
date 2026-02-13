import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getScoreTier } from '../../lib/questions';
import './Dashboard.css';

const DEMO_CHECKINS = [
  {
    id: 1,
    teacher_name: 'Sarah Mitchell',
    email: 's.mitchell@school.edu.au',
    date: '2026-02-12',
    overall_score: 4.3,
    is_flagged: false,
    flag_reason: null,
  },
  {
    id: 2,
    teacher_name: 'James Nguyen',
    email: 'j.nguyen@school.edu.au',
    date: '2026-02-12',
    overall_score: 2.1,
    is_flagged: true,
    flag_reason: 'Overall score below 2.5; low mood rating',
  },
  {
    id: 3,
    teacher_name: 'Emily Watson',
    email: 'e.watson@school.edu.au',
    date: '2026-02-11',
    overall_score: 3.4,
    is_flagged: false,
    flag_reason: null,
  },
  {
    id: 4,
    teacher_name: 'Liam O\'Connor',
    email: 'l.oconnor@school.edu.au',
    date: '2026-02-11',
    overall_score: 1.8,
    is_flagged: true,
    flag_reason: 'Critical anxiety score; requested follow-up',
  },
  {
    id: 5,
    teacher_name: 'Priya Sharma',
    email: 'p.sharma@school.edu.au',
    date: '2026-02-10',
    overall_score: 4.7,
    is_flagged: false,
    flag_reason: null,
  },
];

const DEMO_WEEKLY_SCORES = [
  { day: 'Mon', score: 3.6 },
  { day: 'Tue', score: 3.2 },
  { day: 'Wed', score: 3.8 },
  { day: 'Thu', score: 3.1 },
  { day: 'Fri', score: 3.5 },
];

const DEMO_STATS = {
  totalCheckins: 47,
  averageScore: 3.26,
  weeklyTrend: 0.3,
  flaggedCount: 4,
  newReports: 2,
};

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [checkins, setCheckins] = useState(DEMO_CHECKINS);
  const [weeklyScores, setWeeklyScores] = useState(DEMO_WEEKLY_SCORES);
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        // Attempt to get the current user's school_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        const schoolId = profile?.school_id;
        if (!schoolId) throw new Error('No school_id found');

        const { data: responses, error } = await supabase
          .from('checkin_responses')
          .select('*, teachers(full_name, email)')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        if (!responses || responses.length === 0) throw new Error('No data');

        if (cancelled) return;

        // Transform real data into our display format
        const mapped = responses.map((r, idx) => ({
          id: r.id || idx,
          teacher_name: r.teachers?.full_name || 'Unknown',
          email: r.teachers?.email || '',
          date: r.created_at?.slice(0, 10) || '',
          overall_score: r.scores?.overall ?? 0,
          is_flagged: r.scores?.isFlagged ?? false,
          flag_reason: r.scores?.isFlagged
            ? 'Score triggered automatic flag'
            : null,
        }));

        const total = mapped.length;
        const avg =
          mapped.reduce((sum, c) => sum + c.overall_score, 0) / total;
        const flagged = mapped.filter((c) => c.is_flagged).length;

        setCheckins(mapped.slice(0, 10));
        setStats({
          totalCheckins: total,
          averageScore: Math.round(avg * 100) / 100,
          weeklyTrend: 0,
          flaggedCount: flagged,
          newReports: 0,
        });
        setUsingDemo(false);
      } catch {
        // Fall back to demo data -- already set as initial state
        if (!cancelled) {
          setUsingDemo(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const flaggedCheckins = checkins.filter((c) => c.is_flagged);
  const trendPositive = stats.weeklyTrend >= 0;
  const avgTier = getScoreTier(stats.averageScore);

  return (
    <div className="admin-dashboard">
      {/* Navigation */}
      <nav className="admin-nav card">
        <Link to="/admin" className="admin-nav-logo">
          MindCheck Admin
        </Link>
        <div className="admin-nav-links">
          <Link to="/admin" className="admin-nav-link admin-nav-link--active">
            Dashboard
          </Link>
          <Link to="/admin/teachers" className="admin-nav-link">
            Teachers
          </Link>
          <Link to="/admin/responses" className="admin-nav-link">
            Responses
          </Link>
          <Link to="/admin/reports" className="admin-nav-link">
            Reports
          </Link>
          <Link to="/login" className="admin-nav-link admin-nav-link--logout">
            Log out
          </Link>
        </div>
      </nav>

      {/* Page header */}
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        {usingDemo && !loading && (
          <span className="admin-demo-badge badge badge-amber">
            Demo Data
          </span>
        )}
      </div>

      {loading ? (
        <div className="admin-loading">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card card">
              <div className="admin-stat-label">Total Check-ins</div>
              <div className="admin-stat-value">{stats.totalCheckins}</div>
              <div className="admin-stat-sub">this term</div>
            </div>

            <div className="admin-stat-card card">
              <div className="admin-stat-label">Average Score</div>
              <div className={`admin-stat-value score-${avgTier}`}>
                {stats.averageScore.toFixed(1)}
              </div>
              <div className="admin-stat-sub">out of 5.0</div>
            </div>

            <div className="admin-stat-card card">
              <div className="admin-stat-label">Weekly Trend</div>
              <div className={`admin-stat-value ${trendPositive ? 'score-green' : 'score-red'}`}>
                {trendPositive ? '\u2191' : '\u2193'}{' '}
                {Math.abs(stats.weeklyTrend).toFixed(1)}
              </div>
              <div className="admin-stat-sub">
                vs last week
              </div>
            </div>

            <div className="admin-stat-card card">
              <div className="admin-stat-label">Flagged</div>
              <div className={`admin-stat-value ${stats.flaggedCount > 0 ? 'score-red' : 'score-green'}`}>
                {stats.flaggedCount > 0 && (
                  <span className="admin-alert-icon" aria-label="alert">&#x26A0;</span>
                )}{' '}
                {stats.flaggedCount}
              </div>
              <div className="admin-stat-sub">need attention</div>
            </div>
          </div>

          {/* Weekly mood trend */}
          <section className="admin-section">
            <h2 className="admin-section-title">Weekly Mood Trend</h2>
            <div className="admin-chart card">
              <div className="admin-chart-bars">
                {weeklyScores.map((d) => {
                  const tier = getScoreTier(d.score);
                  const heightPercent = (d.score / 5) * 100;
                  return (
                    <div className="admin-chart-col" key={d.day}>
                      <div className="admin-chart-value">{d.score.toFixed(1)}</div>
                      <div className="admin-chart-bar-track">
                        <div
                          className={`admin-chart-bar admin-chart-bar--${tier}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="admin-chart-label">{d.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Recent check-ins */}
          <section className="admin-section">
            <h2 className="admin-section-title">Recent Check-ins</h2>
            <div className="admin-table-wrap card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Date</th>
                    <th>Overall Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((c) => {
                    const tier = getScoreTier(c.overall_score);
                    return (
                      <tr key={c.id}>
                        <td>{c.teacher_name}</td>
                        <td>{formatDate(c.date)}</td>
                        <td>
                          <span className={`badge badge-${tier}`}>
                            {c.overall_score.toFixed(1)}
                          </span>
                        </td>
                        <td>
                          {c.is_flagged ? (
                            <span className="badge badge-red">
                              &#x26A0; Flagged
                            </span>
                          ) : (
                            <span className="badge badge-green">OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Flagged responses panel */}
          {flaggedCheckins.length > 0 && (
            <section className="admin-section">
              <h2 className="admin-section-title">
                Flagged Responses
                <span className="admin-section-count badge badge-red">
                  {flaggedCheckins.length}
                </span>
              </h2>
              <div className="admin-flagged-list">
                {flaggedCheckins.map((c) => (
                  <div className="admin-flagged-item card" key={c.id}>
                    <div className="admin-flagged-header">
                      <span className="admin-flagged-name">{c.teacher_name}</span>
                      <span className="admin-flagged-date">{formatDate(c.date)}</span>
                    </div>
                    <div className="admin-flagged-score">
                      Score:{' '}
                      <span className={`score-${getScoreTier(c.overall_score)}`}>
                        {c.overall_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="admin-flagged-reason">
                      {c.flag_reason}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Anonymous reports summary */}
          <section className="admin-section">
            <h2 className="admin-section-title">Anonymous Reports</h2>
            <div className="admin-reports-summary card">
              <div className="admin-reports-count">
                <span className={`admin-reports-number ${stats.newReports > 0 ? 'score-amber' : 'score-green'}`}>
                  {stats.newReports}
                </span>
                <span className="admin-reports-label">
                  new / unreviewed {stats.newReports === 1 ? 'report' : 'reports'}
                </span>
              </div>
              <Link to="/admin/reports" className="btn-secondary admin-reports-btn">
                View Reports
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
