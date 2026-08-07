import { PageHeader } from "@/components/shared/page-header";
import { SystemOverviewBoard } from "@/features/analytics/components/system-overview-board";
import { RecentActivityWidget } from "@/features/analytics/components/recent-activity-widget";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="نظرة عامة" description="ملخص النظام عبر كل المدن" />
      <SystemOverviewBoard />
      <RecentActivityWidget />
    </div>
  );
}
