import { z } from "zod";

export const cityFormSchema = z.object({
  name: z.string().min(2, "اسم الجمعية مطلوب"),
  administration: z.string().optional(),
  directorate: z.string().optional(),
});

export type CityFormInput = z.infer<typeof cityFormSchema>;
