import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') || 'teacher';
  const isPrincipal = role === 'principal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const switchRole = (newRole) => {
    setSearchParams({ role: newRole });
    setError(null);
    setIsSignUp(false);
  };

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
    if (isSignUp && !isPrincipal && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('System not configured. Please contact your administrator.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login?role=${role}`,
            data: {
              full_name: fullName.trim() || null,
              role: isPrincipal ? 'principal' : 'teacher',
            },
          },
        });

        if (signUpError) throw signUpError;
        setSignUpSuccess(true);
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        // Check user role from metadata
        const userRole = signInData?.user?.user_metadata?.role;

        if (isPrincipal && userRole === 'teacher') {
          await supabase.auth.signOut();
          throw new Error('This account is registered as a teacher. Please sign in using the Teacher tab.');
        }

        if (!isPrincipal && userRole === 'principal') {
          await supabase.auth.signOut();
          throw new Error('This account is registered as a principal. Please sign in using the Principal tab.');
        }

        navigate(isPrincipal ? '/principal' : '/checkin');
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
        <Link to="/" className="login-logo">
          <span className="login-logo-icon">&#x1F331;</span>
          MindCheck
        </Link>
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
              <h2 className="login-title">Welcome to MindCheck</h2>
              <p className="login-subtitle">
                {isPrincipal ? 'Principal Portal' : 'Staff Portal'}
              </p>

              {/* Role tabs */}
              <div className="login-tabs">
                <button
                  type="button"
                  className={`login-tab ${!isPrincipal ? 'login-tab--active' : ''}`}
                  onClick={() => switchRole('teacher')}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  className={`login-tab ${isPrincipal ? 'login-tab--active' : ''}`}
                  onClick={() => switchRole('principal')}
                >
                  Principal
                </button>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {isSignUp && !isPrincipal && (
                  <div className="login-field-group">
                    <label className="login-label" htmlFor="fullName">Full Name</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">&#x1F464;</span>
                      <input
                        id="fullName"
                        type="text"
                        className="input-field login-input"
                        placeholder="Jane Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div className="login-field-group">
                  <label className="login-label" htmlFor="email">Email Address</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">&#x2709;</span>
                    <input
                      id="email"
                      type="email"
                      className="input-field login-input"
                      placeholder="you@school.edu.au"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="login-field-group">
                  <label className="login-label" htmlFor="password">Password</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">&#x1F512;</span>
                    <input
                      id="password"
                      type="password"
                      className="input-field login-input"
                      placeholder={isSignUp ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert-box alert-box-red login-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? (isSignUp ? 'Creating account...' : 'Signing in...')
                    : (isSignUp ? 'Create Account' : 'Sign In')}
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
                      Sign in here
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
                      Register here
                    </button>
                  </>
                )}
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
