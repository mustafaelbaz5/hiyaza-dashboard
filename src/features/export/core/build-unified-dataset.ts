import type { UnifiedExportRow } from "../types";

/** The fully-merged dataset row — all edits applied by the database, ready for mapping.
 * No merge logic needed; all fields already at their latest values from the view. */
export interface UnifiedDatasetRow {
  id: string;
  cityId: string;
  personId: string | null;
  cityName: string | null;
  associationType: UnifiedExportRow["association_type"];
  associationSubtype: string | null;
  classification: UnifiedExportRow["classification"];
  shortCode: string | null;
  holderName: string | null;
  nationalId: string | null;
  ownerName: string | null;
  holdingIdNumber: string | null;
  landNumber: string | null;
  totalSqm: number | null;
  feddan: number;
  qirat: number;
  sahm: number;
  basinCode: string | null;
  basinName: string | null;
  borderEast: string | null;
  borderWest: string | null;
  borderSouth: string | null;
  borderNorth: string | null;
  soilType: string | null;
  usageType: string | null;
  cropType: string | null;
  growthStages: string | null;
  holderNameFarmerCard: string | null;
  ownerNameFarmerCard: string | null;
  notes: string | null;
}

/** Converts fully-merged view rows into the camelCase dataset shape.
 * No edit merging needed — the database already merged all edits cumulatively. */
export function buildUnifiedDataset(rows: UnifiedExportRow[]): UnifiedDatasetRow[] {
  return rows.map((row) => ({
    id: row.id,
    cityId: row.city_id,
    personId: row.person_id,
    cityName: row.city_name,
    associationType: row.association_type,
    associationSubtype: row.association_subtype,
    classification: row.classification,
    shortCode: row.short_code,
    holderName: row.holder_name,
    nationalId: row.national_id,
    ownerName: row.owner_name,
    holdingIdNumber: row.holding_id_number,
    landNumber: row.land_number,
    totalSqm: row.total_sqm,
    feddan: row.feddan,
    qirat: row.qirat,
    sahm: row.sahm,
    basinCode: row.basin_code,
    basinName: row.basin_name,
    borderEast: row.border_east,
    borderWest: row.border_west,
    borderSouth: row.border_south,
    borderNorth: row.border_north,
    soilType: row.soil_type,
    usageType: row.usage_type,
    cropType: row.crop_type,
    growthStages: row.growth_stages,
    holderNameFarmerCard: row.holder_name_farmer_card,
    ownerNameFarmerCard: row.owner_name_farmer_card,
    notes: row.notes,
  }));
}
