import { CityTabsNav } from "@/features/cities/components/city-tabs-nav";
import { CityDetailHeader } from "@/features/cities/components/city-detail-header";

export default async function CityDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;

  return (
    <div className="space-y-4">
      <CityDetailHeader cityId={cityId} />
      <CityTabsNav cityId={cityId} />
      {children}
    </div>
  );
}
