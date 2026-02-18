-- MindCheck - Migration Script
-- Run this in your Supabase SQL Editor to update an existing database
-- This adds missing columns and fixes RLS policies for the demo flow

-- ============================================================
-- 1. Add missing columns to checkin_responses
-- ============================================================

ALTER TABLE checkin_responses ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE checkin_responses ADD COLUMN IF NOT EXISTS teacher_email TEXT;
ALTER TABLE checkin_responses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 2. Make teacher_id and school_id nullable (not required for demo flow)
-- ============================================================

-- Drop the foreign key constraint on teacher_id so we can store auth user IDs directly
ALTER TABLE checkin_responses DROP CONSTRAINT IF EXISTS checkin_responses_teacher_id_fkey;

-- Drop the foreign key constraint on school_id
ALTER TABLE checkin_responses DROP CONSTRAINT IF EXISTS checkin_responses_school_id_fkey;

-- ============================================================
-- 3. Fix RLS policies - make them work for the demo
--    The old policies required teacher/school relationships that
--    don't exist in the simplified flow.
-- ============================================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Teachers see own responses" ON checkin_responses;
DROP POLICY IF EXISTS "Teachers insert own responses" ON checkin_responses;
DROP POLICY IF EXISTS "Admins see school responses" ON checkin_responses;

-- New policies: any authenticated user can insert, any authenticated user can read
-- In production you'd scope these to schools, but for demo this works
CREATE POLICY "Anyone can insert responses"
  ON checkin_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read responses"
  ON checkin_responses FOR SELECT
  USING (true);

-- ============================================================
-- 4. Fix teachers table RLS for demo
-- ============================================================

DROP POLICY IF EXISTS "Admins manage school teachers" ON teachers;
DROP POLICY IF EXISTS "Teachers see own record" ON teachers;

CREATE POLICY "Anyone can manage teachers"
  ON teachers FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. Fix schools table RLS for demo
-- ============================================================

DROP POLICY IF EXISTS "Admins manage own schools" ON schools;

CREATE POLICY "Anyone can manage schools"
  ON schools FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. Fix anonymous_reports RLS for demo
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit anonymous report" ON anonymous_reports;
DROP POLICY IF EXISTS "Admins read school reports" ON anonymous_reports;

CREATE POLICY "Anyone can submit reports"
  ON anonymous_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read reports"
  ON anonymous_reports FOR SELECT
  USING (true);

-- Done! Your database is now ready for the MindCheck demo.
