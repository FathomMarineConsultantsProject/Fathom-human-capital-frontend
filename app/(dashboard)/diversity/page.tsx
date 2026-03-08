import PanelCard from "@/components/PanelCard";
import { PieChart, Target } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function DiversityPage() {
  const { data: jobs } = await supabase.from("jobs").select("*");
  const { data: applications } = await supabase
    .from("applications")
    .select("*");

  const jobList = jobs ?? [];
  const applicationList = applications ?? [];

  const total = applicationList.length;

  const genderCounts = applicationList.reduce(
    (acc: Record<string, number>, app: any) => {
      const gender = app.gender as string | null;
      if (!gender) return acc;
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const genderLabels = [
    "Male",
    "Female",
    "Other",
    "Prefer not to say"
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Gender Distribution"
        icon={<PieChart className="h-4 w-4" />}
      >
        <div className="space-y-3">
          {genderLabels.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {genderCounts[label] ?? 0}
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
