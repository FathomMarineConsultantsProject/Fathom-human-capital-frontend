import { supabase } from "@/lib/supabase";
import type { RecruitmentAnalytics } from "@/lib/analytics-types";

export async function getAnalytics(): Promise<RecruitmentAnalytics | null> {
  const { data, error } = await supabase
    .from("recruitment_analytics")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Analytics fetch error:", error);
    return null;
  }

  return data as RecruitmentAnalytics;
}
