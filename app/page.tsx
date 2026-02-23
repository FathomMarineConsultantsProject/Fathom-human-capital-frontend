import MetricCard from "@/components/MetricCard";
import PanelCard from "@/components/PanelCard";

const metrics = [
  { label: "Active Jobs", value: "0" },
  { label: "Total Applications", value: "0" },
  { label: "Avg Time to Hire", value: "0" },
  { label: "Cost per Hire", value: "₹0" }
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="flex flex-col gap-6 lg:flex-row">
        <PanelCard title="Recent Job Postings">
          <p className="text-sm text-gray-500">No data available</p>
        </PanelCard>
        <PanelCard title="Recent Applications">
          <p className="text-sm text-gray-500">No data available</p>
        </PanelCard>
      </section>
    </div>
  );
}
