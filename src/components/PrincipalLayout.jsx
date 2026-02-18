import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './PrincipalLayout.css';

const NAV_ITEMS = [
  { path: '/principal', label: 'Dashboard', icon: '\u{1F4CA}' },
  { path: '/principal/responses', label: 'Responses', icon: '\u{1F4CB}' },
  { path: '/principal/teachers', label: 'Teachers', icon: '\u{1F468}\u{200D}\u{1F3EB}' },
  { path: '/principal/reports', label: 'Reports', icon: '\u{1F4E2}' },
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
            MindCheck
          </Link>
          <span className="principal-sidebar-role">Principal Portal</span>
        </div>

        <nav className="principal-sidebar-nav">
          {NAV_ITEMS.map((item) => {
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
        </nav>

        <div className="principal-sidebar-footer">
          {user && (
            <div className="principal-sidebar-user">
              <div className="principal-sidebar-avatar">
                {(user.email || 'P')[0].toUpperCase()}
              </div>
              <span className="principal-sidebar-email">{user.email}</span>
            </div>
          )}
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
