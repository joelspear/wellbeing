import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getScoreTier, getScoreEmoji } from '../lib/questions';
import './Results.css';

const tierMessages = {
  green: "You're doing well! Keep up the great self-care.",
  amber:
    "You're managing, but keep an eye on your wellbeing. Consider reaching out to your wellbeing coordinator.",
  red:
    "It looks like things are tough right now. Please reach out for support \u2014 you don't have to go through this alone.",
};

const crisisResources = [
  { name: 'Lifeline', phone: '13 11 14' },
  { name: 'Beyond Blue', phone: '1300 22 4636' },
  { name: 'Kids Helpline', phone: '1800 55 1800' },
  { name: 'headspace', phone: '1800 650 890' },
];

const categories = [
  { label: 'Balance & Energy', key: 'stress' },
  { label: 'Calm & Confidence', key: 'anxiety' },
  { label: 'Emotional Wellbeing', key: 'depression' },
];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    return (
      <div className="results">
        <div className="results-container">
          <div className="results-card card">
            <h2 className="results-empty-title">No results to display</h2>
            <p className="results-empty-text">
              It looks like you haven't completed a check-in yet.
            </p>
            <Link to="/checkin" className="btn-primary results-empty-link">
              Start a Check-in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { scores, answers } = location.state;
  const { overall, stress, anxiety, depression, isFlagged } = scores;
  const tier = getScoreTier(overall);
  const emoji = getScoreEmoji(overall);

  return (
    <div className="results">
      <header className="results-header">
        <Link to="/" className="results-logo">MindCheck</Link>
      </header>

      <div className="results-container">
        <h1 className="results-title">Your Wellbeing Snapshot</h1>
        <p className="results-subtitle">
          Here's a summary of how you're going right now.
        </p>

        {/* Overall score card */}
        <div className="results-card card results-overall">
          <div className={`results-score-circle results-score-${tier}`}>
            <span className="results-score-number">{overall.toFixed(1)}</span>
            <span className="results-score-max">/ 5.0</span>
          </div>
          <span className="results-score-emoji">{emoji}</span>
          <div className={`badge badge-${tier} results-tier-badge`}>
            {tier === 'green' && 'Doing Well'}
            {tier === 'amber' && 'Moderate'}
            {tier === 'red' && 'Needs Support'}
          </div>
        </div>

        {/* Contextual message */}
        <div className={`alert-box alert-box-${tier} results-message`}>
          {tierMessages[tier]}
        </div>

        {/* DASS category breakdown */}
        <div className="results-card card results-breakdown">
          <h2 className="results-section-title">Category Breakdown</h2>
          <div className="results-categories">
            {categories.map(({ label, key }) => {
              const value = scores[key];
              const catTier = getScoreTier(value);
              const pct = (value / 5) * 100;
              return (
                <div className="results-category" key={key}>
                  <div className="results-category-header">
                    <span className="results-category-label">{label}</span>
                    <span className={`results-category-value score-${catTier}`}>
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <div className="progress-bar results-progress">
                    <div
                      className={`progress-bar-fill results-bar-${catTier}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crisis resources for red tier */}
        {tier === 'red' && (
          <div className="results-card card results-crisis">
            <div className="results-crisis-icon">&#x1F4DE;</div>
            <h2 className="results-section-title">Crisis Support</h2>
            <p className="results-crisis-text">
              Please don't hesitate to reach out. These services are free,
              confidential, and available 24/7.
            </p>
            <ul className="results-crisis-list">
              {crisisResources.map((r) => (
                <li key={r.name} className="results-crisis-item">
                  <span className="results-crisis-name">{r.name}</span>
                  <a
                    href={`tel:${r.phone.replace(/\s/g, '')}`}
                    className="results-crisis-phone"
                  >
                    {r.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="results-actions">
          <Link to="/report" className="btn-secondary results-action-btn">
            Submit Anonymous Report
          </Link>
          <Link
            to="/checkin/resources"
            className="btn-secondary results-action-btn"
          >
            View Support Resources
          </Link>
          <Link to="/" className="btn-primary results-action-btn">
            Done
          </Link>
        </div>
      </div>

      <footer className="results-footer">
        <p className="results-footer-note">
          Your responses are confidential. If you need immediate help, call
          Lifeline on <strong>13 11 14</strong> or emergency services on{' '}
          <strong>000</strong>.
        </p>
      </footer>
    </div>
  );
}
