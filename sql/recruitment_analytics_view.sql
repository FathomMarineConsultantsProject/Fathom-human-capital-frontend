-- Apply this in Supabase SQL editor (or via migration tooling):
-- Updates cost_per_hire to use jobs.salary_budget for hired applications.

create or replace view public.recruitment_analytics as
with apps as (
  select * from public.applications
)
select
  -- Totals
  count(*)::int as total_applications,
  count(*) filter (where status = 'hired')::int as total_hires,

  -- Avg time to hire in days (NULL when no hires)
  round(
    avg(extract(epoch from (hired_at - applied_at)) / 86400)
  ) filter (where status = 'hired' and hired_at is not null and applied_at is not null)
    as avg_time_to_hire,

  -- Active jobs comes from jobs table (not derived from applications)
  (select count(*)::int from public.jobs j where j.status = 'active') as active_jobs,

  -- Cost per hire: average salary_budget for jobs that produced hires
  coalesce(
    (
      select round(avg(j.salary_budget))
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.status = 'hired'
    ),
    0
  ) as cost_per_hire,

  -- Gender distribution
  count(*) filter (where lower(coalesce(gender, '')) = 'male')::int as male_count,
  count(*) filter (where lower(coalesce(gender, '')) = 'female')::int as female_count,
  count(*) filter (where lower(coalesce(gender, '')) = 'other')::int as other_count,
  (
    count(*) filter (
      where coalesce(nullif(trim(gender), ''), '__missing__') = '__missing__'
        or lower(coalesce(gender, '')) not in ('male', 'female', 'other')
    )
  )::int as prefer_not_to_say_count,

  -- Sourcing channels (basic normalization)
  count(*) filter (where lower(coalesce(source, '')) = 'linkedin')::int as linkedin_count,
  count(*) filter (where lower(coalesce(source, '')) in ('job board', 'job boards', 'jobboard'))::int as jobboard_count,
  count(*) filter (where lower(coalesce(source, '')) = 'referral')::int as referral_count,
  count(*) filter (where lower(coalesce(source, '')) in ('company website', 'company'))::int as company_count,
  count(*) filter (where lower(coalesce(source, '')) in ('agency', 'recruitment agency', 'recruitment agencies'))::int as agency_count,

  -- Extra metrics used by the current UI
  coalesce(
    round((count(*) filter (where status = 'hired'))::numeric / nullif(count(*), 0) * 100),
    0
  ) as conversion_rate
from apps;

