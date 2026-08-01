import { QualityBoard } from "@/features/analytics/components/quality-board";

export default async function CityQualityPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  return <QualityBoard cityId={cityId} />;
}
