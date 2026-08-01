import { NextResponse } from "next/server";
import { readWorkbook } from "@/features/import/core/read-workbook";
import { locateHeaderRow } from "@/features/import/core/locate-header-row";
import { mapRows } from "@/features/import/core/map-rows";
import { validateRows } from "@/features/import/core/validate-rows";
import { checkParcelCounts } from "@/features/import/core/check-parcel-counts";
import { buildPreviewSummary } from "@/features/import/core/preview-summary";
import { buildHoldingRecords } from "@/features/import/core/build-holding-records";
import { computeDedupKey } from "@/features/import/core/dedup-key";
import { DEFAULT_COLUMN_MAPPING, isSkippableSheet } from "@/features/import/core/column-mapping";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

/**
 * Server-only Excel parse pipeline (DASHBOARD_PLAN.md § 2/6.3): upload -> readWorkbook ->
 * locateHeaderRow -> mapRows -> validateRows -> previewSummary. Nothing is written to
 * `holdings` here — that only happens after the user confirms via the commit RPC. Every row
 * with any real data is included; only entirely-blank spreadsheet rows are set aside.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const cityId = formData.get("cityId");

  if (!(file instanceof File) || typeof cityId !== "string" || !cityId) {
    return NextResponse.json({ error: "الملف أو معرف الجمعية مفقود" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existingRows, error: existingError } = await supabase
    .from(TABLES.holdings)
    .select("unified_number, holder_name, national_id, land_number, page_number, basin_code, basin_name")
    .eq("city_id", cityId)
    .eq("is_stale", false);

  if (existingError) {
    return NextResponse.json({ error: "تعذر قراءة البيانات الحالية للجمعية" }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbookResult = readWorkbook(buffer);
  if (!workbookResult.ok) {
    return NextResponse.json({ error: workbookResult.error }, { status: 422 });
  }

  const mapping = DEFAULT_COLUMN_MAPPING;
  const dataSheet = workbookResult.value.sheets.find((s) => s.name === mapping.dataSheetName);
  if (!dataSheet) {
    return NextResponse.json(
      { error: `الورقة "${mapping.dataSheetName}" غير موجودة في الملف` },
      { status: 422 },
    );
  }

  const skippedSheets = workbookResult.value.sheets
    .filter((s) => isSkippableSheet(s.name, mapping))
    .map((s) => ({ name: s.name, reason: "عرض مكرر مفلتر لنفس البيانات — تم تجاهلها" }));

  const headerResult = locateHeaderRow(dataSheet.rows, mapping);
  if (!headerResult.ok) {
    return NextResponse.json({ error: headerResult.error }, { status: 422 });
  }

  const mapped = mapRows(dataSheet.rows, headerResult.value, mapping);
  const { valid, blank } = validateRows(mapped);
  const parcelMismatches = checkParcelCounts(valid);

  const existingDedupKeys = new Set(
    (existingRows ?? []).map((r) =>
      computeDedupKey({
        unifiedNumber: r.unified_number,
        holderName: r.holder_name,
        nationalId: r.national_id,
        landNumber: r.land_number,
        pageNumber: r.page_number,
        basinCode: r.basin_code,
        basinName: r.basin_name,
      }),
    ),
  );
  const preview = buildPreviewSummary(valid, blank, mapped.length, skippedSheets, existingDedupKeys);

  const records = buildHoldingRecords(valid, cityId);

  return NextResponse.json({
    preview,
    parcelMismatches,
    records,
    mappingUsed: mapping.fields,
  });
}
