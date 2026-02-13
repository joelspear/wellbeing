import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Reports.css';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_REPORTS = [
  {
    id: 1,
    category: "I'm worried about a colleague",
    details:
      'A colleague has been very withdrawn lately and missing meetings. I\'m concerned about their wellbeing.',
    created_at: daysAgo(2),
    status: 'new',
  },
  {
    id: 2,
    category: 'Workplace safety issue',
    details:
      "The staff room aircon hasn't been working for weeks and it's affecting morale.",
    created_at: daysAgo(5),
    status: 'reviewed',
  },
  {
    id: 3,
    category: "I'm worried about myself",
    details: null,
    created_at: daysAgo(7),
    status: 'actioned',
  },
  {
    id: 4,
    category: 'Bullying or harassment',
    details:
      'There have been some comments in staff meetings that feel targeted.',
    created_at: daysAgo(3),
    status: 'new',
  },
];

const FILTER_TABS = ['All', 'New', 'Reviewed', 'Actioned'];

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeClass(status) {
  switch (status) {
    case 'new':
      return 'badge badge-red';
    case 'reviewed':
      return 'badge badge-amber';
    case 'actioned':
      return 'badge badge-green';
    default:
      return 'badge';
  }
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function categoryClass(category) {
  switch (category) {
    case "I'm worried about a colleague":
      return 'reports-category-badge reports-category-colleague';
    case 'Workplace safety issue':
      return 'reports-category-badge reports-category-safety';
    case "I'm worried about myself":
      return 'reports-category-badge reports-category-self';
    case 'Bullying or harassment':
      return 'reports-category-badge reports-category-bullying';
    default:
      return 'reports-category-badge reports-category-other';
  }
}

export default function Reports() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        const schoolId = profile?.school_id;
        if (!schoolId) throw new Error('No school_id found');

        const { data, error } = await supabase
          .from('anonymous_reports')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No data');

        if (!cancelled) {
          setReports(data);
          setUsingDemo(false);
        }
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

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    // Attempt Supabase update; fall back to local state
    if (!usingDemo) {
      try {
        const { error } = await supabase
          .from('anonymous_reports')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
      } catch {
        // Continue with local update
      }
    }

    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredReports =
    activeFilter === 'All'
      ? reports
      : reports.filter((r) => r.status === activeFilter.toLowerCase());

  return (
    <div className="admin-reports">
      {/* Navigation */}
      <nav className="admin-nav card">
        <Link to="/admin" className="admin-nav-logo">
          MindCheck Admin
        </Link>
        <div className="admin-nav-links">
          <Link to="/admin" className="admin-nav-link">
            Dashboard
          </Link>
          <Link to="/admin/teachers" className="admin-nav-link">
            Teachers
          </Link>
          <Link to="/admin/responses" className="admin-nav-link">
            Responses
          </Link>
          <Link
            to="/admin/reports"
            className="admin-nav-link admin-nav-link--active"
          >
            Reports
          </Link>
          <Link to="/login" className="admin-nav-link admin-nav-link--logout">
            Log out
          </Link>
        </div>
      </nav>

      {/* Page header */}
      <div className="admin-page-header">
        <h1>Anonymous Reports</h1>
        {usingDemo && !loading && (
          <span className="admin-demo-badge badge badge-amber">Demo Data</span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="reports-filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            className={`reports-filter-tab${activeFilter === tab ? ' reports-filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="admin-loading">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="reports-empty card">
          <p className="reports-empty-text">No reports to display</p>
        </div>
      ) : (
        <div className="reports-list">
          {filteredReports.map((report) => (
            <div className="reports-card card" key={report.id}>
              <div className="reports-card-top">
                <span className={categoryClass(report.category)}>
                  {report.category}
                </span>
                <span className={statusBadgeClass(report.status)}>
                  {statusLabel(report.status)}
                </span>
              </div>

              <p className="reports-card-text">
                {report.details || 'No additional details'}
              </p>

              <div className="reports-card-bottom">
                <span className="reports-card-date">
                  Submitted {formatDate(report.created_at)}
                </span>

                <div className="reports-card-actions">
                  {report.status === 'new' && (
                    <button
                      className="reports-action-btn"
                      onClick={() => updateStatus(report.id, 'reviewed')}
                      type="button"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {(report.status === 'new' || report.status === 'reviewed') && (
                    <button
                      className="reports-action-btn reports-action-btn--green"
                      onClick={() => updateStatus(report.id, 'actioned')}
                      type="button"
                    >
                      Mark as Actioned
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
