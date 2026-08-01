import { z } from "zod";

const rejectionSchema = z.object({ row: z.number(), column: z.string(), reason: z.string() });
const skippedSheetSchema = z.object({ name: z.string(), reason: z.string() });
const parcelMismatchSchema = z.object({
  holdingIdNumber: z.string(),
  expected: z.number(),
  actual: z.number(),
});

/** Parses the untrusted /api/import/preview response before use — a trust boundary crossing. */
export const previewResponseSchema = z.object({
  preview: z.object({
    rowsFound: z.number(),
    rowsValid: z.number(),
    rowsRejected: z.number(),
    rejections: z.array(rejectionSchema),
    skippedSheets: z.array(skippedSheetSchema),
    detectedAssociationName: z.string().nullable(),
    detectedBasins: z.array(z.string()),
    diff: z.object({
      newCount: z.number(),
      changedCount: z.number(),
      removedCount: z.number(),
    }),
  }),
  parcelMismatches: z.array(parcelMismatchSchema),
  records: z.array(z.record(z.string(), z.unknown())),
  mappingUsed: z.record(z.string(), z.string()),
});

export type PreviewResponse = z.infer<typeof previewResponseSchema>;
