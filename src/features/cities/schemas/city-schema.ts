import { z } from "zod";
import { ASSOCIATION_SUBTYPES, ASSOCIATION_TYPE } from "@/lib/constants";

export const cityFormSchema = z.object({
  name: z.string().min(2, "اسم الجمعية مطلوب"),
  administration: z.string().optional(),
  directorate: z.string().optional(),
});

export type CityFormInput = z.infer<typeof cityFormSchema>;

const associationTypeValues = [
  ASSOCIATION_TYPE.agriculturalCredit,
  ASSOCIATION_TYPE.agriculturalReform,
] as const;

/** Rename + association type/subtype — the two "edit an existing city's metadata" surfaces. */
export const cityEditSchema = z
  .object({
    name: z.string().min(2, "اسم الجمعية مطلوب"),
    administration: z.string().optional(),
    directorate: z.string().optional(),
    associationType: z.union([z.enum(associationTypeValues), z.literal("")]).optional(),
    associationSubtype: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.associationSubtype) return;
    const type = values.associationType;
    if (!type) {
      ctx.addIssue({
        code: "custom",
        path: ["associationSubtype"],
        message: "اختر نوع الجمعية أولًا",
      });
      return;
    }
    const allowed = ASSOCIATION_SUBTYPES[type];
    if (!allowed.includes(values.associationSubtype)) {
      ctx.addIssue({
        code: "custom",
        path: ["associationSubtype"],
        message: "قيمة غير صالحة لهذا النوع",
      });
    }
  });

export type CityEditInput = z.infer<typeof cityEditSchema>;
