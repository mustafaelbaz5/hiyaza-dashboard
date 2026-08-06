import { EDITABLE_FIELDS, EDIT_PAYLOAD_KEY_MAP, type EditableField } from "./editable-fields";

export interface HoldingBaseRow {
  id: string;
  city_id: string;
  holding_id_number: string | null;
  unified_number: string | null;
  holder_name: string | null;
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
  is_stale: boolean;
  imported_at: string;
  credit_type: string;
  reform_type: string | null;
  usage_type: string;
  crop_type: string | null;
  owner_name: string | null;
  growth_stages: string | null;
  is_delegate: boolean;
  is_inheritance: boolean;
  notes: string | null;
  soil_type: string | null;
}

export type EditPayload = Partial<Record<EditableField, string | number | null>>;

/**
 * Translates a raw `holding_edits.payload` row (camelCase, written by the Flutter app) into an
 * EditPayload keyed by this dashboard's snake_case EditableField names, via EDIT_PAYLOAD_KEY_MAP.
 * Every reader of a raw payload — mergeHolding's caller, the audit diff view — must go through
 * this first; reading the raw payload directly with snake_case keys finds nothing.
 */
export function normalizeEditPayload(rawPayload: Record<string, unknown> | null): EditPayload | null {
  if (!rawPayload) return null;

  const normalized: EditPayload = {};
  for (const field of EDITABLE_FIELDS) {
    const rawKey = EDIT_PAYLOAD_KEY_MAP[field];
    if (rawKey in rawPayload) {
      normalized[field] = rawPayload[rawKey] as string | number | null;
    }
  }
  return normalized;
}

/**
 * Where a holding row originated:
 * - "original": imported, never edited.
 * - "modified": imported, has at least one edit in holding_edits.
 * - "added": promoted from added_holdings (a field-added record), regardless of edit state.
 */
export type HoldingProvenance = "original" | "modified" | "added";

export interface MergedHolding extends HoldingBaseRow {
  isEdited: boolean;
  editedFields: EditableField[];
  provenance: HoldingProvenance;
}

/**
 * Overlays a holding's imported values with its latest edit payload (a full snapshot, not a
 * diff — see holding_edits_latest in APP_PLAN.md § 6). The `holdings` row is never mutated;
 * this merge is what every reader (dashboard and app alike) does at display time.
 *
 * `isPromoted` reflects whether this holding's id appears as an `added_holdings.promoted_holding_id`
 * — the same lineage signal the review feature already reads (see supabase-review-repository.ts) —
 * and takes precedence over the edited/unedited distinction for provenance purposes.
 */
export function mergeHolding(
  base: HoldingBaseRow,
  latestEditPayload: EditPayload | null,
  isPromoted = false,
): MergedHolding {
  if (!latestEditPayload) {
    return { ...base, isEdited: false, editedFields: [], provenance: isPromoted ? "added" : "original" };
  }

  const editedFields: EditableField[] = [];
  const merged: HoldingBaseRow = { ...base };

  for (const field of EDITABLE_FIELDS) {
    if (field in latestEditPayload) {
      const value = latestEditPayload[field];
      if (value !== base[field]) {
        editedFields.push(field);
      }
      (merged as unknown as Record<EditableField, string | number | null>)[field] = value ?? null;
    }
  }

  const isEdited = editedFields.length > 0;
  const provenance: HoldingProvenance = isPromoted ? "added" : isEdited ? "modified" : "original";
  return { ...merged, isEdited, editedFields, provenance };
}

/** Builds the full-snapshot payload for a new edit: current effective values with one field changed. */
export function buildEditPayload(
  current: MergedHolding,
  field: EditableField,
  newValue: string | number | null,
): EditPayload {
  const payload: EditPayload = {};
  for (const f of EDITABLE_FIELDS) {
    payload[f] = current[f];
  }
  payload[field] = newValue;
  return payload;
}
