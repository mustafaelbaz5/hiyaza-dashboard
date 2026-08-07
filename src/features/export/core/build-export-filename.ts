import type { UnifiedExportRow } from "../types";

/** Windows/macOS forbid these characters in filenames — strip them from a city name before
 *  using it as a filename segment. */
function sanitizeForFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").trim();
}

/**
 * `<city-name>-<YYYY-MM-DD>.xlsx` when the export is scoped to exactly one city (derived from
 * the actual exported rows, not the filter selection — reflects what's really in the file even
 * if a filter matched only one city's data incidentally). Falls back to a generic name when the
 * export spans multiple cities or the city name is unexpectedly missing.
 */
export function buildExportFilename(rows: UnifiedExportRow[], today: Date = new Date()): string {
  const date = today.toISOString().split("T")[0];
  const cityNames = new Set(rows.map((r) => r.city_name).filter((n): n is string => Boolean(n)));

  if (cityNames.size === 1) {
    const [cityName] = cityNames;
    const safeName = sanitizeForFilename(cityName!);
    if (safeName) return `${safeName}-${date}.xlsx`;
  }

  return `holdings-export-${date}.xlsx`;
}
