import PanelCard from "@/components/PanelCard";

export default function DiversityPage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <PanelCard title="Gender Distribution">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>

      <PanelCard title="Diversity Goals">
        <p className="text-sm text-gray-500">No data available</p>
      </PanelCard>
    </div>
  );
}
