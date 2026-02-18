-- MindCheck Wellbeing Platform - Supabase Database Schema
-- Run this in the Supabase SQL Editor after creating your project

-- ============================================================
-- TABLES
-- ============================================================

-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT, -- e.g. 'SA', 'VIC', 'NSW', 'QLD'
  school_type TEXT DEFAULT 'secondary', -- 'primary', 'secondary', 'combined'
  created_at TIMESTAMPTZ DEFAULT now(),
  admin_user_id UUID REFERENCES auth.users(id)
);

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'teacher',
  status TEXT DEFAULT 'Pending',
  invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Check-in responses table
CREATE TABLE checkin_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID, -- auth.users ID of the teacher (nullable)
  school_id UUID,  -- nullable for demo
  teacher_name TEXT, -- denormalized for easy display
  teacher_email TEXT, -- denormalized for easy display
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Individual question scores (1-5)
  q1_mood INTEGER CHECK (q1_mood BETWEEN 1 AND 5),
  q2_work_life_balance INTEGER CHECK (q2_work_life_balance BETWEEN 1 AND 5),
  q3_support INTEGER CHECK (q3_support BETWEEN 1 AND 5),
  q4_workload INTEGER CHECK (q4_workload BETWEEN 1 AND 5),
  q5_anxiety INTEGER CHECK (q5_anxiety BETWEEN 1 AND 5),
  q6_hope INTEGER CHECK (q6_hope BETWEEN 1 AND 5),
  q7_sleep INTEGER CHECK (q7_sleep BETWEEN 1 AND 5),
  q8_connection INTEGER CHECK (q8_connection BETWEEN 1 AND 5),
  q9_confidence INTEGER CHECK (q9_confidence BETWEEN 1 AND 5),
  q10_open_text TEXT,

  -- Calculated scores (computed on insert via trigger)
  score_overall NUMERIC(3,2),
  score_stress NUMERIC(3,2),
  score_anxiety NUMERIC(3,2),
  score_depression NUMERIC(3,2),

  -- Alert flag
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT
);

-- Anonymous reports table
CREATE TABLE anonymous_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  report_type TEXT NOT NULL,
  report_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'actioned'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- TRIGGER: Auto-calculate scores on check-in insert
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_checkin_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Overall (Q1-Q9 average)
  NEW.score_overall := (
    NEW.q1_mood + NEW.q2_work_life_balance + NEW.q3_support +
    NEW.q4_workload + NEW.q5_anxiety + NEW.q6_hope +
    NEW.q7_sleep + NEW.q8_connection + NEW.q9_confidence
  ) / 9.0;

  -- Stress subscale (Q2, Q3, Q4, Q7)
  NEW.score_stress := (
    NEW.q2_work_life_balance + NEW.q3_support +
    NEW.q4_workload + NEW.q7_sleep
  ) / 4.0;

  -- Anxiety subscale (Q5, Q9)
  NEW.score_anxiety := (NEW.q5_anxiety + NEW.q9_confidence) / 2.0;

  -- Depression subscale (Q6, Q8)
  NEW.score_depression := (NEW.q6_hope + NEW.q8_connection) / 2.0;

  -- Flag if any individual score is 1 or overall is below 2.5
  IF NEW.q1_mood <= 1 OR NEW.q2_work_life_balance <= 1 OR
     NEW.q3_support <= 1 OR NEW.q5_anxiety <= 1 OR
     NEW.q6_hope <= 1 OR NEW.score_overall < 2.5 THEN
    NEW.is_flagged := true;
    NEW.flag_reason := 'Low score detected';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_scores
  BEFORE INSERT ON checkin_responses
  FOR EACH ROW EXECUTE FUNCTION calculate_checkin_scores();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Permissive for demo
-- ============================================================

ALTER TABLE checkin_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert responses"
  ON checkin_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read responses"
  ON checkin_responses FOR SELECT
  USING (true);

ALTER TABLE anonymous_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit reports"
  ON anonymous_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read reports"
  ON anonymous_reports FOR SELECT
  USING (true);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage schools"
  ON schools FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage teachers"
  ON teachers FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX idx_checkin_teacher_id ON checkin_responses(teacher_id);
CREATE INDEX idx_checkin_school_id ON checkin_responses(school_id);
CREATE INDEX idx_checkin_submitted_at ON checkin_responses(submitted_at);
CREATE INDEX idx_checkin_created_at ON checkin_responses(created_at);
CREATE INDEX idx_checkin_flagged ON checkin_responses(is_flagged) WHERE is_flagged = true;
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_teachers_invite_token ON teachers(invite_token);
CREATE INDEX idx_reports_school_id ON anonymous_reports(school_id);
CREATE INDEX idx_reports_status ON anonymous_reports(status);
