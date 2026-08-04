# Flutter Follow-Up: Data Gaps Found During Export Format Review

This report documents 3 fields in the dashboard's 25-column Excel export that are currently
either always blank or filled with a stand-in value, because the underlying data does not exist
anywhere in the schema or is never populated by the Flutter app. None of these are dashboard bugs
— the dashboard side is now exporting exactly what data is actually available. Closing these gaps
requires changes on the Flutter/data-capture side.

This is a planning document only — no code changes are proposed or should be made from this file
directly.

---

## 1. Owner's National ID (Excel column 9, "الرقم القومي للمالك")

**What's missing:** A national ID for the *owner* of a parcel, distinct from the *holder's*
national ID.

**Why it's missing:** Neither `holdings` nor `added_holdings` has an `owner_national_id` column,
and no such key exists in the Flutter edit-payload shape either (`holding_edits.payload` carries
`ownerName` but never an owner-specific national ID — see
`src/features/holdings/core/editable-fields.ts`'s payload-only-keys list). The dashboard's owner
name field (`ownerName`) already falls back to the holder's name when no distinct owner exists,
but there has never been a way to record a *different* national ID for the owner even when the
owner is a genuinely different person from the holder.

**Current dashboard behavior:** This column is always exported empty. It intentionally does not
reuse the holder's national ID as a stand-in (that was a bug in the previous version of the
export and has been removed) — an empty cell only means "no data," it never claims the owner and
holder share an ID.

**Recommended Flutter-side change:**

- Add an `ownerNationalId` field to whatever screen/form captures owner information during field
  survey (alongside the existing `ownerName` capture).
- Send it as `ownerNationalId` in the edit payload — matching the same camelCase convention every
  other editable field already uses (see `EDIT_PAYLOAD_KEY_MAP` in
  `src/features/holdings/core/editable-fields.ts` for the pattern).
- **API/DB considerations:** Once Flutter starts sending this key, the dashboard needs a matching
  `owner_national_id` column added to `holdings`/`added_holdings` (nullable text, same shape as
  `national_id`), a new entry in `EDITABLE_FIELDS`/`EDIT_PAYLOAD_KEY_MAP`, and both
  `holdings_with_merged_edits`/`added_holdings_with_merged_edits` views updated to select/coalesce
  it. This is a small, additive change once the Flutter side defines and starts sending the field
  — flagging it here so the schema work isn't started until the field's real name/shape is
  confirmed with the Flutter team.
- **Alternative:** If, in practice, the owner and holder always share one national ID (i.e. "owner"
  is really just a role label, not a distinct legal identity with its own ID), this gap can be
  closed by documentation alone — confirm this with the Flutter team before doing any schema work.

---

## 2. Farmer-Card Names (Excel columns 23–24, "اسم الحائز/المالك من كارت الفلاح")

**What's missing:** The holder's and owner's names as they appear specifically on the "بطاقة
الفلاح" (farmer card) — a distinct identity document from the field-survey name capture.

**Why it's missing:** The dashboard schema already has dedicated columns for this —
`holder_name_farmer_card` and `owner_name_farmer_card` — added in migration
`20260801200400_export_gap_columns.sql` specifically to hold this data. However, the Flutter app
has never populated them; every row in production has both columns `NULL`. There is also no
`holderNameFarmerCard`/`ownerNameFarmerCard` key in the edit-payload shape.

**Current dashboard behavior:** Since the dedicated columns are always empty, the export currently
falls back to duplicating the field-survey names (columns 10/8) into columns 23/24, as an interim
stand-in agreed for this round of fixes. This means columns 23/24 do not yet carry any information
that isn't already in columns 8/10 — they are placeholders until real farmer-card data exists.

**Recommended Flutter-side change:**

- Capture `holderNameFarmerCard` and `ownerNameFarmerCard` as their own fields during field survey
  (likely alongside a farmer-card photo/scan step, if one exists in the app's data-entry flow),
  distinct from the existing `holderName`/`ownerName` capture.
- Send them as new keys in the edit payload (`holderNameFarmerCard`, `ownerNameFarmerCard`),
  matching the camelCase convention.
- **API/DB considerations:** The destination columns already exist
  (`holder_name_farmer_card`/`owner_name_farmer_card` on both `holdings` and `added_holdings`) —
  no new migration needed for storage. What's needed: (a) Flutter starts sending the two new
  payload keys, (b) the dashboard adds both to `EDITABLE_FIELDS`/`EDIT_PAYLOAD_KEY_MAP` so edits
  to these fields are recognized, and (c) `holdings_with_merged_edits`/
  `added_holdings_with_merged_edits` already select these columns directly from the base tables
  (not yet from the edit-payload overlay) — once Flutter starts sending edits for them, those two
  views need their `coalesce(...)` treatment extended the same way every other editable field
  already works, so future corrections to these fields are reflected in the merged/export data.
- Once real data starts flowing, the dashboard's excel-mapper fallback (columns 23/24 mirroring
  8/10) can be removed so the dedicated fields are used directly.

---

## 3. Growth Stage (Excel column 22, "مراحل النمو")

**What's missing:** A recorded growth stage for the crop on a given parcel.

**Why it's missing:** The `growth_stages` column exists on both `holdings` and `added_holdings`
(added in the same `20260801200400_export_gap_columns.sql` migration as the farmer-card columns
above), but the Flutter app has never populated it, and no default value has been agreed upon
anywhere in the project. Every row in production has this column `NULL` today.

**Current dashboard behavior:** This column is exported empty when the underlying data is
missing — no placeholder or default is applied, since none has been agreed upon.

**Recommended Flutter-side change:**

- Confirm whether this is intended to be free text or a fixed enum of stages (e.g. "إنبات",
  "نمو خضري", "إزهار", "نضج", etc. — exact domain to be defined by the agricultural/field team,
  not assumed here).
- Once the domain is defined, capture it during field survey and send it as `growthStages` in the
  edit payload (camelCase, matching convention).
- **API/DB considerations:** Same pattern as above — the storage column already exists; adding
  `growth_stages` to `EDITABLE_FIELDS`/`EDIT_PAYLOAD_KEY_MAP` and extending the merged-edits views'
  `coalesce(...)` logic is what's needed once Flutter starts sending real values. If a fixed enum
  is chosen, consider whether it should be validated at the database level (a Postgres enum type,
  similar to `city_classification`) rather than left as free text.
- If this field is genuinely out of scope for the foreseeable future, it should be formally
  deprioritized so it isn't repeatedly re-flagged in future export reviews.

---

## Summary Table

| Column | Field                   | Blocking gap                                                 | Stand-in behavior today                |
| ------ | ----------------------- | ------------------------------------------------------------ | -------------------------------------- |
| 9      | Owner National ID       | No field exists anywhere (schema or payload)                 | Always empty                           |
| 23     | Farmer Card Holder Name | Column exists, never populated by Flutter                    | Falls back to field-survey holder name |
| 24     | Farmer Card Owner Name  | Column exists, never populated by Flutter                    | Falls back to field-survey owner name  |
| 22     | Growth Stage            | Column exists, never populated by Flutter, no agreed default | Always empty                           |

All four gaps follow the same closure pattern already used for every other editable field in this
system: Flutter defines and sends a new camelCase payload key → dashboard adds it to
`EDITABLE_FIELDS`/`EDIT_PAYLOAD_KEY_MAP` → the relevant merged-edits SQL view's `coalesce(...)`
list is extended → the export mapper's fallback logic is removed once real data is confirmed
flowing.
