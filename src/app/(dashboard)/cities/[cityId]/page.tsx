import { CityOverviewStats } from "@/features/cities/components/city-overview-stats";

export default async function CityOverviewPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  return <CityOverviewStats cityId={cityId} />;
}
