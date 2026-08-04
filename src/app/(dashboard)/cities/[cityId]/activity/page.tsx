import { CityActivityPage } from "@/features/cities/pages/city-activity-page";

interface CityActivityPageProps {
  params: Promise<{ cityId: string }>;
}

export default async function CityActivityRoute({ params }: CityActivityPageProps) {
  const { cityId } = await params;
  return <CityActivityPage cityId={cityId} />;
}
