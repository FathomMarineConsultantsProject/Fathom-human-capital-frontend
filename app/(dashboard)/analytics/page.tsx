import PanelCard from "@/components/PanelCard";
import ExportAnalyticsButton from "./ExportAnalyticsButton";
import { BarChart3, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function AnalyticsPage() {
  const { data: jobs } = await supabase.from("jobs").select("*");
  const { data: applications } = await supabase
    .from("applications")
    .select("*");

  const jobList = jobs ?? [];
  const applicationList = applications ?? [];

  const totalApplications = applicationList.length;

  const hired = applicationList.filter(
    (app: any) => app.status === "hired"
  );
  const totalHires = hired.length;

  const totalRecruitingCost = (jobList as any[]).reduce(
    (sum: number, job: any) => sum + (Number(job.recruiting_cost) || 0),
    0
  );
  const costPerHire =
    totalHires > 0 ? Math.round(totalRecruitingCost / totalHires) : 0;

  const averageTimeToHire =
    totalHires > 0
      ? Math.round(
          hired.reduce((acc: number, app: any) => {
            const appliedAt = app.applied_at
              ? new Date(app.applied_at).getTime()
              : 0;
            const hiredAt = app.hired_at
              ? new Date(app.hired_at).getTime()
              : Date.now();
            const diffDays = (hiredAt - appliedAt) / (1000 * 60 * 60 * 24);
            return acc + diffDays;
          }, 0) / totalHires
        )
      : 0;

  const conversionRate =
    totalApplications > 0
      ? Math.round((totalHires / totalApplications) * 100)
      : 0;

  const hiredWithScore = hired.filter(
    (app: any) => app.ai_score != null && !isNaN(Number(app.ai_score))
  );
  const qualityScore =
    hiredWithScore.length > 0
      ? Math.round(
          hiredWithScore.reduce((acc: number, app: any) => acc + Number(app.ai_score), 0) /
            hiredWithScore.length
        )
      : null;

  const sourceApplicationCounts = applicationList.reduce(
    (acc: Record<string, number>, app: any) => {
      const source = app.source as string | null;
      if (!source) return acc;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sourceHireCounts = hired.reduce(
    (acc: Record<string, number>, app: any) => {
      const source = app.source as string | null;
      if (!source) return acc;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportAnalyticsButton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Key Recruitment Metrics"
        icon={<BarChart3 className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Conversion Rate</span>
            <span className="text-sm font-semibold text-slate-900">
              {conversionRate}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">
              Quality of Hire Score
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {qualityScore != null ? `${qualityScore}/100` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">
              Average Time to Hire
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {averageTimeToHire} days
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Cost per Hire</span>
            <span className="text-sm font-semibold text-slate-900">
              ₹{costPerHire}
            </span>
          </div>
        </div>
      </PanelCard>

      <PanelCard
        title="Source Effectiveness"
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">LinkedIn</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["LinkedIn"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["LinkedIn"] ?? 0} applications
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Job Boards</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["Job Board"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["Job Board"] ?? 0} applications
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Referrals</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["Referral"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["Referral"] ?? 0} applications
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Company Website</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["Company Website"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["Company Website"] ?? 0} applications
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Recruitment Agencies</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["Recruitment Agency"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["Recruitment Agency"] ?? 0} applications
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Other</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {sourceHireCounts["Other"] ?? 0} hires
              </p>
              <p className="text-xs text-slate-500">
                {sourceApplicationCounts["Other"] ?? 0} applications
              </p>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
    </div>
  );
}
