export const questions = [
  {
    id: 1,
    key: 'q1_mood',
    text: 'How are you feeling overall today?',
    category: 'mood',
    subscale: 'General',
    labels: ['Struggling', 'Low', 'Okay', 'Good', 'Great'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 2,
    key: 'q2_work_life_balance',
    text: "How's your work-life balance been lately?",
    category: 'stress',
    subscale: 'Stress',
    labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 3,
    key: 'q3_support',
    text: 'How well do you feel supported at work?',
    category: 'support',
    subscale: 'Stress',
    labels: ['Not at all', 'Slightly', 'Somewhat', 'Well', 'Very Well'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 4,
    key: 'q4_workload',
    text: 'How manageable has your workload felt this week?',
    category: 'workload',
    subscale: 'Stress',
    labels: ['Overwhelming', 'Heavy', 'Manageable', 'Comfortable', 'Light'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 5,
    key: 'q5_anxiety',
    text: 'How often have you felt anxious or on edge?',
    category: 'anxiety',
    subscale: 'Anxiety',
    labels: ['Constantly', 'Often', 'Sometimes', 'Rarely', 'Never'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 6,
    key: 'q6_hope',
    text: 'How hopeful do you feel about the near future?',
    category: 'hope',
    subscale: 'Depression',
    labels: ['Not at all', 'Slightly', 'Somewhat', 'Quite', 'Very'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 7,
    key: 'q7_sleep',
    text: 'How well have you been sleeping?',
    category: 'sleep',
    subscale: 'Stress',
    labels: ['Very Poorly', 'Poorly', 'Okay', 'Well', 'Very Well'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 8,
    key: 'q8_connection',
    text: 'How connected do you feel to your colleagues?',
    category: 'connection',
    subscale: 'Depression',
    labels: ['Isolated', 'Disconnected', 'Neutral', 'Connected', 'Very Connected'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
  {
    id: 9,
    key: 'q9_confidence',
    text: 'How confident are you in handling challenges right now?',
    category: 'confidence',
    subscale: 'Anxiety',
    labels: ['Not at all', 'Slightly', 'Somewhat', 'Quite', 'Very'],
    emojis: ['\uD83D\uDE1E', '\uD83D\uDE14', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE0A'],
  },
];

export function calculateScores(answers) {
  const q = (key) => answers[key] || 0;

  const overall = (
    q('q1_mood') + q('q2_work_life_balance') + q('q3_support') +
    q('q4_workload') + q('q5_anxiety') + q('q6_hope') +
    q('q7_sleep') + q('q8_connection') + q('q9_confidence')
  ) / 9;

  const stress = (
    q('q2_work_life_balance') + q('q3_support') +
    q('q4_workload') + q('q7_sleep')
  ) / 4;

  const anxiety = (q('q5_anxiety') + q('q9_confidence')) / 2;

  const depression = (q('q6_hope') + q('q8_connection')) / 2;

  const isFlagged = q('q1_mood') <= 1 || q('q2_work_life_balance') <= 1 ||
    q('q3_support') <= 1 || q('q5_anxiety') <= 1 ||
    q('q6_hope') <= 1 || overall < 2.5;

  return {
    overall: Math.round(overall * 100) / 100,
    stress: Math.round(stress * 100) / 100,
    anxiety: Math.round(anxiety * 100) / 100,
    depression: Math.round(depression * 100) / 100,
    isFlagged,
  };
}

export function getScoreTier(score) {
  if (score >= 4.0) return 'green';
  if (score >= 2.5) return 'amber';
  return 'red';
}

export function getScoreEmoji(score) {
  if (score >= 4.5) return '\uD83C\uDF1F';
  if (score >= 4.0) return '\uD83C\uDF1F';
  if (score >= 3.0) return '\u26C5';
  if (score >= 2.5) return '\uD83C\uDF25\uFE0F';
  return '\uD83C\uDF27\uFE0F';
}
