"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemOverviewBoard } from "./system-overview-board";
import { QualityBoard } from "./quality-board";
import { TeamActivityBoard } from "./team-activity-board";

/** Tabbed container for the three cross-city boards (per-city drilldown lives on the city page). */
export function AnalyticsTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="quality">الجودة</TabsTrigger>
        <TabsTrigger value="team">نشاط الفريق</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-4">
        <SystemOverviewBoard />
      </TabsContent>
      <TabsContent value="quality" className="pt-4">
        <QualityBoard />
      </TabsContent>
      <TabsContent value="team" className="pt-4">
        <TeamActivityBoard />
      </TabsContent>
    </Tabs>
  );
}
