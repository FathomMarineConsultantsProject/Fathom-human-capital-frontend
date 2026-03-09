import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ApplicationForm from "./ApplicationForm";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  title: string;
  department: string;
  description?: string | null;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            Apply for: {jobData.title}
          </h1>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Department</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {jobData.department}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Job Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {jobData.description?.trim() || "—"}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <ApplicationForm jobId={jobId} />
    </div>
  );
}
