import { z } from "zod";
import { ASSOCIATION_SUBTYPES, ASSOCIATION_TYPE } from "@/lib/constants";

const associationTypeValues = [
  ASSOCIATION_TYPE.agriculturalCredit,
  ASSOCIATION_TYPE.agriculturalReform,
] as const;

/** Shared by create and edit: association type must be paired with a subtype valid for that type. */
function validateAssociationSubtype(
  values: { associationType?: string; associationSubtype?: string },
  ctx: z.RefinementCtx,
) {
  if (!values.associationSubtype) return;
  const type = values.associationType as (typeof associationTypeValues)[number] | undefined;
  if (!type) {
    ctx.addIssue({ code: "custom", path: ["associationSubtype"], message: "اختر نوع الجمعية أولًا" });
    return;
  }
  if (!ASSOCIATION_SUBTYPES[type].includes(values.associationSubtype)) {
    ctx.addIssue({ code: "custom", path: ["associationSubtype"], message: "قيمة غير صالحة لهذا النوع" });
  }
}

export const cityFormSchema = z
  .object({
    name: z.string().min(2, "اسم الجمعية مطلوب"),
    administration: z.string().optional(),
    directorate: z.string().optional(),
    associationType: z.union([z.enum(associationTypeValues), z.literal("")]).optional(),
    associationSubtype: z.string().optional(),
  })
  .superRefine(validateAssociationSubtype);

export type CityFormInput = z.infer<typeof cityFormSchema>;

/** Rename + association type/subtype — the two "edit an existing city's metadata" surfaces. */
export const cityEditSchema = z
  .object({
    name: z.string().min(2, "اسم الجمعية مطلوب"),
    administration: z.string().optional(),
    directorate: z.string().optional(),
    associationType: z.union([z.enum(associationTypeValues), z.literal("")]).optional(),
    associationSubtype: z.string().optional(),
  })
  .superRefine(validateAssociationSubtype);

export type CityEditInput = z.infer<typeof cityEditSchema>;
