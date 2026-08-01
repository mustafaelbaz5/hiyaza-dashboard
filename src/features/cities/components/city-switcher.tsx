"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCities } from "../hooks/use-cities";

/** Global city-scope switcher in the topbar — most pages are city-scoped per DASHBOARD_PLAN.md § 5.2. */
export function CitySwitcher() {
  const { data: cities, isLoading } = useCities();
  const router = useRouter();
  const pathname = usePathname();
  const activeCityId = pathname.match(/^\/cities\/([^/]+)/)?.[1];

  if (isLoading || !cities?.length) return null;

  return (
    <Select
      value={activeCityId}
      onValueChange={(cityId) => router.push(`/cities/${cityId}`)}
    >
      <SelectTrigger className="w-48" size="sm" aria-label="اختر جمعية">
        <SelectValue placeholder="اختر جمعية" />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.id}>
            {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
