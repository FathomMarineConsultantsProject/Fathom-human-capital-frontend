-- Columns for AI resume parsing (extracted_skills = PostgreSQL array).
alter table applications
  add column if not exists extracted_skills text[],
  add column if not exists resume_summary text;
