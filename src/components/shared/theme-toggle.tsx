"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button";

const CYCLE = ["light", "dark", "system"] as const;

/** Cycles light → dark → system, matching the plan's topbar toggle spec. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    const current = CYCLE.includes(theme as (typeof CYCLE)[number])
      ? (theme as (typeof CYCLE)[number])
      : "system";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]!;
    setTheme(next);
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="تبديل المظهر">
      {theme === "light" && <Sun className="size-4" />}
      {theme === "dark" && <Moon className="size-4" />}
      {theme !== "light" && theme !== "dark" && <MonitorCog className="size-4" />}
    </Button>
  );
}
