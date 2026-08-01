import type { MappedHoldingRow } from "./map-rows";

export interface HoldingInsertRecord {
  city_id: string;
  import_batch_id: string;
  holding_id_number: string | null;
  unified_number: string | null;
  holder_name: string;
  national_id: string | null;
  land_number: string | null;
  page_number: string | null;
  basin_name: string | null;
  basin_code: string | null;
  association_name: string | null;
  administration: string | null;
  directorate: string | null;
  border_east: string | null;
  border_west: string | null;
  border_south: string | null;
  border_north: string | null;
  feddan: number;
  qirat: number;
  sahm: number;
  total_sqm: number | null;
}

/** Shapes validated rows into holdings insert records — the only place that knows the DB column names. */
export function buildHoldingRecords(
  rows: MappedHoldingRow[],
  cityId: string,
  importBatchId: string,
): HoldingInsertRecord[] {
  return rows.map((row) => ({
    city_id: cityId,
    import_batch_id: importBatchId,
    holding_id_number: row.holdingIdNumber,
    unified_number: row.unifiedNumber,
    holder_name: row.holderName as string,
    national_id: row.nationalId,
    land_number: row.landNumber,
    page_number: row.pageNumber,
    basin_name: row.basinName,
    basin_code: row.basinCode,
    association_name: row.associationName,
    administration: row.administration,
    directorate: row.directorate,
    border_east: row.borderEast,
    border_west: row.borderWest,
    border_south: row.borderSouth,
    border_north: row.borderNorth,
    feddan: row.feddan,
    qirat: row.qirat,
    sahm: row.sahm,
    total_sqm: row.totalSqm,
  }));
}
