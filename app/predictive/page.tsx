import PanelCard from "@/components/PanelCard";

export default function PredictivePage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <PanelCard title="Hiring Forecast">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>

      <PanelCard title="Skills Gap Analysis">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>
    </div>
  );
}
