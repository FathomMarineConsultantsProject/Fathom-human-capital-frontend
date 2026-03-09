import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAnalytics } from "@/lib/getAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type JobRow = {
  id: string;
  title?: string | null;
  department?: string | null;
  status?: string | null;
  salary_budget?: number | null;
  recruiting_cost?: number | null;
  created_at?: string | null;
};

type ApplicationRow = {
  id: string;
  job_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  source?: string | null;
  gender?: string | null;
  years_experience?: number | null;
  education?: string | null;
  skills?: string[] | null;
  applied_at?: string | null;
  hired_at?: string | null;
  jobs?: { title?: string | null } | null;
};

function escapeHtml(value: unknown): string {
  if (value == null) return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function countByStatus(applications: ApplicationRow[], status: string): number {
  return applications.filter(
    (app) => String(app.status || "").toLowerCase() === status
  ).length;
}

function renderMetricCards(
  items: Array<{ label: string; value: string | number }>
): string {
  return items
    .map(
      (item) => `
        <article class="card metric">
          <p class="metric-label">${escapeHtml(item.label)}</p>
          <p class="metric-value">${escapeHtml(item.value)}</p>
        </article>
      `
    )
    .join("");
}

function renderKeyValueRows(
  rows: Array<{ label: string; value: string | number }>
): string {
  return rows
    .map(
      (row) => `
        <div class="kv-row">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderTable(headers: string[], bodyRows: string[][]): string {
  const thead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const tbody = bodyRows
    .map(
      (row) => `
        <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
      `
    )
    .join("");
  return `
    <table>
      <thead><tr>${thead}</tr></thead>
      <tbody>${tbody || `<tr><td colspan="${headers.length}">No records</td></tr>`}</tbody>
    </table>
  `;
}

function buildHtmlReport(params: {
  generatedAt: string;
  analytics: Awaited<ReturnType<typeof getAnalytics>>;
  jobs: JobRow[];
  applications: ApplicationRow[];
}): string {
  const { generatedAt, analytics, jobs, applications } = params;

  const totalJobs = jobs.length;
  const activeJobs = analytics?.active_jobs ?? 0;
  const totalApplications = analytics?.total_applications ?? 0;
  const totalHires = analytics?.total_hires ?? 0;
  const avgTimeToHire = Math.round(Number(analytics?.avg_time_to_hire ?? 0));
  const conversionRate = analytics?.conversion_rate ?? 0;
  const costPerHire = analytics?.cost_per_hire ?? 0;

  const sourceRows = [
    { label: "LinkedIn", value: analytics?.linkedin_count ?? 0 },
    { label: "Job Board", value: analytics?.jobboard_count ?? 0 },
    { label: "Referral", value: analytics?.referral_count ?? 0 },
    { label: "Company Website", value: analytics?.company_count ?? 0 },
    { label: "Agency", value: analytics?.agency_count ?? 0 },
  ];

  const diversityRows = [
    { label: "Male", value: analytics?.male_count ?? 0 },
    { label: "Female", value: analytics?.female_count ?? 0 },
    { label: "Other", value: analytics?.other_count ?? 0 },
    { label: "Prefer not to say", value: analytics?.prefer_not_to_say_count ?? 0 },
  ];

  const pipelineRows = [
    { label: "Applied", value: countByStatus(applications, "applied") },
    { label: "Screening", value: countByStatus(applications, "screening") },
    { label: "Interview", value: countByStatus(applications, "interview") },
    { label: "Offer", value: countByStatus(applications, "offer") },
    { label: "Hired", value: countByStatus(applications, "hired") },
    { label: "Rejected", value: countByStatus(applications, "rejected") },
  ];

  const applicationsByJob = jobs
    .map((job) => {
      const count = applications.filter((app) => app.job_id === job.id).length;
      return { jobTitle: job.title || "Untitled role", count };
    })
    .sort((a, b) => b.count - a.count);

  const jobsTable = renderTable(
    ["Title", "Department", "Status", "Salary Budget", "Created At"],
    jobs.map((job) => [
      job.title || "—",
      job.department || "—",
      job.status || "—",
      formatCurrency(job.salary_budget),
      formatDate(job.created_at),
    ])
  );

  const applicationsTable = renderTable(
    [
      "Candidate",
      "Applied For",
      "Status",
      "Gender",
      "Source",
      "Experience",
      "Applied At",
      "Hired At",
    ],
    applications.map((app) => [
      app.name || "—",
      app.jobs?.title || "—",
      app.status || "—",
      app.gender || "—",
      app.source || "—",
      app.years_experience != null ? `${app.years_experience} yrs` : "—",
      formatDate(app.applied_at),
      formatDate(app.hired_at),
    ])
  );

  const appliedForTable = renderTable(
    ["Job Title", "Applicants"],
    applicationsByJob.map((row) => [row.jobTitle, String(row.count)])
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recruitment Analytics Report</title>
    <style>
      :root {
        --bg: #f6f8fb;
        --surface: #ffffff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #dbe4ee;
        --brand: #1d4ed8;
        --brand-soft: #dbeafe;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: linear-gradient(145deg, #f8fbff 0%, #eef3fb 55%, #f7fafc 100%);
        color: var(--ink);
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        line-height: 1.4;
      }
      .report {
        max-width: 1200px;
        margin: 28px auto 36px;
        padding: 0 16px;
      }
      .hero {
        background: radial-gradient(circle at top right, #eff6ff, #ffffff);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 24px;
      }
      h1 { margin: 0; font-size: 30px; }
      .subtitle { margin: 8px 0 0; color: var(--muted); }
      .stamp {
        margin-top: 10px;
        color: var(--muted);
        font-size: 13px;
      }
      .section {
        margin-top: 18px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 18px;
      }
      .section h2 {
        margin: 0 0 12px;
        font-size: 20px;
      }
      .grid-4 {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .card {
        border: 1px solid var(--line);
        background: #fff;
        border-radius: 12px;
        padding: 12px;
      }
      .metric-label {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }
      .metric-value {
        margin: 6px 0 0;
        font-size: 26px;
        font-weight: 700;
      }
      .kv-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 10px;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid #ebf1f7;
      }
      .stack { display: grid; gap: 8px; }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th, td {
        text-align: left;
        border-bottom: 1px solid #edf2f8;
        padding: 10px 8px;
        vertical-align: top;
      }
      th {
        color: #334155;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #f8fafc;
      }
      @media (max-width: 980px) {
        .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-3 { grid-template-columns: 1fr; }
      }
      @media (max-width: 640px) {
        .grid-4 { grid-template-columns: 1fr; }
      }
      .pill {
        display: inline-block;
        margin-top: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--brand-soft);
        color: var(--brand);
        font-size: 12px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main class="report">
      <header class="hero">
        <h1>Recruitment Analytics Report</h1>
        <p class="subtitle">Full export of overview, sourcing, diversity, predictive pipeline, jobs, and applications.</p>
        <p class="stamp">Generated at: ${escapeHtml(generatedAt)}</p>
      </header>

      <section class="section">
        <h2>Overview Metrics</h2>
        <div class="grid-4">
          ${renderMetricCards([
            { label: "Active Jobs", value: activeJobs },
            { label: "Total Jobs", value: totalJobs },
            { label: "Total Applications", value: totalApplications },
            { label: "Total Hires", value: totalHires },
            { label: "Avg Time to Hire (days)", value: avgTimeToHire },
            { label: "Conversion Rate (%)", value: conversionRate },
            { label: "Cost per Hire", value: formatCurrency(costPerHire) },
            { label: "Quality Score", value: analytics?.quality_score != null ? `${analytics.quality_score}/100` : "—" },
          ])}
        </div>
      </section>

      <section class="section">
        <h2>Candidate Pipeline (Predictive)</h2>
        <div class="grid-3">
          <div class="card">
            <span class="pill">Pipeline Summary</span>
            <div class="stack" style="margin-top: 10px;">
              ${renderKeyValueRows(pipelineRows)}
            </div>
          </div>
          <div class="card">
            <span class="pill">Sourcing Channels</span>
            <div class="stack" style="margin-top: 10px;">
              ${renderKeyValueRows(sourceRows)}
            </div>
          </div>
          <div class="card">
            <span class="pill">Diversity Breakdown</span>
            <div class="stack" style="margin-top: 10px;">
              ${renderKeyValueRows(diversityRows)}
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Applicants by Job</h2>
        ${appliedForTable}
      </section>

      <section class="section">
        <h2>Job Details</h2>
        ${jobsTable}
      </section>

      <section class="section">
        <h2>Application Details</h2>
        ${applicationsTable}
      </section>
    </main>
  </body>
</html>`;
}

export async function GET() {
  try {
    const analytics = await getAnalytics();

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(`
        *,
        jobs (
          title
        )
      `)
      .order("applied_at", { ascending: false });

    if (jobsError || applicationsError) {
      return NextResponse.json(
        { error: jobsError?.message || applicationsError?.message },
        { status: 500 }
      );
    }

    const html = buildHtmlReport({
      generatedAt: new Date().toISOString(),
      analytics,
      jobs: (jobs ?? []) as JobRow[],
      applications: (applications ?? []) as ApplicationRow[],
    });

    const fileName = `recruitment-analytics-report-${new Date()
      .toISOString()
      .slice(0, 10)}.html`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
