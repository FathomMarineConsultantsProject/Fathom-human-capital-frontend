type PanelCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function PanelCard({ title, children }: PanelCardProps) {
  return (
    <section className="flex-1 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
