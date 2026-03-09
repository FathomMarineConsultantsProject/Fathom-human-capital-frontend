"use client";

import MetricCard from "@/components/MetricCard";
import PanelCard from "@/components/PanelCard";
import {
  Briefcase,
  Users,
  Clock,
  DollarSign,
  Trash2,
  CheckSquare,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

type OverviewContentProps = {
  jobs: Job[];
  applications: Application[];
  metrics: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
};

export default function OverviewContent({
  jobs,
  applications,
  metrics,
}: OverviewContentProps) {
  const router = useRouter();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [jobActionError, setJobActionError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedJobIds((prev) => prev.filter((id) => jobs.some((job) => job.id === id)));
  }, [jobs]);

  async function handleDeleteJob(jobId: string) {
    setJobActionError(null);
    setDeletingJobId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete job");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingJobId(null);
      setDeleteJobId(null);
    }
  }

  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedJobIds([]);
      }
      return !prev;
    });
  }

  function toggleJobSelection(jobId: string) {
    setSelectedJobIds((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  }

  function selectAllJobs() {
    setSelectedJobIds((prev) =>
      prev.length === jobs.length ? [] : jobs.map((job) => job.id)
    );
  }

  async function handleBulkDeleteJobs() {
    if (selectedJobIds.length === 0 || bulkDeleting) return;
    const confirmDelete = confirm(
      `Delete ${selectedJobIds.length} selected job posting(s)? Related applications will also be removed.`
    );
    if (!confirmDelete) return;

    setJobActionError(null);
    setBulkDeleting(true);

    const failedIds: string[] = [];
    for (const jobId of selectedJobIds) {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
        if (!res.ok) {
          failedIds.push(jobId);
        }
      } catch {
        failedIds.push(jobId);
      }
    }

    setBulkDeleting(false);
    setSelectionMode(false);
    setSelectedJobIds([]);

    if (failedIds.length > 0) {
      setJobActionError("Some selected jobs could not be deleted. Please retry.");
    }

    router.refresh();
  }

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
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-xs text-slate-600">
                  {selectionMode
                    ? `${selectedJobIds.length} selected`
                    : "Manage recent job postings"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!selectionMode ? (
                    <button
                      type="button"
                      onClick={toggleSelectionMode}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      Select
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={selectAllJobs}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {selectedJobIds.length === jobs.length ? "Clear all" : "Select all"}
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDeleteJobs}
                        disabled={selectedJobIds.length === 0 || bulkDeleting}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {bulkDeleting ? "Deleting..." : "Delete selected"}
                      </button>
                      <button
                        type="button"
                        onClick={toggleSelectionMode}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {jobActionError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {jobActionError}
                </p>
              )}

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedJobIds.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                        aria-label={`Select ${job.title}`}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500">{job.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {job.status}
                    </span>
                    {job.linkedin_posted === true && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        ✅ Published to LinkedIn
                      </span>
                    )}
                    {!selectionMode && (
                      <button
                        type="button"
                        onClick={() => setDeleteJobId(job.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete job"
                        disabled={deletingJobId === job.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                    <p className="text-xs text-slate-500">
                      {app.applied_at
                        ? new Date(app.applied_at ?? "").toISOString().split("T")[0]
                        : "—"}
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

      {deleteJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <p className="text-sm font-medium text-slate-900">
              Are you sure you want to delete this job posting?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteJobId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteJob(deleteJobId)}
                disabled={deletingJobId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingJobId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
