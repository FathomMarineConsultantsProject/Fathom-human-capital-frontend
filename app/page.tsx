import MetricCard from "@/components/MetricCard";
import PanelCard from "@/components/PanelCard";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  department: string;
  status: "active" | "closed";
  created_at: string;
};

type Application = {
  id: string;
  name: string;
  status: "applied" | "screening" | "interview";
  applied_at: string;
  job_id: string | null;
  source: string | null;
  gender: string | null;
};

export default async function OverviewPage() {
  console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, department, status, created_at, recruiting_cost")
    .returns<any[]>();
  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select("*")
    .returns<any[]>();

  if (jobsError) {
    console.error("Jobs fetch error:", jobsError);
  }

  if (applicationsError) {
    console.error("Applications fetch error:", applicationsError);
  }

  const jobList = (jobs ?? []) as Job[];
  const applicationList = (applications ?? []) as Application[];

  console.log("Fetched jobs:", jobList);
  console.log("Fetched applications:", applicationList);
  console.log("Jobs from DB:", jobList);
  console.log("Applications from DB:", applicationList);

  const activeJobs = jobList.filter((job) => job.status === "active").length;
  const totalApplications = applicationList.length;

  const interviews = applicationList.filter(
    (app) => app.status === "interview"
  );
  const totalHires = interviews.length;
  console.log("Total Hires (interview count):", totalHires);

  const averageTimeToHire =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((acc, app) => {
            const job = jobList.find((j) => j.id === app.job_id);
            if (!job) return acc;
            const jobDate = new Date(job.created_at).getTime();
            const appliedDate = new Date(app.applied_at).getTime();
            const diffDays =
              (appliedDate - jobDate) / (1000 * 60 * 60 * 24);
            return acc + diffDays;
          }, 0) / interviews.length
        )
      : 0;

  const totalRecruitingCost = jobList.reduce(
    (sum, job) => sum + (Number((job as any).recruiting_cost) || 0),
    0
  );
  console.log("Total Recruiting Cost:", totalRecruitingCost);

  const costPerHire =
    totalHires > 0
      ? Math.round(totalRecruitingCost / totalHires)
      : 0;
  console.log("Cost Per Hire:", costPerHire);

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
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <PanelCard
          title="Recent Job Postings"
          icon={<Briefcase className="h-4 w-4" />}
        >
          {jobList.length === 0 ? (
            <p className="text-sm text-slate-400">No job postings yet</p>
          ) : (
            jobList.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {job.title}
                  </p>
                  <p className="text-xs text-slate-500">{job.department}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {job.status}
                </span>
              </div>
            ))
          )}
        </PanelCard>
        <PanelCard
          title="Recent Applications"
          icon={<Users className="h-4 w-4" />}
        >
          {applicationList.length === 0 ? (
            <p className="text-sm text-slate-400">No applications yet</p>
          ) : (
            applicationList.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {app.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {app.status}
                </span>
              </div>
            ))
          )}
        </PanelCard>
      </section>
    </div>
  );
}
