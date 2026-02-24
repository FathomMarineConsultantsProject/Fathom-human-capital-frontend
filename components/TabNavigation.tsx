"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Overview" },
  { href: "/analytics", label: "Analytics" },
  { href: "/sourcing", label: "Sourcing" },
  { href: "/diversity", label: "Diversity" },
  { href: "/predictive", label: "Predictive" },
  { href: "/linkedin", label: "LinkedIn" }
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-2">
      <div className="rounded-xl bg-slate-100 p-1">
        <ul className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm font-medium"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
