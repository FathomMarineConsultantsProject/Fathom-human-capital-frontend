import PanelCard from "@/components/PanelCard";
import { Globe } from "lucide-react";

const sources = [
  { label: "LinkedIn", value: "0" },
  { label: "Job Board", value: "0" },
  { label: "Referral", value: "0" },
  { label: "Company", value: "0" },
  { label: "Agency", value: "0" },
  { label: "Other", value: "0" }
];

export default function SourcingPage() {
  return (
    <div className="w-full">
      <PanelCard
        title="Sourcing Channels"
        icon={<Globe className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <div
              key={source.label}
              className="flex min-h-[100px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-600">{source.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {source.value}
              </p>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
