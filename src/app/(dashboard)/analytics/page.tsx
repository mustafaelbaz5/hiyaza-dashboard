import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsTabs } from "@/features/analytics/components/analytics-tabs";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="التحليلات" description="جودة البيانات ونشاط الفريق عبر كل الجمعيات" />
      <AnalyticsTabs />
    </>
  );
}
