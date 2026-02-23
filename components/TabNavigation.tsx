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
    <nav className="mt-6 border-b border-gray-200">
      <ul className="-mb-px flex flex-wrap gap-4">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
