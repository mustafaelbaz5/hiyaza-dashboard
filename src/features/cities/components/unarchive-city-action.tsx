"use client";

import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetCityStatus } from "../hooks/use-city-mutations";
import type { City } from "../types";

/**
 * Restores an archived city to draft (not directly published) — a city was presumably archived
 * for a reason, so re-exposing it to the field app should still require the normal draft ->
 * published step, not happen automatically the instant "restore" is clicked.
 */
export function UnarchiveCityAction({ city }: { city: City }) {
  const setStatus = useSetCityStatus(city.id);
  if (city.status !== "archived") return null;

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={setStatus.isPending}
      onClick={() =>
        setStatus.mutate("draft", {
          onSuccess: () => toast.success("تم استعادة الجمعية كمسودة"),
          onError: () => toast.error("تعذر استعادة الجمعية"),
        })
      }
    >
      <RotateCcw />
      استعادة
    </Button>
  );
}
