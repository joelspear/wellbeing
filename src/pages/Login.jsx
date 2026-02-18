import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { attemptDemoLogin } from '../lib/demo';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!isSupabaseConfigured) {
          throw new Error('System not configured. Please contact the MindCheck team.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: fullName.trim(),
              role: 'principal',
            },
          },
        });

        if (signUpError) throw signUpError;
        setSignUpSuccess(true);
      } else {
        let authenticated = false;

        if (isSupabaseConfigured && supabase) {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!signInError && data?.user) {
            const userRole = data.user.user_metadata?.role;
            if (userRole !== 'principal') {
              await supabase.auth.signOut();
              throw new Error('This account does not have principal access. If you are a teacher, please use the check-in link provided by your principal.');
            }
            authenticated = true;
          }
        }

        if (!authenticated) {
          const demoUser = attemptDemoLogin(email, password, 'principal');
          if (demoUser) {
            authenticated = true;
          }
        }

        if (!authenticated) {
          throw new Error('Invalid email or password.');
        }

        navigate('/principal');
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
              <div className="login-role-badge">Principal Portal</div>
              <h2 className="login-title">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="login-subtitle">
                {isSignUp
                  ? 'Set up your principal account to manage staff wellbeing'
                  : 'Sign in to your principal dashboard'}
              </p>

              <form className="login-form" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="login-field-group">
                    <label className="login-label" htmlFor="fullName">Full Name</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">&#x1F464;</span>
                      <input
                        id="fullName"
                        type="text"
                        className="input-field login-input"
                        placeholder="Your full name"
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
                      placeholder="principal@school.edu.au"
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
                    Received an invitation?{' '}
                    <button
                      type="button"
                      className="login-toggle-btn"
                      onClick={() => { setIsSignUp(true); setError(null); }}
                    >
                      Create your account
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
