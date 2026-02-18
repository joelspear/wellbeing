import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, calculateScores } from '../lib/questions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { attemptDemoLogin } from '../lib/demo';
import './Checkin.css';

const TOTAL_QUESTIONS = 10;
const AUTO_ADVANCE_DELAY = 400;

export default function Checkin() {
  const navigate = useNavigate();

  // Auth phase state
  const [phase, setPhase] = useState('auth'); // 'auth' or 'survey'
  const [authMode, setAuthMode] = useState('new'); // 'new' or 'returning'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  // Survey phase state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openText, setOpenText] = useState('');
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'new' && !fullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }
    if (!password) {
      setAuthError('Please enter a password.');
      return;
    }
    if (authMode === 'new' && password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'new') {
        // Sign up new teacher
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role: 'teacher',
              },
            },
          });

          if (error) throw error;

          // Some Supabase configs auto-confirm; check if we got a session
          if (data?.user) {
            setUser(data.user);
            setPhase('survey');
            return;
          }

          // If email confirmation is required, try signing in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!signInError && signInData?.user) {
            setUser(signInData.user);
            setPhase('survey');
            return;
          }
        }

        // Demo fallback
        const demoUser = attemptDemoLogin(email, password, 'teacher');
        if (demoUser) {
          setUser(demoUser);
          setPhase('survey');
          return;
        }

        // If Supabase didn't error but also didn't give us a user, still proceed
        setUser({ id: null, email: email.trim(), user_metadata: { full_name: fullName.trim(), role: 'teacher' } });
        setPhase('survey');
      } else {
        // Returning teacher - sign in
        let authenticated = false;

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!error && data?.user) {
            setUser(data.user);
            authenticated = true;
          }
        }

        if (!authenticated) {
          const demoUser = attemptDemoLogin(email, password, 'teacher');
          if (demoUser) {
            setUser(demoUser);
            authenticated = true;
          }
        }

        if (!authenticated) {
          throw new Error('Invalid email or password. Please check your credentials or create a new account.');
        }

        setPhase('survey');
      }
    } catch (err) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const currentQ = currentQuestion < questions.length ? questions[currentQuestion] : null;
  const isTextQuestion = currentQuestion === 9;
  const progressPercent = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;

  const transitionTo = useCallback((nextIndex, dir) => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentQuestion(nextIndex);
      setAnimating(false);
    }, 250);
  }, []);

  const handleSelect = useCallback((questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));

    setTimeout(() => {
      if (currentQuestion < 9) {
        transitionTo(currentQuestion + 1, 'forward');
      }
    }, AUTO_ADVANCE_DELAY);
  }, [currentQuestion, transitionTo]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      transitionTo(currentQuestion - 1, 'backward');
    }
  }, [currentQuestion, transitionTo]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const scores = calculateScores(answers);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('checkin_responses').insert({
          teacher_id: user?.id || null,
          teacher_name: user?.user_metadata?.full_name || fullName || null,
          teacher_email: user?.email || email || null,
          q1_mood: answers.q1_mood,
          q2_work_life_balance: answers.q2_work_life_balance,
          q3_support: answers.q3_support,
          q4_workload: answers.q4_workload,
          q5_anxiety: answers.q5_anxiety,
          q6_hope: answers.q6_hope,
          q7_sleep: answers.q7_sleep,
          q8_connection: answers.q8_connection,
          q9_confidence: answers.q9_confidence,
          q10_open_text: openText || null,
        });
      } catch (err) {
        console.warn('Supabase insert skipped:', err?.message);
      }
    }

    // Sign out the teacher so they don't stay logged in
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    // Redirect back to marketing page
    navigate('/');
  };

  const getSlideClass = () => {
    if (animating) {
      return direction === 'forward' ? 'checkin-slide-exit-left' : 'checkin-slide-exit-right';
    }
    return direction === 'forward' ? 'checkin-slide-enter-right' : 'checkin-slide-enter-left';
  };

  // Auth phase
  if (phase === 'auth') {
    return (
      <div className="checkin">
        <div className="checkin-header">
          <div className="checkin-logo">MindCheck</div>
        </div>

        <div className="checkin-auth">
          <div className="checkin-auth-card card">
            <div className="checkin-auth-icon">&#x1F331;</div>
            <h2 className="checkin-auth-title">Staff Wellbeing Check-in</h2>
            <p className="checkin-auth-subtitle">
              Enter your details to begin your confidential wellbeing check-in.
            </p>

            <div className="checkin-auth-tabs">
              <button
                type="button"
                className={`checkin-auth-tab ${authMode === 'new' ? 'checkin-auth-tab--active' : ''}`}
                onClick={() => { setAuthMode('new'); setAuthError(null); }}
              >
                First Time
              </button>
              <button
                type="button"
                className={`checkin-auth-tab ${authMode === 'returning' ? 'checkin-auth-tab--active' : ''}`}
                onClick={() => { setAuthMode('returning'); setAuthError(null); }}
              >
                Returning Staff
              </button>
            </div>

            <form className="checkin-auth-form" onSubmit={handleAuth}>
              {authMode === 'new' && (
                <div className="checkin-auth-field">
                  <label className="checkin-auth-label" htmlFor="checkin-name">Full Name</label>
                  <input
                    id="checkin-name"
                    type="text"
                    className="input-field"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    disabled={authLoading}
                  />
                </div>
              )}

              <div className="checkin-auth-field">
                <label className="checkin-auth-label" htmlFor="checkin-email">Email Address</label>
                <input
                  id="checkin-email"
                  type="email"
                  className="input-field"
                  placeholder="you@school.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  disabled={authLoading}
                />
              </div>

              <div className="checkin-auth-field">
                <label className="checkin-auth-label" htmlFor="checkin-password">Password</label>
                <input
                  id="checkin-password"
                  type="password"
                  className="input-field"
                  placeholder={authMode === 'new' ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'new' ? 'new-password' : 'current-password'}
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="alert-box alert-box-red checkin-auth-error">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary checkin-auth-submit"
                disabled={authLoading}
              >
                {authLoading ? 'Please wait...' : 'Continue to Check-in'}
              </button>
            </form>

            <div className="checkin-auth-privacy">
              <span className="checkin-auth-privacy-icon">&#x1F512;</span>
              Your responses are confidential and will only be visible to your school's wellbeing coordinator.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Survey phase
  return (
    <div className="checkin">
      {/* Header */}
      <div className="checkin-header">
        <div className="checkin-logo">MindCheck</div>
        <div className="checkin-progress-label">
          Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="checkin-progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="checkin-body">
        <div className={`checkin-question-wrapper ${getSlideClass()}`}>
          {!isTextQuestion && currentQ ? (
            <div className="checkin-question">
              <h2 className="checkin-question-text">{currentQ.text}</h2>

              <div className="checkin-options">
                {currentQ.emojis.map((emoji, idx) => {
                  const value = idx + 1;
                  const isSelected = answers[currentQ.key] === value;
                  return (
                    <button
                      key={idx}
                      className={`checkin-option ${isSelected ? 'checkin-option--selected' : ''}`}
                      onClick={() => handleSelect(currentQ.key, value)}
                      aria-label={`${currentQ.labels[idx]} - ${value} out of 5`}
                      type="button"
                    >
                      <span className="checkin-option-emoji">{emoji}</span>
                      <span className="checkin-option-label">{currentQ.labels[idx]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="checkin-question checkin-question--text">
              <h2 className="checkin-question-text">
                Is there anything else on your mind?
              </h2>
              <p className="checkin-question-subtext">
                This is optional. Share anything that might help your wellbeing coordinator support you.
              </p>

              <textarea
                className="checkin-textarea input-field"
                placeholder="Type here... (optional)"
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                rows={5}
              />

              <div className="checkin-privacy">
                <span className="checkin-privacy-icon" role="img" aria-label="lock">&#x1F512;</span>
                <span className="checkin-privacy-text">
                  This is confidential. Only your designated wellbeing coordinator can see identified responses.
                </span>
              </div>

              <button
                className="btn-primary checkin-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
                type="button"
              >
                {submitting ? 'Submitting...' : 'Complete Check-in'}
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        {currentQuestion > 0 && (
          <button
            className="checkin-back-btn"
            onClick={handleBack}
            type="button"
            aria-label="Go to previous question"
          >
            &#8592; Back
          </button>
        )}
      </div>
    </div>
  );
}
