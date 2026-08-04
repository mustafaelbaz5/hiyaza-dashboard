import { PageHeader } from "@/components/shared/page-header";
import { CitiesList } from "@/features/cities/components/cities-list";
import { CityFormDialog } from "@/features/cities/components/city-form-dialog";
import { ExportDialog } from "@/features/export/components/export-dialog";

export default function CitiesPage() {
  return (
    <>
      <PageHeader
        title="المدن"
        description="إدارة الجمعيات الزراعية ودورة حياتها"
        action={
          <>
            <ExportDialog variant="outline" />
            <CityFormDialog />
          </>
        }
      />
      <CitiesList />
    </>
  );
}
