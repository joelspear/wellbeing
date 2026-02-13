import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Report.css';

const CATEGORIES = [
  "I'm worried about myself",
  "I'm worried about a colleague",
  'Workplace safety issue',
  'Bullying or harassment',
  'Other',
];

export default function Report() {
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('school_id');

  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Please select a category before submitting.');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('anonymous_reports')
        .insert({
          school_id: schoolId || null,
          category,
          details: details.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="report">
        <header className="report-header">
          <Link to="/" className="report-logo">MindCheck</Link>
        </header>

        <main className="report-content">
          <div className="report-card card">
            <div className="report-confirmation">
              <div className="report-confirmation-icon">&#x2705;</div>
              <h2>Report submitted</h2>
              <p className="report-confirmation-text">
                Your concern has been securely sent to the school wellbeing team.
              </p>
              <p className="report-confirmation-subtext">
                Thank you for speaking up. Your report is completely anonymous.
              </p>
              <div className="alert-box alert-box-amber report-emergency-box">
                <strong>Need immediate help?</strong> If you or someone else is in
                immediate danger, please call <strong>000</strong> or Lifeline on{' '}
                <strong>13 11 14</strong>.
              </div>
              <Link to="/" className="btn-secondary report-back-btn">
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="report">
      <header className="report-header">
        <Link to="/" className="report-logo">MindCheck</Link>
      </header>

      <main className="report-content">
        <div className="report-card card">
          <h2 className="report-title">Submit an anonymous report</h2>
          <p className="report-subtitle">
            Your identity will not be recorded. This report goes directly to your
            school's wellbeing team.
          </p>

          <form className="report-form" onSubmit={handleSubmit}>
            <fieldset className="report-fieldset">
              <legend className="report-legend">What is this about?</legend>
              <div className="report-categories">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="report-radio-label">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={category === cat}
                      onChange={(e) => setCategory(e.target.value)}
                      className="report-radio-input"
                    />
                    <span className="report-radio-control" />
                    <span className="report-radio-text">{cat}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="report-field">
              <label className="report-textarea-label" htmlFor="details">
                Tell us more (optional)
              </label>
              <textarea
                id="details"
                className="input-field report-textarea"
                placeholder="Share any details that might help the wellbeing team understand the situation..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert-box alert-box-red report-error">
                {error}
              </div>
            )}

            <div className="alert-box alert-box-amber report-emergency-box">
              <strong>If you or someone else is in immediate danger,</strong> please
              call <strong>000</strong> or Lifeline on <strong>13 11 14</strong>.
            </div>

            <button
              type="submit"
              className="btn-primary report-submit-btn"
              disabled={loading || !category}
            >
              {loading ? 'Submitting...' : 'Submit report'}
            </button>
          </form>

          <div className="report-footer-links">
            <Link to="/" className="btn-secondary report-back-link">
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="report-footer">
        <p className="report-footer-note">
          This form is anonymous. No personal information is collected or stored.
        </p>
      </footer>
    </div>
  );
}
