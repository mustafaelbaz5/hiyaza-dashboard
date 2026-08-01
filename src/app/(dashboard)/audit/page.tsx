import { PageHeader } from "@/components/shared/page-header";
import { AuditPageContent } from "@/features/audit/components/audit-page-content";

export default function AuditPage() {
  return (
    <>
      <PageHeader title="سجل النشاط" description="من غيّر ماذا، ومتى — عبر كل المدن والمستخدمين" />
      <AuditPageContent />
    </>
  );
}
