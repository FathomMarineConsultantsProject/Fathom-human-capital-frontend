import PanelCard from "@/components/PanelCard";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <PanelCard title="Key Recruitment Metrics">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>

      <PanelCard title="Source Effectiveness">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>
    </div>
  );
}
