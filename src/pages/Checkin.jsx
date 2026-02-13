import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { questions, calculateScores } from '../lib/questions';
import { supabase } from '../lib/supabase';
import './Checkin.css';

const TOTAL_QUESTIONS = 10;
const AUTO_ADVANCE_DELAY = 400;

export default function Checkin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openText, setOpenText] = useState('');
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check for token in URL params (MVP: just show the survey directly)
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // In a full implementation, validate the token and identify the teacher.
      // For MVP, we proceed directly to the survey.
    }
  }, [token]);

  const currentQ = currentQuestion < questions.length ? questions[currentQuestion] : null;
  const isTextQuestion = currentQuestion === 9;
  const progressPercent = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;

  const transitionTo = useCallback((nextIndex, dir) => {
    setDirection(dir);
    setAnimating(true);
    // Short timeout to trigger the exit animation, then switch question
    setTimeout(() => {
      setCurrentQuestion(nextIndex);
      setAnimating(false);
    }, 250);
  }, []);

  const handleSelect = useCallback((questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));

    // Auto-advance after a short delay
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

    // Attempt Supabase insert (non-blocking; Supabase may not be configured)
    try {
      await supabase.from('checkin_responses').insert({
        answers,
        open_text: openText || null,
        scores,
        token: token || null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // Silently ignore -- Supabase may not be configured for MVP
      console.warn('Supabase insert skipped:', err?.message);
    }

    navigate('/checkin/results', {
      state: { answers, scores, openText },
    });
  };

  // Determine animation class
  const getSlideClass = () => {
    if (animating) {
      return direction === 'forward' ? 'checkin-slide-exit-left' : 'checkin-slide-exit-right';
    }
    return direction === 'forward' ? 'checkin-slide-enter-right' : 'checkin-slide-enter-left';
  };

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
