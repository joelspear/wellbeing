import { Link } from 'react-router-dom';
import './ThankYou.css';

export default function ThankYou() {
  return (
    <div className="thankyou">
      <header className="thankyou-header">
        <Link to="/" className="thankyou-logo">MindCheck</Link>
      </header>

      <main className="thankyou-content">
        <div className="thankyou-card card">
          <div className="thankyou-icon">&#x2705;</div>
          <h1 className="thankyou-title">Thank you!</h1>
          <p className="thankyou-message">
            Your wellbeing check-in has been submitted successfully. Your responses are confidential and will only be viewed by your school's wellbeing coordinator.
          </p>
          <p className="thankyou-sub">
            Taking a moment to check in on yourself is an important step. We hope you're doing well.
          </p>

          <div className="thankyou-support">
            <h3 className="thankyou-support-title">Need support?</h3>
            <p className="thankyou-support-text">
              If you're going through a tough time, help is always available:
            </p>
            <div className="thankyou-helplines">
              <a href="tel:131114" className="thankyou-helpline">
                <span className="thankyou-helpline-name">Lifeline</span>
                <span className="thankyou-helpline-number">13 11 14</span>
              </a>
              <a href="tel:1300224636" className="thankyou-helpline">
                <span className="thankyou-helpline-name">Beyond Blue</span>
                <span className="thankyou-helpline-number">1300 22 4636</span>
              </a>
            </div>
          </div>

          <div className="thankyou-actions">
            <Link to="/checkin/resources" className="btn-secondary thankyou-btn">
              View Support Resources
            </Link>
            <Link to="/" className="btn-primary thankyou-btn">
              Done
            </Link>
          </div>
        </div>
      </main>

      <footer className="thankyou-footer">
        <p className="thankyou-footer-note">
          If you or someone you know needs immediate help, call Lifeline on{' '}
          <strong>13 11 14</strong> or emergency services on <strong>000</strong>.
        </p>
      </footer>
    </div>
  );
}
