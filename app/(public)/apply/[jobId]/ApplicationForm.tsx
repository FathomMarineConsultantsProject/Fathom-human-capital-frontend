"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = { jobId: string };

export default function ApplicationForm({ jobId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    years_experience: "",
    expected_salary: "",
    education: ""
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let resumeUrl: string | null = null;

      if (resumeFile) {
        const formData = new FormData();
        formData.set("file", resumeFile);
        formData.set("jobId", jobId);

        const uploadRes = await fetch("/api/upload-resume", {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload resume");
        }
        resumeUrl = uploadData.resume_url;
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          skills: form.skills || null,
          years_experience: form.years_experience
            ? Number(form.years_experience)
            : null,
          expected_salary: form.expected_salary
            ? Number(form.expected_salary)
            : null,
          education: form.education || null,
          resume_url: resumeUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Application Submitted Successfully
        </h2>
        <p className="mt-2 text-slate-600">
          Thank you for applying. We will review your application and get back to
          you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 space-y-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Application Form
      </h2>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1 text-sm text-slate-700">
          <span>Full Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            required
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            required
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Skills</span>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            placeholder="e.g. React, TypeScript, Node.js"
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Years of Experience</span>
          <input
            type="number"
            min={0}
            value={form.years_experience}
            onChange={(e) =>
              setForm({ ...form, years_experience: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Expected Salary</span>
          <input
            type="number"
            min={0}
            value={form.expected_salary}
            onChange={(e) =>
              setForm({ ...form, expected_salary: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Education</span>
          <input
            type="text"
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            placeholder="e.g. B.S. Computer Science"
          />
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Upload Resume (PDF)</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
          />
        </label>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
