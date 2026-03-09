import Header from "@/components/Header";
import DashboardRealtime from "./DashboardRealtime";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-6">
        <div className="mx-auto max-w-7xl">
          <DashboardRealtime>{children}</DashboardRealtime>
        </div>
      </main>
    </div>
  );
}
