import { HoldingsTable } from "@/features/holdings/components/holdings-table";

export default async function CityHoldingsPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  return <HoldingsTable cityId={cityId} />;
}
