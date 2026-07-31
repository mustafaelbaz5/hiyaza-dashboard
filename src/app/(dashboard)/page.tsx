import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="نظرة عامة" description="ملخص النظام عبر كل المدن" />
      <EmptyState
        title="لوحة التحليلات قيد الإنشاء"
        description="سيتم عرض إحصائيات النظام هنا في المرحلة القادمة"
      />
    </>
  );
}
