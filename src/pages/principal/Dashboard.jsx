import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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

export default function PrincipalDashboard() {
  const [checkins, setCheckins] = useState(DEMO_CHECKINS);
  const [weeklyScores, setWeeklyScores] = useState(DEMO_WEEKLY_SCORES);
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        if (!isSupabaseConfigured || !supabase) throw new Error('Not configured');

        // Don't require auth for fetching - demo mode may not have Supabase auth
        const { data: responses, error } = await supabase
          .from('checkin_responses')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        if (!responses || responses.length === 0) throw new Error('No data');

        if (cancelled) return;

        const mapped = responses.map((r, idx) => ({
          id: r.id || idx,
          teacher_name: r.teacher_name || 'Staff Member',
          email: r.teacher_email || '',
          date: (r.submitted_at || r.created_at || '').slice(0, 10),
          overall_score: Number(r.score_overall) || 0,
          is_flagged: r.is_flagged || false,
          flag_reason: r.flag_reason || (r.is_flagged ? 'Score triggered automatic flag' : null),
        }));

        const total = mapped.length;
        const avg = mapped.reduce((sum, c) => sum + c.overall_score, 0) / total;
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
        if (!cancelled) setUsingDemo(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const flaggedCheckins = checkins.filter((c) => c.is_flagged);
  const trendPositive = stats.weeklyTrend >= 0;
  const avgTier = getScoreTier(stats.averageScore);

  return (
    <div className="p-dashboard">
      <div className="p-dashboard-header">
        <h1>Dashboard</h1>
        {usingDemo && !loading && (
          <span className="badge badge-amber" style={{ fontSize: '12px' }}>Demo Data</span>
        )}
      </div>

      {loading ? (
        <div className="p-dashboard-loading">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="p-stats-grid">
            <div className="p-stat-card card">
              <div className="p-stat-label">Total Check-ins</div>
              <div className="p-stat-value">{stats.totalCheckins}</div>
              <div className="p-stat-sub">this term</div>
            </div>

            <div className="p-stat-card card">
              <div className="p-stat-label">Average Score</div>
              <div className={`p-stat-value score-${avgTier}`}>
                {stats.averageScore.toFixed(1)}
              </div>
              <div className="p-stat-sub">out of 5.0</div>
            </div>

            <div className="p-stat-card card">
              <div className="p-stat-label">Weekly Trend</div>
              <div className={`p-stat-value ${trendPositive ? 'score-green' : 'score-red'}`}>
                {trendPositive ? '\u2191' : '\u2193'}{' '}
                {Math.abs(stats.weeklyTrend).toFixed(1)}
              </div>
              <div className="p-stat-sub">vs last week</div>
            </div>

            <div className="p-stat-card card">
              <div className="p-stat-label">Flagged</div>
              <div className={`p-stat-value ${stats.flaggedCount > 0 ? 'score-red' : 'score-green'}`}>
                {stats.flaggedCount > 0 && (
                  <span style={{ fontSize: '24px' }} aria-label="alert">&#x26A0;</span>
                )}{' '}
                {stats.flaggedCount}
              </div>
              <div className="p-stat-sub">need attention</div>
            </div>
          </div>

          {/* Weekly mood trend */}
          <section className="p-section">
            <h2 className="p-section-title">Weekly Mood Trend</h2>
            <div className="p-chart card">
              <div className="p-chart-bars">
                {weeklyScores.map((d) => {
                  const tier = getScoreTier(d.score);
                  const heightPercent = (d.score / 5) * 100;
                  return (
                    <div className="p-chart-col" key={d.day}>
                      <div className="p-chart-value">{d.score.toFixed(1)}</div>
                      <div className="p-chart-bar-track">
                        <div
                          className={`p-chart-bar p-chart-bar--${tier}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="p-chart-label">{d.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Recent check-ins */}
          <section className="p-section">
            <h2 className="p-section-title">Recent Check-ins</h2>
            <div className="p-table-wrap card">
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
                            <span className="badge badge-red">&#x26A0; Flagged</span>
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

          {/* Flagged responses */}
          {flaggedCheckins.length > 0 && (
            <section className="p-section">
              <h2 className="p-section-title">
                Flagged Responses
                <span className="badge badge-red" style={{ marginLeft: '10px', fontSize: '13px' }}>
                  {flaggedCheckins.length}
                </span>
              </h2>
              <div className="p-flagged-list">
                {flaggedCheckins.map((c) => (
                  <div className="p-flagged-item card" key={c.id}>
                    <div className="p-flagged-header">
                      <span className="p-flagged-name">{c.teacher_name}</span>
                      <span className="p-flagged-date">{formatDate(c.date)}</span>
                    </div>
                    <div className="p-flagged-score">
                      Score:{' '}
                      <span className={`score-${getScoreTier(c.overall_score)}`}>
                        {c.overall_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-flagged-reason">{c.flag_reason}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Anonymous reports summary */}
          <section className="p-section">
            <h2 className="p-section-title">Anonymous Reports</h2>
            <div className="p-reports-summary card">
              <div className="p-reports-count">
                <span className={`p-reports-number ${stats.newReports > 0 ? 'score-amber' : 'score-green'}`}>
                  {stats.newReports}
                </span>
                <span className="p-reports-label">
                  new / unreviewed {stats.newReports === 1 ? 'report' : 'reports'}
                </span>
              </div>
              <Link to="/principal/reports" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                View Reports
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
