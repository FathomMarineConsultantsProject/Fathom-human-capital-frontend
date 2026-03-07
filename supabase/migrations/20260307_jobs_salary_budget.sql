-- Ensure jobs table has salary_budget column for job creation.
alter table jobs
  add column if not exists salary_budget numeric;
