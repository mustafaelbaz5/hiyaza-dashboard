import { z } from "zod";

export const inviteFormSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صالح"),
  displayName: z.string().min(1, "الاسم مطلوب"),
  role: z.enum(["admin", "editor", "viewer"]),
});

export type InviteFormInput = z.infer<typeof inviteFormSchema>;
