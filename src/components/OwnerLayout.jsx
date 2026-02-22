import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDemoUser, clearDemoUser } from '../lib/demo';
import './OwnerLayout.css';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/owner', label: 'Dashboard', icon: '\u{1F4CA}' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/owner/schools', label: 'Schools & Principals', icon: '\u{1F3EB}' },
    ],
  },
];

export default function OwnerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      // Check Supabase auth first
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser && currentUser.user_metadata?.role === 'owner') {
            setUser(currentUser);
            setAuthChecking(false);
            return;
          }
        } catch {
          // Supabase unreachable — fall through to demo user check
        }
      }

      // Check demo session
      const demoUser = getDemoUser();
      if (demoUser && demoUser.user_metadata?.role === 'owner') {
        setUser(demoUser);
        setAuthChecking(false);
        return;
      }

      // Not authenticated as owner
      navigate('/owner/login');
    }

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    clearDemoUser();
    navigate('/');
  };

  if (authChecking) {
    return (
      <div className="owner-layout">
        <div className="owner-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Owner';

  return (
    <div className="owner-layout">
      {/* Mobile header */}
      <div className="owner-mobile-header">
        <button
          className="owner-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          <span className="owner-hamburger-line" />
          <span className="owner-hamburger-line" />
          <span className="owner-hamburger-line" />
        </button>
        <span className="owner-mobile-title">MindCheck</span>
      </div>

      {/* Sidebar overlay */}
      <div
        className={`owner-sidebar-overlay ${sidebarOpen ? 'owner-sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`owner-sidebar ${sidebarOpen ? 'owner-sidebar--open' : ''}`}>
        <button
          className="owner-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          type="button"
          aria-label="Close menu"
        >
          &times;
        </button>
        <div className="owner-sidebar-header">
          <Link to="/owner" className="owner-sidebar-logo" onClick={() => setSidebarOpen(false)}>
            <span className="owner-sidebar-logo-icon">&#x1F331;</span>
            MindCheck
          </Link>
          <span className="owner-sidebar-role">Owner Portal</span>
        </div>

        <nav className="owner-sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div className="owner-sidebar-section" key={section.title}>
              <div className="owner-sidebar-section-title">{section.title}</div>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`owner-sidebar-link ${isActive ? 'owner-sidebar-link--active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="owner-sidebar-link-icon">{item.icon}</span>
                    <span className="owner-sidebar-link-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="owner-sidebar-footer">
          <div className="owner-sidebar-user">
            <div className="owner-sidebar-avatar">
              {userName[0].toUpperCase()}
            </div>
            <div className="owner-sidebar-user-info">
              <span className="owner-sidebar-user-name">{userName}</span>
              <span className="owner-sidebar-user-role">Owner</span>
            </div>
          </div>
          <button
            type="button"
            className="owner-sidebar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="owner-main">
        {children}
      </main>
    </div>
  );
}
