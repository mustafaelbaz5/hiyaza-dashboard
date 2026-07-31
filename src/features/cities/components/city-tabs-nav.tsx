"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "", label: "نظرة عامة" },
  { segment: "holdings", label: "الحيازات" },
  { segment: "import", label: "الاستيراد" },
  { segment: "quality", label: "الجودة" },
] as const;

/** Tab navigation across the city detail sub-routes — each tab is a real route, not client state. */
export function CityTabsNav({ cityId }: { cityId: string }) {
  const pathname = usePathname();
  const base = `/cities/${cityId}`;

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
