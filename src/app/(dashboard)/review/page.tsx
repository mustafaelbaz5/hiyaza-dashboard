import { PageHeader } from "@/components/shared/page-header";
import { ReviewQueueTable } from "@/features/review/components/review-queue-table";

export default function ReviewPage() {
  return (
    <>
      <PageHeader title="المراجعة" description="مراجعة البيانات المضافة من فريق الميدان" />
      <ReviewQueueTable />
    </>
  );
}
