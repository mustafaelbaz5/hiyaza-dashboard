import { PageHeader } from "@/components/shared/page-header";
import { CitiesList } from "@/features/cities/components/cities-list";
import { CityFormDialog } from "@/features/cities/components/city-form-dialog";

export default function CitiesPage() {
  return (
    <>
      <PageHeader
        title="المدن"
        description="إدارة الجمعيات الزراعية ودورة حياتها"
        action={<CityFormDialog />}
      />
      <CitiesList />
    </>
  );
}
