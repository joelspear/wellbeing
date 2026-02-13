import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/checkin`,
        },
      });

      if (authError) {
        throw authError;
      }

      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <header className="login-header">
        <Link to="/" className="login-logo">MindCheck</Link>
      </header>

      <main className="login-content">
        <div className="login-card card">
          {sent ? (
            <div className="login-success">
              <div className="login-success-icon">&#x2709;</div>
              <h2>Check your inbox</h2>
              <p className="login-success-text">
                We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
              </p>
              <p className="login-success-hint">
                Don't see it? Check your spam folder or try again.
              </p>
              <button
                type="button"
                className="btn-secondary login-retry-btn"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
              >
                Send another link
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">
                Sign in with your school email to continue.
              </p>

              <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@school.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />

                {error && (
                  <div className="alert-box alert-box-red login-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary login-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send me a magic link'}
                </button>
              </form>

              <p className="login-footer-text">
                No account? Ask your school admin to add you, or{' '}
                <Link to="/report">submit an anonymous report</Link> instead.
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="login-footer">
        <p className="login-footer-note">
          If you or someone you know needs immediate help, call Lifeline on{' '}
          <strong>13 11 14</strong> or emergency services on <strong>000</strong>.
        </p>
      </footer>
    </div>
  );
}
