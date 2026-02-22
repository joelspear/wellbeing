import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDemoUser, clearDemoUser } from '../lib/demo';
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
      { path: '/principal/teachers', label: 'Staff Members', icon: '\u{1F468}\u{200D}\u{1F3EB}' },
    ],
  },
  {
    title: 'WELLBEING',
    items: [
      { path: '/principal/reports', label: 'Anonymous Reports', icon: '\u{1F4E2}' },
    ],
  },
];

const DEMO_NOTIFICATIONS = [
  { id: 1, text: 'Sarah Mitchell submitted a check-in', time: '2 hours ago', read: false },
  { id: 2, text: 'James O\'Brien submitted a check-in', time: '3 hours ago', read: false },
  { id: 3, text: 'Priya Sharma submitted a check-in (flagged)', time: '1 day ago', read: true },
];

export default function PrincipalLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const userRole = currentUser.user_metadata?.role;
            if (userRole === 'principal') {
              setUser(currentUser);
              setAuthChecking(false);
              return;
            }
          }
        } catch {
          // Supabase unreachable — fall through to demo user check
        }
      }

      const demoUser = getDemoUser();
      if (demoUser && demoUser.user_metadata?.role === 'principal') {
        setUser(demoUser);
        setAuthChecking(false);
        return;
      }

      navigate('/login');
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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        <button
          className="principal-notif-btn-mobile"
          onClick={() => setShowNotifications(!showNotifications)}
          type="button"
        >
          &#x1F514;
          {unreadCount > 0 && <span className="principal-notif-badge">{unreadCount}</span>}
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="principal-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`principal-sidebar ${sidebarOpen ? 'principal-sidebar--open' : ''}`}>
        <button
          className="principal-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          type="button"
          aria-label="Close menu"
        >
          &times;
        </button>
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
        {/* Top bar with notifications */}
        <div className="principal-topbar">
          <div className="principal-topbar-greeting">
            Welcome back, <strong>{userName}</strong>
          </div>
          <div className="principal-topbar-actions">
            <button
              className="principal-notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              type="button"
            >
              &#x1F514;
              {unreadCount > 0 && <span className="principal-notif-badge">{unreadCount}</span>}
            </button>
          </div>

          {showNotifications && (
            <div className="principal-notif-dropdown card">
              <div className="principal-notif-header">
                <h3 className="principal-notif-title">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="principal-notif-mark-read"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="principal-notif-list">
                {notifications.length === 0 ? (
                  <p className="principal-notif-empty">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`principal-notif-item ${!n.read ? 'principal-notif-item--unread' : ''}`}
                    >
                      <p className="principal-notif-text">{n.text}</p>
                      <span className="principal-notif-time">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {showNotifications && (
          <div
            className="principal-notif-backdrop"
            onClick={() => setShowNotifications(false)}
          />
        )}

        {children}
      </main>
    </div>
  );
}
