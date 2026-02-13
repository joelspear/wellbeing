import { Link } from 'react-router-dom';
import './Resources.css';

const resources = [
  {
    name: 'Lifeline',
    phone: '13 11 14',
    description: '24/7 crisis support and suicide prevention',
    website: 'https://www.lifeline.org.au',
  },
  {
    name: 'Beyond Blue',
    phone: '1300 22 4636',
    description: 'Anxiety, depression and mental health support',
    website: 'https://www.beyondblue.org.au',
  },
  {
    name: 'Kids Helpline',
    phone: '1800 55 1800',
    description: 'Support for young people aged 5-25',
    website: 'https://kidshelpline.com.au',
  },
  {
    name: 'headspace',
    phone: '1800 650 890',
    description: 'Youth mental health support',
    website: 'https://headspace.org.au',
  },
  {
    name: 'Black Dog Institute',
    phone: null,
    description: 'Research-driven mental health resources',
    website: 'https://www.blackdoginstitute.org.au',
  },
  {
    name: 'Teacher Health Line',
    phone: '1300 723 462',
    description: 'Dedicated support for teachers and school staff',
    website: null,
  },
];

export default function Resources() {
  return (
    <div className="resources">
      <header className="resources-header">
        <Link to="/" className="resources-logo">MindCheck</Link>
      </header>

      <div className="resources-container">
        {/* Emergency banner */}
        <div className="resources-emergency">
          <span className="resources-emergency-icon">&#x1F6A8;</span>
          <p>
            If you or someone else is in immediate danger, call{' '}
            <a href="tel:000" className="resources-emergency-number">000</a>
          </p>
        </div>

        <h1 className="resources-title">Support Resources</h1>
        <p className="resources-subtitle">
          Australian mental health services available to you
        </p>

        {/* Resource cards */}
        <div className="resources-grid">
          {resources.map((resource) => (
            <div className="resources-card card" key={resource.name}>
              <div className="resources-card-top">
                <span className="resources-card-icon">&#x1F4DE;</span>
                <h3 className="resources-card-name">{resource.name}</h3>
              </div>
              <p className="resources-card-desc">{resource.description}</p>
              <div className="resources-card-actions">
                {resource.phone && (
                  <a
                    href={`tel:${resource.phone.replace(/\s/g, '')}`}
                    className="resources-card-phone"
                  >
                    &#x260E;&#xFE0F; {resource.phone}
                  </a>
                )}
                {resource.website && (
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resources-card-link"
                  >
                    Visit website &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div className="resources-back">
          <Link to="/" className="btn-secondary resources-back-btn">
            &larr; Back to Home
          </Link>
        </div>
      </div>

      <footer className="resources-footer">
        <p className="resources-footer-note">
          If you or someone you know needs immediate help, call Lifeline on{' '}
          <strong>13 11 14</strong> or emergency services on{' '}
          <strong>000</strong>.
        </p>
      </footer>
    </div>
  );
}
