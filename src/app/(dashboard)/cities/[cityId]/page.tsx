import { CityDrilldownBoard } from "@/features/analytics/components/city-drilldown-board";

export default async function CityOverviewPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  return <CityDrilldownBoard cityId={cityId} />;
}
