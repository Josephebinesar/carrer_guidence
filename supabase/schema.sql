-- ============================================================
-- PlacementPrep AI – Supabase Schema
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if re-running this script
DROP TABLE IF EXISTS interviews;

-- Main interviews table
CREATE TABLE interviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_text    TEXT            NOT NULL,
  role           TEXT            NOT NULL,
  questions      JSONB           NOT NULL DEFAULT '[]',
  answers        JSONB           NOT NULL DEFAULT '[]',
  score          INTEGER         NOT NULL DEFAULT 0,
  feedback       JSONB           NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by role
CREATE INDEX idx_interviews_role ON interviews (role);

-- Index for time-based queries
CREATE INDEX idx_interviews_created_at ON interviews (created_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- Enable RLS and allow public inserts/updates (anon key)
-- In production you should tie this to auth.uid()
-- ============================================================

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to INSERT a new interview session
CREATE POLICY "Allow anon insert"
  ON interviews FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone with the anon key to SELECT their own interview by id
CREATE POLICY "Allow anon select"
  ON interviews FOR SELECT
  TO anon
  USING (true);

-- Allow anyone with the anon key to UPDATE (to save results)
CREATE POLICY "Allow anon update"
  ON interviews FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
