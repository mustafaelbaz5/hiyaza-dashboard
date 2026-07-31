"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSetCityStatus } from "../hooks/use-city-mutations";
import type { City } from "../types";

/** The Phase 5 "publish/unpublish gates what reaches the app" control, surfaced on city detail. */
export function CityPublishActions({ city }: { city: City }) {
  const setStatus = useSetCityStatus(city.id);

  function publish() {
    setStatus.mutate("published", {
      onSuccess: () => toast.success("تم نشر الجمعية — أصبحت متاحة للتطبيق"),
      onError: () => toast.error("تعذر نشر الجمعية"),
    });
  }

  function unpublish() {
    setStatus.mutate("draft", {
      onSuccess: () => toast.success("تم إلغاء نشر الجمعية"),
      onError: () => toast.error("تعذر إلغاء النشر"),
    });
  }

  function archive() {
    setStatus.mutate("archived", {
      onSuccess: () => toast.success("تم أرشفة الجمعية"),
      onError: () => toast.error("تعذر أرشفة الجمعية"),
    });
  }

  if (city.status === "archived") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {city.status === "draft" ? (
        <Button size="sm" onClick={publish} disabled={setStatus.isPending}>
          نشر
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={unpublish} disabled={setStatus.isPending}>
          إلغاء النشر
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={archive} disabled={setStatus.isPending}>
        أرشفة
      </Button>
    </div>
  );
}
