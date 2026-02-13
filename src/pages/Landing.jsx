import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">MindCheck</div>
        <Link to="/login" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          Log in
        </Link>
      </header>

      <main className="landing-hero">
        <h1 className="landing-title">
          A safe space to check in on your wellbeing
        </h1>
        <p className="landing-subtitle">
          Purpose-built for Australian schools. Takes less than 60 seconds.
        </p>
        <div className="landing-cta">
          <Link to="/checkin" className="btn-primary">
            I'm a Teacher
          </Link>
          <Link to="/admin" className="btn-secondary">
            School Admin
          </Link>
        </div>
      </main>

      <section className="landing-features">
        <div className="feature-card card">
          <div className="feature-icon">&#x1F4CB;</div>
          <h3>Quick Check-ins</h3>
          <p>10 simple questions mapped to the DASS-21 framework. Complete in under a minute.</p>
        </div>
        <div className="feature-card card">
          <div className="feature-icon">&#x1F512;</div>
          <h3>Anonymous Reports</h3>
          <p>Submit concerns confidentially. No account needed, no tracking.</p>
        </div>
        <div className="feature-card card">
          <div className="feature-icon">&#x1F4CA;</div>
          <h3>Admin Dashboard</h3>
          <p>View trends, flagged responses, and wellbeing data across your school.</p>
        </div>
        <div className="feature-card card">
          <div className="feature-icon">&#x1F1E6;&#x1F1FA;</div>
          <h3>Aussie Resources</h3>
          <p>Direct links to Lifeline, Beyond Blue, headspace, and more Australian services.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-links">
          <Link to="/checkin/resources">Support Resources</Link>
          <span className="footer-sep">|</span>
          <a href="#privacy">Privacy Policy</a>
          <span className="footer-sep">|</span>
          <a href="#terms">Terms of Use</a>
        </div>
        <p className="footer-note">
          If you or someone you know needs immediate help, call Lifeline on <strong>13 11 14</strong> or emergency services on <strong>000</strong>.
        </p>
      </footer>
    </div>
  );
}
