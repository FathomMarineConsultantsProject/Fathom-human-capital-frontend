import PanelCard from "@/components/PanelCard";
import { Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function SourcingPage() {
  const { data: jobs } = await supabase.from("jobs").select("*");
  const { data: applications } = await supabase.from("applications").select("*");

  const jobList = jobs ?? [];
  const applicationList = applications ?? [];

  const sourceCounts = applicationList.reduce(
    (acc: Record<string, number>, app: any) => {
      const source = app.source as string | null;
      if (!source) return acc;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sources = [
    { label: "LinkedIn", key: "LinkedIn" },
    { label: "Job Board", key: "Job Board" },
    { label: "Referral", key: "Referral" },
    { label: "Company", key: "Company Website" },
    { label: "Agency", key: "Agency" },
    { label: "Other", key: "Other" }
  ];

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
                {String(sourceCounts[source.key] ?? 0)}
              </p>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
