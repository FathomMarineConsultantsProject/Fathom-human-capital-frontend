import PanelCard from "@/components/PanelCard";
import { PieChart, Target } from "lucide-react";
import { getAnalytics } from "@/lib/getAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DiversityPage() {
  const analytics = await getAnalytics();

  const genderLabels = [
    { label: "Male", count: analytics?.male_count ?? 0 },
    { label: "Female", count: analytics?.female_count ?? 0 },
    { label: "Other", count: analytics?.other_count ?? 0 },
    { label: "Prefer not to say", count: analytics?.prefer_not_to_say_count ?? 0 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Gender Distribution"
        icon={<PieChart className="h-4 w-4" />}
      >
        <div className="space-y-3">
          {genderLabels.map(({ label, count }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {count}
              </span>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Diversity Goals" icon={<Target className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Target Diverse Hires</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Actual Achievement</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Inclusion Score</span>
            <span className="text-sm font-semibold text-slate-900">
              0/100
            </span>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
