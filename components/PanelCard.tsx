type PanelCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

export default function PanelCard({ title, children, icon }: PanelCardProps) {
  return (
    <section className="flex-1 rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-slate-500">{icon}</span>}
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
