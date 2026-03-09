import OverviewContent from "./OverviewContent";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAnalytics } from "@/lib/getAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Job = {
  id: string;
  title: string;
  department: string;
  status: "active" | "closed";
  created_at: string;
  linkedin_posted?: boolean;
  recruiting_cost?: number;
};

type Application = {
  id: string;
  job_id: string | null;
  name: string;
  status: string;
  source?: string | null;
  gender?: string | null;
  applied_at?: string | null;
  hired_at?: string | null;
};

export default async function OverviewPage() {
  const analytics = await getAnalytics();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: applications } = await supabase
    .from("applications")
    .select("*");

  const jobList = (jobs ?? []) as Job[];
  const applicationList = (applications ?? []) as Application[];

  const activeJobs = analytics?.active_jobs ?? 0;
  const totalApplications = analytics?.total_applications ?? 0;
  const averageTimeToHire = Math.round(Number(analytics?.avg_time_to_hire ?? 0));
  const costPerHire = analytics?.cost_per_hire ?? 0;

  const metrics = [
    {
      label: "Active Jobs",
      value: String(activeJobs),
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      label: "Total Applications",
      value: String(totalApplications),
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Avg Time to Hire",
      value: String(averageTimeToHire),
      icon: <Clock className="h-4 w-4" />
    },
    {
      label: "Cost per Hire",
      value: `₹${costPerHire}`,
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  return (
    <OverviewContent
      jobs={jobList}
      applications={applicationList}
      metrics={metrics}
    />
  );
}
