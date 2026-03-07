import PanelCard from "@/components/PanelCard";
import {
  Linkedin,
  Zap,
  Briefcase,
  BarChart3,
  Download,
  Target
} from "lucide-react";

export default function LinkedInPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="LinkedIn Performance"
        icon={<Linkedin className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Job Views</span>
            <span className="text-sm font-semibold text-slate-900">0</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Applications</span>
            <span className="text-sm font-semibold text-slate-900">0</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Profile Clicks</span>
            <span className="text-sm font-semibold text-slate-900">0</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Conversion Rate</span>
            <span className="text-sm font-semibold text-slate-900">0%</span>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Quick Actions" icon={<Zap className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <span>Post Job to LinkedIn</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <span>View Job Performance</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export LinkedIn Data</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Target className="h-4 w-4 text-slate-500" />
            <span>Optimize Job Targeting</span>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
