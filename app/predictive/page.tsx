import PanelCard from "@/components/PanelCard";
import { LineChart, AlertTriangle } from "lucide-react";

export default function PredictivePage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard title="Hiring Forecast" icon={<LineChart className="h-4 w-4" />}>
        <p className="text-sm text-slate-400">No data available</p>
      </PanelCard>

      <PanelCard
        title="Skills Gap Analysis"
        icon={<AlertTriangle className="h-4 w-4" />}
      >
        <p className="text-sm text-slate-400">No data available</p>
      </PanelCard>
    </div>
  );
}
