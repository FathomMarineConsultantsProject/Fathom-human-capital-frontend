type MetricCardProps = {
  label: string;
  value: string;
  sublabel?: string;
};

export default function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs text-gray-500">
          {sublabel}
        </p>
      )}
    </div>
  );
}
