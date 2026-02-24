import PanelCard from "@/components/PanelCard";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Key Recruitment Metrics"
        icon={<BarChart3 className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Conversion Rate</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">
              Quality of Hire Score
            </span>
            <span className="text-sm font-semibold text-slate-900">0/100</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">
              Average Time to Hire
            </span>
            <span className="text-sm font-semibold text-slate-900">
              0 days
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
              <p className="text-sm font-medium text-slate-900">0 hires</p>
              <p className="text-xs text-slate-500">0 applications</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Job Boards</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">0 hires</p>
              <p className="text-xs text-slate-500">0 applications</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Referrals</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">0 hires</p>
              <p className="text-xs text-slate-500">0 applications</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Company Website</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">0 hires</p>
              <p className="text-xs text-slate-500">0 applications</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Recruitment Agencies</span>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">0 hires</p>
              <p className="text-xs text-slate-500">0 applications</p>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
