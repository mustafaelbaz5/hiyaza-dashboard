import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  isLoading?: boolean;
}

/** Single-metric tile used across analytics boards — one visual language for every KPI. */
export function StatCard({ label, value, icon: Icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend ? (
          <p
            className={cn(
              "mt-1 text-xs",
              trend.direction === "up" && "text-primary",
              trend.direction === "down" && "text-destructive",
              trend.direction === "flat" && "text-muted-foreground",
            )}
          >
            {trend.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
