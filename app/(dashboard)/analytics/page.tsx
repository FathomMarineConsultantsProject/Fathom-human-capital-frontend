import PanelCard from "@/components/PanelCard";
import ExportAnalyticsButton from "./ExportAnalyticsButton";
import { BarChart3, TrendingUp } from "lucide-react";
import { getAnalytics } from "@/lib/getAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  const conversionRate = analytics?.conversion_rate ?? 0;
  const qualityScore = analytics?.quality_score;
  const averageTimeToHire = Math.round(Number(analytics?.avg_time_to_hire ?? 0));
  const costPerHire = analytics?.cost_per_hire ?? 0;

  const sourceRows = [
    { label: "LinkedIn", apps: analytics?.linkedin_count ?? 0 },
    { label: "Job Board", apps: analytics?.jobboard_count ?? 0 },
    { label: "Referral", apps: analytics?.referral_count ?? 0 },
    { label: "Company Website", apps: analytics?.company_count ?? 0 },
    { label: "Agency", apps: analytics?.agency_count ?? 0 },
  ];

  const hasAnySource = sourceRows.some((s) => s.apps > 0);

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
            {!hasAnySource ? (
              <p className="text-sm text-slate-400">
                No sourcing data yet. Applications will appear here.
              </p>
            ) : (
              sourceRows.map(({ label, apps }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm text-slate-600">{label}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {apps} applications
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
