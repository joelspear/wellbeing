import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { attemptDemoLogin } from '../lib/demo';
import './OwnerLogin.css';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      // Try Supabase auth first
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!signInError && data?.user) {
          const role = data.user.user_metadata?.role;
          if (role !== 'owner') {
            await supabase.auth.signOut();
            throw new Error('This account does not have owner access.');
          }
          navigate('/owner');
          return;
        }
      }

      // Demo fallback
      const demoUser = attemptDemoLogin(email, password, 'owner');
      if (demoUser) {
        navigate('/owner');
        return;
      }

      throw new Error('Invalid email or password.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-login">
      <header className="owner-login-header">
        <Link to="/" className="owner-login-logo">
          <span className="owner-login-logo-icon">&#x1F331;</span>
          MindCheck
        </Link>
      </header>

      <main className="owner-login-content">
        <div className="owner-login-card card">
          <div className="owner-login-badge">Owner Access</div>
          <h2 className="owner-login-title">Welcome back</h2>
          <p className="owner-login-subtitle">
            Sign in to manage your MindCheck platform
          </p>

          <form className="owner-login-form" onSubmit={handleSubmit}>
            <div className="owner-login-field">
              <label className="owner-login-label" htmlFor="owner-email">Email Address</label>
              <div className="owner-login-input-wrap">
                <span className="owner-login-input-icon">&#x2709;</span>
                <input
                  id="owner-email"
                  type="email"
                  className="input-field owner-login-input"
                  placeholder="you@company.com.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="owner-login-field">
              <label className="owner-login-label" htmlFor="owner-password">Password</label>
              <div className="owner-login-input-wrap">
                <span className="owner-login-input-icon">&#x1F512;</span>
                <input
                  id="owner-password"
                  type="password"
                  className="input-field owner-login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="alert-box alert-box-red owner-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="owner-login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>

      <footer className="owner-login-footer">
        <p className="owner-login-footer-text">
          MindCheck &copy; 2026 &middot; Owner Portal
        </p>
      </footer>
    </div>
  );
}
