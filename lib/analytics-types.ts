/** Row from recruitment_analytics Supabase view (SQL aggregation) */
export type RecruitmentAnalytics = {
  total_applications: number;
  total_hires: number;
  male_count: number;
  female_count: number;
  other_count: number;
  prefer_not_to_say_count: number;
  linkedin_count: number;
  jobboard_count: number;
  referral_count: number;
  company_count: number;
  agency_count: number;
  avg_time_to_hire: number | null;
  active_jobs: number;
  cost_per_hire?: number | null;
  conversion_rate?: number | null;
  quality_score?: number | null;
};
