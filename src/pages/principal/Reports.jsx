import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import './Reports.css';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_REPORTS = [
  { id: 1, category: "I'm worried about a colleague", details: 'A colleague has been very withdrawn lately and missing meetings. I\'m concerned about their wellbeing.', created_at: daysAgo(2), status: 'new' },
  { id: 2, category: 'Workplace safety issue', details: "The staff room aircon hasn't been working for weeks and it's affecting morale.", created_at: daysAgo(5), status: 'reviewed' },
  { id: 3, category: "I'm worried about myself", details: null, created_at: daysAgo(7), status: 'actioned' },
  { id: 4, category: 'Bullying or harassment', details: 'There have been some comments in staff meetings that feel targeted.', created_at: daysAgo(3), status: 'new' },
];

const FILTER_TABS = ['All', 'New', 'Reviewed', 'Actioned'];

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadgeClass(status) {
  switch (status) {
    case 'new': return 'badge badge-red';
    case 'reviewed': return 'badge badge-amber';
    case 'actioned': return 'badge badge-green';
    default: return 'badge';
  }
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function categoryClass(category) {
  switch (category) {
    case "I'm worried about a colleague": return 'p-reports-category-badge p-reports-category-colleague';
    case 'Workplace safety issue': return 'p-reports-category-badge p-reports-category-safety';
    case "I'm worried about myself": return 'p-reports-category-badge p-reports-category-self';
    case 'Bullying or harassment': return 'p-reports-category-badge p-reports-category-bullying';
    default: return 'p-reports-category-badge p-reports-category-other';
  }
}

export default function PrincipalReports() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        if (!isSupabaseConfigured || !supabase) throw new Error('Not configured');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('anonymous_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No data');

        if (!cancelled) {
          setReports(data);
          setUsingDemo(false);
        }
      } catch {
        if (!cancelled) setUsingDemo(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReports();
    return () => { cancelled = true; };
  }, []);

  const updateStatus = async (id, newStatus) => {
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
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const filteredReports = activeFilter === 'All'
    ? reports
    : reports.filter((r) => r.status === activeFilter.toLowerCase());

  return (
    <div className="p-reports">
      <div className="p-reports-header">
        <h1 className="p-reports-title">Anonymous Reports</h1>
        {usingDemo && !loading && (
          <span className="badge badge-amber" style={{ fontSize: '12px' }}>Demo Data</span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="p-reports-filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            className={`p-reports-filter-tab${activeFilter === tab ? ' p-reports-filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-reports-loading">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="p-reports-empty card">
          <p>No reports to display</p>
        </div>
      ) : (
        <div className="p-reports-list">
          {filteredReports.map((report) => (
            <div className="p-reports-card card" key={report.id}>
              <div className="p-reports-card-top">
                <span className={categoryClass(report.category)}>{report.category}</span>
                <span className={statusBadgeClass(report.status)}>{statusLabel(report.status)}</span>
              </div>
              <p className="p-reports-card-text">{report.details || 'No additional details'}</p>
              <div className="p-reports-card-bottom">
                <span className="p-reports-card-date">Submitted {formatDate(report.created_at)}</span>
                <div className="p-reports-card-actions">
                  {report.status === 'new' && (
                    <button className="p-reports-action-btn" onClick={() => updateStatus(report.id, 'reviewed')} type="button">
                      Mark as Reviewed
                    </button>
                  )}
                  {(report.status === 'new' || report.status === 'reviewed') && (
                    <button className="p-reports-action-btn p-reports-action-btn--green" onClick={() => updateStatus(report.id, 'actioned')} type="button">
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
