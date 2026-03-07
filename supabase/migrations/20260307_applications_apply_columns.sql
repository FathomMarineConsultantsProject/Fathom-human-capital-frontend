-- Ensure applications table has columns required for candidate apply flow.
-- Run this if your applications table was created without these columns.

alter table applications
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists skills text,
  add column if not exists years_experience integer,
  add column if not exists expected_salary numeric,
  add column if not exists education text,
  add column if not exists resume_url text,
  add column if not exists resume_text text,
  add column if not exists applied_at timestamptz default now();

-- Create storage bucket "Resumes" via Supabase Dashboard if it does not exist:
-- Storage -> New bucket -> Name: Resumes -> Public if you want direct links.
