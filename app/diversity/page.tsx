import PanelCard from "@/components/PanelCard";
import { PieChart, Target } from "lucide-react";

export default function DiversityPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Gender Distribution"
        icon={<PieChart className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Male</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Female</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Other</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
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
