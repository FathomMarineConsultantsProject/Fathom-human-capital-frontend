import PanelCard from "@/components/PanelCard";

export default function LinkedInPage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <PanelCard title="LinkedIn Performance">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>

      <PanelCard title="Quick Actions">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>
    </div>
  );
}
