type ListItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
};

export default function ListItem({ title, subtitle, meta }: ListItemProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-600">{subtitle}</p>}
      </div>
      {meta && <span className="ml-4 text-xs text-gray-500">{meta}</span>}
    </div>
  );
}
