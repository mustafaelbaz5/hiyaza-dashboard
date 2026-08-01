import { EDITABLE_FIELDS, type EditableField } from "./editable-fields";

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
}

export type EditPayload = Partial<Record<EditableField, string | number | null>>;

export interface MergedHolding extends HoldingBaseRow {
  isEdited: boolean;
  editedFields: EditableField[];
}

/**
 * Overlays a holding's imported values with its latest edit payload (a full snapshot, not a
 * diff — see holding_edits_latest in APP_PLAN.md § 6). The `holdings` row is never mutated;
 * this merge is what every reader (dashboard and app alike) does at display time.
 */
export function mergeHolding(base: HoldingBaseRow, latestEditPayload: EditPayload | null): MergedHolding {
  if (!latestEditPayload) {
    return { ...base, isEdited: false, editedFields: [] };
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

  return { ...merged, isEdited: editedFields.length > 0, editedFields };
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
