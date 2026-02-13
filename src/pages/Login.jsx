import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (signUpError) throw signUpError;

        setSignUpSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        navigate('/checkin');
      }
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
          {signUpSuccess ? (
            <div className="login-success">
              <div className="login-success-icon">&#x2709;</div>
              <h2>Check your inbox</h2>
              <p className="login-success-text">
                We've sent a confirmation email to <strong>{email}</strong>. Click the link in the email to verify your account.
              </p>
              <p className="login-success-hint">
                Don't see it? Check your spam folder.
              </p>
              <button
                type="button"
                className="btn-secondary login-retry-btn"
                onClick={() => {
                  setSignUpSuccess(false);
                  setIsSignUp(false);
                  setError(null);
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-title">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="login-subtitle">
                {isSignUp
                  ? 'Sign up with your school email to get started.'
                  : 'Sign in with your school email to continue.'}
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

                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder={isSignUp ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
                  {loading
                    ? (isSignUp ? 'Creating account...' : 'Signing in...')
                    : (isSignUp ? 'Create account' : 'Sign in')}
                </button>
              </form>

              <p className="login-toggle-text">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="login-toggle-btn"
                      onClick={() => { setIsSignUp(false); setError(null); }}
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="login-toggle-btn"
                      onClick={() => { setIsSignUp(true); setError(null); }}
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>

              <p className="login-footer-text">
                Or <Link to="/report">submit an anonymous report</Link> without an account.
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
