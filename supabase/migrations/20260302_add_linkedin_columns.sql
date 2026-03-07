alter table jobs
add column if not exists linkedin_post_urn text,
add column if not exists linkedin_posted boolean default false,
add column if not exists linkedin_posted_at timestamptz;

