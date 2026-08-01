import { PageHeader } from "@/components/shared/page-header";
import { SettingsCitiesTable } from "@/features/cities/components/settings-cities-table";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="الإعدادات"
        description="إدارة الجمعيات — الأرشفة أو الحذف النهائي"
      />
      <SettingsCitiesTable />
    </>
  );
}
