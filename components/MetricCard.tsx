type MetricCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ReactNode;
};

export default function MetricCard({
  label,
  value,
  sublabel,
  icon
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-500">{icon}</span>}
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-500">
          {sublabel}
        </p>
      )}
    </div>
  );
}
