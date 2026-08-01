import { PageHeader } from "@/components/shared/page-header";
import { ReviewQueueTable } from "@/features/review/components/review-queue-table";

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        title="سجل الإضافات الميدانية"
        description="كل بيانات أضافها فريق الميدان — تُضاف تلقائيًا للنظام فور إرسالها، ومعروضة هنا للتدقيق"
      />
      <ReviewQueueTable />
    </>
  );
}
