"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import PhoneInput from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

type Props = { jobId: string };

export default function ApplicationForm({ jobId }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    years_experience: "",
    education: "",
    source: "",
    gender: ""
  });
  const [phone, setPhone] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  function addSkill(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setSkills((prev) => {
      if (prev.includes(value)) return prev; // prevent exact duplicates only
      return [...prev, value];
    });
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadError(null);

    if (phone && !isValidPhoneNumber(phone)) {
      setLoading(false);
      setPhoneError("Please enter a valid phone number");
      return;
    }

    try {
      let resumeUrl: string | null = null;

      if (resumeFile) {
        setUploading(true);
        const formData = new FormData();
        formData.set("file", resumeFile);
        formData.set("jobId", jobId);

        const uploadRes = await fetch("/api/upload-resume", {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setUploadError(uploadData.error || "Failed to upload resume");
          throw new Error(uploadData.error || "Failed to upload resume");
        }
        resumeUrl = uploadData.resume_url;
        setUploading(false);
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          name: form.name,
          email: form.email,
          phone: phone || null,
          skills: skills.length > 0 ? skills : null,
          years_experience: form.years_experience
            ? Number(form.years_experience)
            : null,
          education: form.education || null,
          resume_url: resumeUrl,
          source: form.source || null,
          gender: form.gender || null
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
      setUploading(false);
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
          <PhoneInput
            country="IN"
            international
            value={phone}
            onChange={(value) => {
              setPhone(value ?? undefined);
              setPhoneError(
                value && !isValidPhoneNumber(value)
                  ? "Please enter a valid phone number"
                  : null
              );
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Enter phone number"
          />
          {phoneError && (
            <p className="text-xs text-red-600">{phoneError}</p>
          )}
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Skills</span>
          <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800"
                >
                  {skill}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill(skillInput);
                  } else if (
                    e.key === "Backspace" &&
                    !skillInput &&
                    skills.length > 0
                  ) {
                    removeSkill(skills[skills.length - 1]);
                  }
                }}
                className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none"
                placeholder="Type a skill and press Enter"
              />
            </div>
          </div>
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
          <span>How did you hear about us?</span>
          <select
            name="source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <option value="">Select source</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Job Board">Job Board</option>
            <option value="Referral">Referral</option>
            <option value="Company Website">Company Website</option>
            <option value="Recruitment Agency">Recruitment Agency</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm text-slate-700">
          <span>Gender</span>
          <select
            name="gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
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

        {uploading && (
          <p className="text-xs text-slate-500">Uploading resume...</p>
        )}
        {uploadError && (
          <p className="text-xs text-red-600">{uploadError}</p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || uploading}
            className="w-full sm:w-auto"
          >
            {loading
              ? uploading
                ? "Uploading resume..."
                : "Submitting..."
              : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
