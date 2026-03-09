import PanelCard from "@/components/PanelCard";
import { Globe } from "lucide-react";
import { getAnalytics } from "@/lib/getAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SourcingPage() {
  const analytics = await getAnalytics();

  const sources = [
    { label: "LinkedIn", count: analytics?.linkedin_count ?? 0 },
    { label: "Job Board", count: analytics?.jobboard_count ?? 0 },
    { label: "Referral", count: analytics?.referral_count ?? 0 },
    { label: "Company Website", count: analytics?.company_count ?? 0 },
    { label: "Agency", count: analytics?.agency_count ?? 0 },
  ];

  const hasAnySource = sources.some((s) => s.count > 0);

  return (
    <div className="w-full">
      <PanelCard
        title="Sourcing Channels"
        icon={<Globe className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!hasAnySource ? (
            <p className="col-span-full text-sm text-slate-400">
              No sourcing data yet. Applications will appear here.
            </p>
          ) : (
            sources.map(({ label, count }) => (
              <div
                key={label}
                className="flex min-h-[100px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-600">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {count}
                </p>
              </div>
            ))
          )}
        </div>
      </PanelCard>
    </div>
  );
}
