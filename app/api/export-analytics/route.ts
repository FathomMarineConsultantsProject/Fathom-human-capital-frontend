import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAnalytics } from "@/lib/getAnalytics";

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsvRow(values: unknown[]): string {
  return values.map(escapeCsvCell).join(",");
}

export async function GET() {
  try {
    const analytics = await getAnalytics();

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*");
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("*");

    if (jobsError || applicationsError) {
      return NextResponse.json(
        { error: jobsError?.message || applicationsError?.message },
        { status: 500 }
      );
    }

    const jobList = jobs ?? [];
    const applicationList = applications ?? [];

    const lines: string[] = [];
    lines.push("RECRUITMENT ANALYTICS EXPORT");
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push("");

    lines.push("JOBS");
    const jobKeys =
      jobList.length > 0
        ? (Object.keys(jobList[0] as object) as string[])
        : ["id", "title", "department", "status", "created_at", "recruiting_cost", "seniority", "required_skills"];
    lines.push(toCsvRow(jobKeys));
    for (const row of jobList as Record<string, unknown>[]) {
      const values = jobKeys.map((k) => {
        const v = row[k];
        return Array.isArray(v) ? (v as unknown[]).join(";") : v;
      });
      lines.push(toCsvRow(values));
    }
    lines.push("");

    lines.push("APPLICATIONS");
    const appKeys =
      applicationList.length > 0
        ? (Object.keys(applicationList[0] as object) as string[])
        : ["id", "job_id", "name", "email", "status", "applied_at", "source", "gender", "skills", "years_experience"];
    lines.push(toCsvRow(appKeys));
    for (const row of applicationList as Record<string, unknown>[]) {
      const values = appKeys.map((k) => {
        const v = row[k];
        return Array.isArray(v) ? (v as unknown[]).join(";") : v;
      });
      lines.push(toCsvRow(values));
    }
    lines.push("");

    const totalJobs = jobList.length;
    const totalApplications = analytics?.total_applications ?? 0;
    const totalHires = analytics?.total_hires ?? 0;
    const conversionRate = analytics?.conversion_rate ?? 0;
    const costPerHire = analytics?.cost_per_hire ?? 0;

    lines.push("METRICS");
    lines.push(toCsvRow(["Metric", "Value"]));
    lines.push(toCsvRow(["Total Jobs", totalJobs]));
    lines.push(toCsvRow(["Total Applications", totalApplications]));
    lines.push(toCsvRow(["Total Hires", totalHires]));
    lines.push(toCsvRow(["Conversion Rate %", conversionRate]));
    lines.push(toCsvRow(["Cost per Hire", costPerHire]));

    const csv = lines.join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="recruitment-analytics-export.csv"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
