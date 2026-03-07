"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ConditionalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isApplyPage = pathname?.startsWith("/apply");

  if (isApplyPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-6 py-4">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
