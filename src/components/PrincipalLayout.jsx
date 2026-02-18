import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './PrincipalLayout.css';

const NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { path: '/principal', label: 'Dashboard', icon: '\u{1F4CA}' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/principal/responses', label: 'Check-in Responses', icon: '\u{1F4CB}' },
      { path: '/principal/teachers', label: 'Teachers', icon: '\u{1F468}\u{200D}\u{1F3EB}' },
    ],
  },
  {
    title: 'WELLBEING',
    items: [
      { path: '/principal/reports', label: 'Anonymous Reports', icon: '\u{1F4E2}' },
    ],
  },
];

export default function PrincipalLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setAuthChecking(false);
        navigate('/login?role=principal');
        return;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/login?role=principal');
        return;
      }

      // Role check - only principals can access this portal
      const userRole = currentUser.user_metadata?.role;
      if (userRole !== 'principal') {
        navigate('/login?role=principal');
        return;
      }

      setUser(currentUser);
      setAuthChecking(false);
    }

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  if (authChecking) {
    return (
      <div className="principal-layout">
        <div className="principal-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Principal';

  return (
    <div className="principal-layout">
      {/* Mobile header */}
      <div className="principal-mobile-header">
        <button
          className="principal-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          type="button"
          aria-label="Toggle menu"
        >
          <span className="principal-hamburger-line" />
          <span className="principal-hamburger-line" />
          <span className="principal-hamburger-line" />
        </button>
        <span className="principal-mobile-title">MindCheck</span>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="principal-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`principal-sidebar ${sidebarOpen ? 'principal-sidebar--open' : ''}`}>
        <div className="principal-sidebar-header">
          <Link to="/principal" className="principal-sidebar-logo" onClick={() => setSidebarOpen(false)}>
            <span className="principal-sidebar-logo-icon">&#x1F331;</span>
            MindCheck
          </Link>
          <span className="principal-sidebar-role">Principal Portal</span>
        </div>

        <nav className="principal-sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div className="principal-sidebar-section" key={section.title}>
              <div className="principal-sidebar-section-title">{section.title}</div>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`principal-sidebar-link ${isActive ? 'principal-sidebar-link--active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="principal-sidebar-link-icon">{item.icon}</span>
                    <span className="principal-sidebar-link-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="principal-sidebar-footer">
          <div className="principal-sidebar-user">
            <div className="principal-sidebar-avatar">
              {userName[0].toUpperCase()}
            </div>
            <div className="principal-sidebar-user-info">
              <span className="principal-sidebar-user-name">{userName}</span>
              <span className="principal-sidebar-user-role">Principal</span>
            </div>
          </div>
          <button
            type="button"
            className="principal-sidebar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="principal-main">
        {children}
      </main>
    </div>
  );
}
