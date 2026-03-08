"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Copy, ExternalLink, Check, ChevronDown } from "lucide-react";

const APPLICATION_BASE_URL =
  "https://fathom-human-capital-frontend.vercel.app";

type JobFormState = {
  title: string;
  department: string;
  seniority: string;
};

type Currency = "INR" | "USD" | "EUR";

function formatCurrencyInput(
  raw: string,
  currency: Currency,
  symbol: string
) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) {
    return { display: "", numeric: null as number | null };
  }
  const numeric = Number(digits);
  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US"
  );
  return {
    display: `${symbol}${formatter.format(numeric)}`,
    numeric
  };
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobFormState>({
    title: "",
    department: "",
    seniority: ""
  });
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState<Currency>("INR");
  const [salaryBudget, setSalaryBudget] = useState<number | null>(null);
  const [salaryBudgetInput, setSalaryBudgetInput] = useState("");

  const salaryCurrencySymbol = useMemo(
    () =>
      ({
        INR: "₹",
        USD: "$",
        EUR: "€"
      }[salaryCurrency]),
    [salaryCurrency]
  );

  function addRequiredSkill(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setRequiredSkills((prev) => {
      if (prev.includes(value)) return prev; // prevent exact duplicates
      return [...prev, value];
    });
    setRequiredSkillInput("");
  }

  function removeRequiredSkill(skill: string) {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill));
  }

  useEffect(() => {
    if (salaryBudget != null) {
      const { display } = formatCurrencyInput(
        salaryBudget.toString(),
        salaryCurrency,
        salaryCurrencySymbol
      );
      setSalaryBudgetInput(display);
    } else {
      setSalaryBudgetInput("");
    }
  }, [salaryBudget, salaryCurrency, salaryCurrencySymbol]);

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
    if (!form.title.trim() || !form.department.trim() || !form.seniority.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!requiredSkills.length) {
      setError("Please add at least one skill");
      return;
    }
    if (salaryBudget == null) {
      setError("Please enter a salary budget.");
      return;
    }

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
          required_skills: requiredSkills,
          salary_budget: salaryBudget,
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

      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="space-y-4"
      >
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
          <span>Required Skills</span>
          <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800"
                >
                  {skill}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() => removeRequiredSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={requiredSkillInput}
                onChange={(e) => setRequiredSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addRequiredSkill(requiredSkillInput);
                  } else if (
                    e.key === "Backspace" &&
                    !requiredSkillInput &&
                    requiredSkills.length > 0
                  ) {
                    removeRequiredSkill(
                      requiredSkills[requiredSkills.length - 1]
                    );
                  }
                }}
                className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none"
                placeholder="Type a skill and press Enter"
              />
            </div>
          </div>
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span>Salary Budget</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-32">
                <select
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm"
                  value={salaryCurrency}
                  onChange={(e) =>
                    setSalaryCurrency(e.target.value as Currency)
                  }
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={salaryBudgetInput}
                onChange={(e) => {
                  const { display, numeric } = formatCurrencyInput(
                    e.target.value,
                    salaryCurrency,
                    salaryCurrencySymbol
                  );
                  setSalaryBudgetInput(display);
                  setSalaryBudget(numeric);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder={`${salaryCurrencySymbol}1,00,000`}
                required
              />
            </div>
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span>Seniority</span>
            <input
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={
            loading ||
            !form.title.trim() ||
            !form.department.trim() ||
            !form.seniority.trim() ||
            !requiredSkills.length ||
            salaryBudget == null
          }
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
