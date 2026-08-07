import { PageHeader } from "@/components/shared/page-header";
import { SettingsCitiesTable } from "@/features/cities/components/settings-cities-table";
import { AssociationTypesTable } from "@/features/association-types/components/association-types-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="الإعدادات"
        description="إدارة الجمعيات — الأرشفة أو الحذف النهائي"
      />
      <SettingsCitiesTable />

      <Card>
        <CardHeader>
          <CardTitle>أنواع الجمعيات</CardTitle>
          <CardDescription>
            إدارة قائمة أنواع الجمعيات المتاحة عند إنشاء أو تعديل جمعية — إضافة نوع جديد هنا يجعله
            متاحًا فورًا بدون الحاجة لنشر تحديث.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssociationTypesTable />
        </CardContent>
      </Card>
    </div>
  );
}
