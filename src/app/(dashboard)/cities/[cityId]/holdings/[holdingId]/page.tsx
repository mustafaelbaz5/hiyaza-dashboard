import { HoldingDetail } from "@/features/holdings/components/holding-detail";

export default async function HoldingDetailPage({
  params,
}: {
  params: Promise<{ cityId: string; holdingId: string }>;
}) {
  const { cityId, holdingId } = await params;
  return <HoldingDetail holdingId={holdingId} cityId={cityId} />;
}
