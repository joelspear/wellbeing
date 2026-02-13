import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getScoreTier } from '../../lib/questions';
import './Responses.css';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

function buildDemoData() {
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  return [
    {
      id: 'demo-1',
      teacher_name: 'Sarah Mitchell',
      teacher_email: 'sarah.mitchell@school.edu.au',
      date: dates[0],
      overall: 4.56,
      stress: 4.5,
      anxiety: 4.5,
      depression: 4.5,
      is_flagged: false,
      q1: 5, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5, q7: 4, q8: 4, q9: 5,
      q10: 'Feeling great this week. The new planning schedule is really helping.',
    },
    {
      id: 'demo-2',
      teacher_name: 'James O\'Brien',
      teacher_email: 'james.obrien@school.edu.au',
      date: dates[0],
      overall: 3.22,
      stress: 3.0,
      anxiety: 3.5,
      depression: 3.0,
      is_flagged: false,
      q1: 3, q2: 3, q3: 3, q4: 3, q5: 4, q6: 3, q7: 3, q8: 3, q9: 3,
      q10: 'Managing okay. Workload is steady but could use a bit more support with Year 10 class.',
    },
    {
      id: 'demo-3',
      teacher_name: 'Priya Sharma',
      teacher_email: 'priya.sharma@school.edu.au',
      date: dates[1],
      overall: 1.89,
      stress: 1.75,
      anxiety: 1.5,
      depression: 2.5,
      is_flagged: true,
      q1: 1, q2: 2, q3: 1, q4: 2, q5: 1, q6: 3, q7: 2, q8: 2, q9: 2,
      q10: 'Really struggling with the reporting deadlines on top of everything else. Not sleeping well.',
    },
    {
      id: 'demo-4',
      teacher_name: 'Tom Henderson',
      teacher_email: 'tom.henderson@school.edu.au',
      date: dates[2],
      overall: 4.11,
      stress: 4.25,
      anxiety: 4.0,
      depression: 4.0,
      is_flagged: false,
      q1: 4, q2: 4, q3: 5, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4,
      q10: '',
    },
    {
      id: 'demo-5',
      teacher_name: 'Emily Tran',
      teacher_email: 'emily.tran@school.edu.au',
      date: dates[2],
      overall: 2.78,
      stress: 2.75,
      anxiety: 2.5,
      depression: 3.0,
      is_flagged: false,
      q1: 3, q2: 3, q3: 2, q4: 3, q5: 2, q6: 3, q7: 3, q8: 3, q9: 3,
      q10: 'A few tough days but getting through. Parent meetings this week were draining.',
    },
    {
      id: 'demo-6',
      teacher_name: 'Daniel Clarke',
      teacher_email: 'daniel.clarke@school.edu.au',
      date: dates[3],
      overall: 1.44,
      stress: 1.25,
      anxiety: 1.5,
      depression: 1.5,
      is_flagged: true,
      q1: 1, q2: 1, q3: 1, q4: 2, q5: 1, q6: 2, q7: 1, q8: 1, q9: 2,
      q10: 'I feel completely overwhelmed and unsupported. Considering taking leave.',
    },
    {
      id: 'demo-7',
      teacher_name: 'Meg Russo',
      teacher_email: 'meg.russo@school.edu.au',
      date: dates[4],
      overall: 3.67,
      stress: 3.5,
      anxiety: 4.0,
      depression: 3.5,
      is_flagged: false,
      q1: 4, q2: 3, q3: 4, q4: 3, q5: 4, q6: 3, q7: 4, q8: 4, q9: 4,
      q10: 'Pretty good week overall. Enjoying the new mentoring program.',
    },
    {
      id: 'demo-8',
      teacher_name: 'Liam Nguyen',
      teacher_email: 'liam.nguyen@school.edu.au',
      date: dates[5],
      overall: 2.56,
      stress: 2.5,
      anxiety: 2.5,
      depression: 2.5,
      is_flagged: false,
      q1: 3, q2: 2, q3: 3, q4: 2, q5: 3, q6: 2, q7: 3, q8: 3, q9: 2,
      q10: 'Up and down. Some days are fine, others I feel really flat.',
    },
  ];
}

function sortResponses(data, sortKey) {
  const sorted = [...data];
  switch (sortKey) {
    case 'date-newest':
      return sorted.sort((a, b) => b.date.localeCompare(a.date));
    case 'date-oldest':
      return sorted.sort((a, b) => a.date.localeCompare(b.date));
    case 'score-highest':
      return sorted.sort((a, b) => b.overall - a.overall);
    case 'score-lowest':
      return sorted.sort((a, b) => a.overall - b.overall);
    default:
      return sorted;
  }
}

function filterByDateRange(data, from, to) {
  return data.filter((r) => {
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function generateCSV(data) {
  const headers = [
    'Teacher',
    'Email',
    'Date',
    'Overall',
    'Stress',
    'Anxiety',
    'Depression',
    'Flagged',
    'Q1 Mood',
    'Q2 Balance',
    'Q3 Support',
    'Q4 Workload',
    'Q5 Anxiety',
    'Q6 Hope',
    'Q7 Sleep',
    'Q8 Connection',
    'Q9 Confidence',
    'Q10 Open Text',
  ];

  const rows = data.map((r) => [
    r.teacher_name,
    r.teacher_email,
    r.date,
    r.overall,
    r.stress,
    r.anxiety,
    r.depression,
    r.is_flagged ? 'Yes' : 'No',
    r.q1,
    r.q2,
    r.q3,
    r.q4,
    r.q5,
    r.q6,
    r.q7,
    r.q8,
    r.q9,
    `"${(r.q10 || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `mindcheck-responses-${getToday()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(getWeekAgo());
  const [dateTo, setDateTo] = useState(getToday());
  const [sortBy, setSortBy] = useState('date-newest');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('responses')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setResponses(data);
        } else {
          setResponses(buildDemoData());
        }
      } catch {
        setResponses(buildDemoData());
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, []);

  const filtered = filterByDateRange(responses, dateFrom, dateTo);
  const sorted = sortResponses(filtered, sortBy);

  const handleExport = () => {
    const csv = generateCSV(sorted);
    downloadCSV(csv);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const questionLabels = [
    { key: 'q1', label: 'Q1 - Mood' },
    { key: 'q2', label: 'Q2 - Work-Life Balance' },
    { key: 'q3', label: 'Q3 - Support' },
    { key: 'q4', label: 'Q4 - Workload' },
    { key: 'q5', label: 'Q5 - Anxiety' },
    { key: 'q6', label: 'Q6 - Hope' },
    { key: 'q7', label: 'Q7 - Sleep' },
    { key: 'q8', label: 'Q8 - Connection' },
    { key: 'q9', label: 'Q9 - Confidence' },
  ];

  return (
    <div className="admin-responses">
      <nav className="admin-nav">
        <div className="admin-nav-inner">
          <Link to="/admin" className="admin-nav-logo">MindCheck Admin</Link>
          <div className="admin-nav-links">
            <Link to="/admin" className="admin-nav-link">Dashboard</Link>
            <Link to="/admin/teachers" className="admin-nav-link">Teachers</Link>
            <span className="admin-nav-link admin-nav-link--active">Responses</span>
            <Link to="/admin/reports" className="admin-nav-link">Reports</Link>
            <Link to="/login" className="admin-nav-link admin-nav-link--logout">Log out</Link>
          </div>
        </div>
      </nav>

      <main className="admin-responses-content">
        <h1 className="admin-responses-title">Check-in Responses</h1>

        <div className="admin-responses-controls">
          <div className="admin-responses-filters">
            <div className="admin-responses-date-group">
              <label className="admin-responses-label" htmlFor="date-from">From</label>
              <input
                id="date-from"
                type="date"
                className="input-field admin-responses-date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="admin-responses-date-group">
              <label className="admin-responses-label" htmlFor="date-to">To</label>
              <input
                id="date-to"
                type="date"
                className="input-field admin-responses-date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="admin-responses-date-group">
              <label className="admin-responses-label" htmlFor="sort-by">Sort by</label>
              <select
                id="sort-by"
                className="input-field admin-responses-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-newest">Date - newest</option>
                <option value="date-oldest">Date - oldest</option>
                <option value="score-highest">Score - highest</option>
                <option value="score-lowest">Score - lowest</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary admin-responses-export"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="admin-responses-loading">Loading responses...</div>
        ) : sorted.length === 0 ? (
          <div className="admin-responses-empty card">
            <p>No responses found for the selected date range.</p>
          </div>
        ) : (
          <div className="admin-responses-table-wrap card">
            <table className="data-table admin-responses-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Date</th>
                  <th>Overall</th>
                  <th>Stress</th>
                  <th>Anxiety</th>
                  <th>Depression</th>
                  <th>Flagged</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const overallTier = getScoreTier(r.overall);
                  const stressTier = getScoreTier(r.stress);
                  const anxietyTier = getScoreTier(r.anxiety);
                  const depressionTier = getScoreTier(r.depression);
                  const isExpanded = expandedId === r.id;

                  return (
                    <Fragment key={r.id}>
                      <tr
                        className={
                          'admin-responses-row' +
                          (r.is_flagged ? ' admin-responses-row--flagged' : '') +
                          (isExpanded ? ' admin-responses-row--expanded' : '')
                        }
                        onClick={() => toggleExpand(r.id)}
                      >
                        <td className="admin-responses-teacher-cell">
                          <span className="admin-responses-teacher-name">{r.teacher_name}</span>
                        </td>
                        <td>{formatDate(r.date)}</td>
                        <td>
                          <span className={`badge badge-${overallTier}`}>
                            {r.overall.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`score-${stressTier}`}>
                            {r.stress.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`score-${anxietyTier}`}>
                            {r.anxiety.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`score-${depressionTier}`}>
                            {r.depression.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          {r.is_flagged ? (
                            <span className="badge badge-red">Flagged</span>
                          ) : (
                            <span className="admin-responses-ok">--</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="admin-responses-detail-row">
                          <td colSpan={7}>
                            <div className="admin-responses-detail">
                              <div className="admin-responses-detail-header">
                                <h3 className="admin-responses-detail-title">
                                  Individual Question Scores
                                </h3>
                                <span className="admin-responses-detail-email">
                                  {r.teacher_email}
                                </span>
                              </div>
                              <div className="admin-responses-detail-grid">
                                {questionLabels.map(({ key, label }) => {
                                  const val = r[key];
                                  const tier = getScoreTier(val);
                                  return (
                                    <div className="admin-responses-detail-item" key={key}>
                                      <span className="admin-responses-detail-label">{label}</span>
                                      <span className={`admin-responses-detail-value score-${tier}`}>
                                        {val}/5
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {r.q10 && (
                                <div className="admin-responses-detail-text">
                                  <span className="admin-responses-detail-label">Q10 - Open text</span>
                                  <p className="admin-responses-detail-comment">{r.q10}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
