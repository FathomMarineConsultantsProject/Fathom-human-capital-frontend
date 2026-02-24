import MetricCard from "@/components/MetricCard";
import PanelCard from "@/components/PanelCard";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";

type Job = {
  id: string;
  title: string;
  department: string;
  status: "active" | "closed";
};

type Application = {
  id: string;
  name: string;
  appliedAt: string;
  status: "applied" | "screening" | "interview";
};

const jobs: Job[] = [];
const applications: Application[] = [];

const activeJobs = jobs.filter((job) => job.status === "active").length;
const totalApplications = applications.length;

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
    value: "0",
    icon: <Clock className="h-4 w-4" />
  },
  {
    label: "Cost per Hire",
    value: "₹0",
    icon: <DollarSign className="h-4 w-4" />
  }
];

export default function OverviewPage() {
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
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-400">No job postings yet</p>
          ) : (
            jobs.map((job) => (
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
          {applications.length === 0 ? (
            <p className="text-sm text-slate-400">No applications yet</p>
          ) : (
            applications.map((app) => (
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
                    <p className="text-xs text-slate-500">{app.appliedAt}</p>
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
