import { PageHeader } from "@/components/shared/page-header";
import { SystemOverviewBoard } from "@/features/analytics/components/system-overview-board";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="نظرة عامة" description="ملخص النظام عبر كل المدن" />
      <SystemOverviewBoard />
    </>
  );
}
