import { ImportWizard } from "@/features/import/components/import-wizard";
import { ImportHistory } from "@/features/import/components/import-history";

export default async function CityImportPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;

  return (
    <div className="space-y-8">
      <ImportWizard cityId={cityId} />
      <div>
        <h2 className="mb-3 text-lg font-semibold">سجل الاستيراد</h2>
        <ImportHistory cityId={cityId} />
      </div>
    </div>
  );
}
