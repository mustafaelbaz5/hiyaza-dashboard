"use client";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { CityStatusBadge } from "./city-status-badge";
import { AssociationTypeBadge } from "./association-type-badge";
import { CityPublishActions } from "./city-publish-actions";
import { useCity } from "../hooks/use-city";

/** City detail header: name, status badge, publish/archive lifecycle actions. */
export function CityDetailHeader({ cityId }: { cityId: string }) {
  const { data: city, isLoading, error } = useCity(cityId);

  if (isLoading) {
    return (
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  if (error || !city) {
    toast.error("تعذر تحميل بيانات الجمعية");
    return null;
  }

  return (
    <PageHeader
      title={city.name}
      description={[city.directorate, city.administration].filter(Boolean).join(" · ") || undefined}
      action={
        <div className="flex items-center gap-2">
          <CityStatusBadge status={city.status} />
          <AssociationTypeBadge type={city.associationType} subtype={city.associationSubtype} />
          <CityPublishActions city={city} />
        </div>
      }
    />
  );
}
