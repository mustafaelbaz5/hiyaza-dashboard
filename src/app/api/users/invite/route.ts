import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { TABLES } from "@/lib/constants";

const inviteSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(["admin", "editor", "viewer"]),
});

/** Invites a new dashboard user via the Auth Admin API — admin role required, checked server-side. */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const parsed = inviteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const { email, displayName, role } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "فشلت الدعوة" }, { status: 500 });
  }

  const { error: roleError } = await service
    .from(TABLES.profiles)
    .update({ role, display_name: displayName })
    .eq("id", data.user.id);

  if (roleError) {
    return NextResponse.json({ error: "تم إرسال الدعوة لكن تعذر تعيين الدور" }, { status: 500 });
  }

  return NextResponse.json({ userId: data.user.id });
}
