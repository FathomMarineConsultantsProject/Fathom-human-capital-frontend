import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ApplicationForm from "./ApplicationForm";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  title: string;
  department: string;
  salary_budget: number | null;
  required_skills: string[] | null;
  seniority: string | null;
  status: string;
};

export default async function ApplyPage({
  params
}: {
  params: { jobId: string };
}) {
  const { jobId } = params;
  if (!jobId) notFound();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    notFound();
  }

  const jobData = job as Job;

  if (jobData.status !== "active") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Apply for: {jobData.title}
        </h1>
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="text-slate-500">Department</dt>
            <dd className="font-medium text-slate-900">{jobData.department}</dd>
          </div>
          {jobData.salary_budget != null && (
            <div>
              <dt className="text-slate-500">Salary Budget</dt>
              <dd className="font-medium text-slate-900">
                {typeof jobData.salary_budget === "number"
                  ? jobData.salary_budget.toLocaleString()
                  : jobData.salary_budget}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <ApplicationForm jobId={jobId} />
    </div>
  );
}
