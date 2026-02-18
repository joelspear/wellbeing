import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-icon">&#x1F331;</span>
            MindCheck
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <Link to="/login?role=teacher" className="nav-link">Sign In</Link>
            <Link to="/login?role=teacher" className="nav-cta-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">Purpose-built for Australian schools</span>
            <h1 className="hero-title">
              Supporting teacher wellbeing, <span className="hero-highlight">one check-in at a time</span>
            </h1>
            <p className="hero-subtitle">
              MindCheck helps school leaders understand and support staff wellbeing through quick, confidential check-ins and actionable insights.
            </p>
            <div className="hero-actions">
              <Link to="/login?role=teacher" className="btn-primary hero-btn">
                Start Your Free Check-in
              </Link>
              <Link to="/login?role=principal" className="btn-secondary hero-btn">
                Principal Portal
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">60s</span>
                <span className="hero-stat-label">to complete</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">10</span>
                <span className="hero-stat-label">evidence-based questions</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">100%</span>
                <span className="hero-stat-label">confidential</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup card">
              <div className="hero-mockup-header">
                <div className="hero-mockup-dot" />
                <div className="hero-mockup-dot" />
                <div className="hero-mockup-dot" />
              </div>
              <div className="hero-mockup-body">
                <p className="hero-mockup-question">How are you feeling overall today?</p>
                <div className="hero-mockup-options">
                  <span className="hero-mockup-emoji">&#x1F629;</span>
                  <span className="hero-mockup-emoji">&#x1F614;</span>
                  <span className="hero-mockup-emoji hero-mockup-emoji--active">&#x1F610;</span>
                  <span className="hero-mockup-emoji">&#x1F60A;</span>
                  <span className="hero-mockup-emoji">&#x1F31F;</span>
                </div>
                <div className="hero-mockup-progress">
                  <div className="hero-mockup-progress-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="features-inner">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything your school needs</h2>
          <p className="section-subtitle">
            A comprehensive wellbeing platform designed specifically for the Australian education context.
          </p>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--purple">&#x1F4CB;</div>
              <h3>Quick Check-ins</h3>
              <p>10 simple questions mapped to the DASS-21 framework. Teachers complete it in under 60 seconds on any device.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--green">&#x1F4CA;</div>
              <h3>Principal Dashboard</h3>
              <p>Real-time overview of staff wellbeing with trend analysis, flagged responses, and individual score breakdowns.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--blue">&#x1F512;</div>
              <h3>Confidential & Secure</h3>
              <p>All responses are encrypted and only visible to designated wellbeing coordinators. Teachers never see others' data.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--orange">&#x1F6A8;</div>
              <h3>Smart Flagging</h3>
              <p>Automatic detection of concerning scores so principals can provide timely support to staff who need it most.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--red">&#x1F4E2;</div>
              <h3>Anonymous Reports</h3>
              <p>Staff can submit concerns confidentially without any account or tracking. Complete anonymity guaranteed.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap feature-icon--teal">&#x1F1E6;&#x1F1FA;</div>
              <h3>Aussie Resources</h3>
              <p>Direct links to Lifeline, Beyond Blue, headspace, and more Australian mental health services built right in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-inner">
          <span className="section-badge">How It Works</span>
          <h2 className="section-title">Simple for everyone</h2>
          <p className="section-subtitle">
            Getting started takes minutes. Here's how MindCheck works for your school.
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Principal sets up</h3>
              <p className="step-text">Create your school account and invite your teaching staff via email. Takes under 5 minutes.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Teachers check in</h3>
              <p className="step-text">Staff receive a link, sign up, and complete a quick 60-second wellbeing survey on any device.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Principal reviews</h3>
              <p className="step-text">View individual responses, trends, and flagged concerns in your dashboard. Export data anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="testimonials-inner">
          <span className="section-badge">Testimonials</span>
          <h2 className="section-title">Trusted by school leaders</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card card">
              <div className="testimonial-stars">&#x2B50;&#x2B50;&#x2B50;&#x2B50;&#x2B50;</div>
              <p className="testimonial-text">
                "MindCheck has transformed how we approach staff wellbeing. The dashboard gives me real-time visibility into how my team is going, and the flagging system means nobody falls through the cracks."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SM</div>
                <div>
                  <div className="testimonial-name">Sarah Mitchell</div>
                  <div className="testimonial-role">Principal, Greenfield Primary SA</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card card">
              <div className="testimonial-stars">&#x2B50;&#x2B50;&#x2B50;&#x2B50;&#x2B50;</div>
              <p className="testimonial-text">
                "My teachers love how quick and easy the check-ins are. It's become part of our weekly routine and I've seen a noticeable improvement in our school culture since we started using it."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">JN</div>
                <div>
                  <div className="testimonial-name">James Nguyen</div>
                  <div className="testimonial-role">Deputy Principal, Westlake Secondary VIC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to support your staff?</h2>
          <p className="cta-subtitle">
            Join schools across Australia using MindCheck to build a healthier, happier workplace.
          </p>
          <div className="cta-actions">
            <Link to="/login?role=principal" className="btn-primary cta-btn">
              Get Started as Principal
            </Link>
            <Link to="/login?role=teacher" className="btn-secondary cta-btn">
              Teacher Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">
              <span className="footer-logo-icon">&#x1F331;</span> MindCheck
            </span>
            <p className="footer-tagline">Supporting teacher wellbeing in Australian schools.</p>
          </div>
          <div className="footer-columns">
            <div className="footer-col">
              <h4 className="footer-col-title">Platform</h4>
              <Link to="/login?role=teacher" className="footer-link">Teacher Login</Link>
              <Link to="/login?role=principal" className="footer-link">Principal Portal</Link>
              <Link to="/report" className="footer-link">Anonymous Report</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Support</h4>
              <Link to="/checkin/resources" className="footer-link">Wellbeing Resources</Link>
              <a href="tel:131114" className="footer-link">Lifeline: 13 11 14</a>
              <a href="tel:1300224636" className="footer-link">Beyond Blue: 1300 22 4636</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-note">
            If you or someone you know needs immediate help, call Lifeline on <strong>13 11 14</strong> or emergency services on <strong>000</strong>.
          </p>
          <p className="footer-copyright">&copy; 2026 MindCheck. Built for Australian schools.</p>
        </div>
      </footer>
    </div>
  );
}
