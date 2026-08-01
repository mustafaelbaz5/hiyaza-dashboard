/**
 * Arabic locale formatting with Western-Arabic digits (0-9), per DASHBOARD_PLAN.md § 2 — the
 * dashboard must match what the mobile app copies to the clipboard, which uses 0-9.
 */
const AR_LATN_LOCALE = "ar-EG-u-nu-latn";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(AR_LATN_LOCALE).format(value);
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(AR_LATN_LOCALE, options ?? { dateStyle: "medium" }).format(
    new Date(value),
  );
}
