import { CityToolsBoard } from "@/features/cities/components/city-tools-board";

export default async function CityToolsPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  return <CityToolsBoard cityId={cityId} />;
}
