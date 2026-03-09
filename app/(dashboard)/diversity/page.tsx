import PanelCard from "@/components/PanelCard";
import { PieChart, Target } from "lucide-react";
import { getAnalytics } from "@/lib/getAnalytics";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DiversityPage() {
  const analytics = await getAnalytics();
  const { data: applications } = await supabase
    .from("applications")
    .select("status, gender");

  const maleCount = analytics?.male_count ?? 0;
  const femaleCount = analytics?.female_count ?? 0;
  const otherCount = analytics?.other_count ?? 0;
  const preferNotToSayCount = analytics?.prefer_not_to_say_count ?? 0;

  type StageRow = { status?: string | null; gender?: string | null };
  const applicationRows = (applications ?? []) as StageRow[];

  function normalizeGender(gender: string | null | undefined): string {
    return String(gender ?? "").trim().toLowerCase();
  }

  function isDiverseGender(gender: string | null | undefined): boolean {
    const value = normalizeGender(gender);
    return value === "female" || value === "other" || value === "prefer not to say";
  }

  function getStageRows(status: string): StageRow[] {
    return applicationRows.filter(
      (row) => String(row.status ?? "").toLowerCase() === status
    );
  }

  const hiredRows = getStageRows("hired");
  const screeningRows = getStageRows("screening");
  const interviewRows = getStageRows("interview");

  const diverseHires = hiredRows.filter((row) => isDiverseGender(row.gender)).length;
  const diverseAtScreening = screeningRows.filter((row) => isDiverseGender(row.gender)).length;
  const diverseAtInterview = interviewRows.filter((row) => isDiverseGender(row.gender)).length;

  // Static benchmark; used as denominator for goals tracking.
  const targetDiverseHires = 40;

  // Actual Achievement = (Total Diverse Hires / Total Hires) * 100
  const totalHires = analytics?.total_hires ?? hiredRows.length;
  const actualAchievement =
    totalHires > 0
      ? Math.round((diverseHires / totalHires) * 100)
      : 0;

  // Inclusion Score = (% diverse at final interview / % diverse at initial screen) * 100
  const diverseShareAtScreening =
    screeningRows.length > 0 ? diverseAtScreening / screeningRows.length : 0;
  const diverseShareAtInterview =
    interviewRows.length > 0 ? diverseAtInterview / interviewRows.length : 0;

  const inclusionScore =
    diverseShareAtScreening > 0
      ? Math.min(100, Math.round((diverseShareAtInterview / diverseShareAtScreening) * 100))
      : 0;

  const genderLabels = [
    { label: "Male", count: maleCount },
    { label: "Female", count: femaleCount },
    { label: "Other", count: otherCount },
    { label: "Prefer not to say", count: preferNotToSayCount },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PanelCard
        title="Gender Distribution"
        icon={<PieChart className="h-4 w-4" />}
      >
        <div className="space-y-3">
          {genderLabels.map(({ label, count }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {count}
              </span>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Diversity Goals" icon={<Target className="h-4 w-4" />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Target Diverse Hires</span>
            <span className="text-sm font-semibold text-slate-900">
              {targetDiverseHires}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Actual Achievement</span>
            <span className="text-sm font-semibold text-slate-900">
              {actualAchievement}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">Inclusion Score</span>
            <span className="text-sm font-semibold text-slate-900">
              {inclusionScore}/100
            </span>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
