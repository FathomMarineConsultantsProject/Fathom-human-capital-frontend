"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Copy, ExternalLink, Check } from "lucide-react";

const APPLICATION_BASE_URL = "https://fathom-human-capital-frontend.vercel.app";

type JobFormState = {
  title: string;
  department: string;
  required_skills: string;
  salary_budget: string;
  seniority: string;
};

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobFormState>({
    title: "",
    department: "",
    required_skills: "",
    salary_budget: "",
    seniority: ""
  });
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    const autopost = params.get("autopost");

    if (!jobId || autopost !== "1") return;

    setLoading(true);
    setError(null);

    fetch("/api/linkedin/post-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to publish to LinkedIn");
        setCreatedJobId(jobId);
        window.history.replaceState({}, "", "/jobs/new");
      })
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedJobId(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          department: form.department,
          required_skills: form.required_skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          salary_budget: Number(form.salary_budget) || 0,
          seniority: form.seniority,
          status: "active"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      const jobId = data?.job?.id;

      if (!jobId) {
        throw new Error("Job created but missing id");
      }

      setCreatedJobId(jobId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const applicationUrl =
    createdJobId != null
      ? `${APPLICATION_BASE_URL}/apply/${createdJobId}`
      : "";

  function copyLink() {
    if (!applicationUrl) return;
    navigator.clipboard.writeText(applicationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function previewApplication() {
    if (!createdJobId) return;
    window.open(`/apply/${createdJobId}`, "_blank", "noopener,noreferrer");
  }

  if (createdJobId != null && !loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Job Created Successfully
          </h2>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-600">Application Link:</p>
            <p className="break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
              {applicationUrl}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={copyLink}
                className="inline-flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={previewApplication}
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Preview Application Page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Post New Job</h2>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              required
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span>Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              required
            />
          </label>
        </div>

        <label className="space-y-1 text-sm text-slate-700">
          <span>Required Skills (comma-separated)</span>
          <input
            value={form.required_skills}
            onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            placeholder="e.g. React, TypeScript, REST APIs"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span>Salary Budget</span>
            <input
              value={form.salary_budget}
              onChange={(e) => setForm({ ...form, salary_budget: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              inputMode="numeric"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span>Seniority</span>
            <input
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
