import { PageHeader } from "@/components/shared/page-header";
import { UsersTable } from "@/features/users/components/users-table";
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog";

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="المستخدمون"
        description="إدارة فريق العمل — الأدوار والصلاحيات"
        action={<InviteUserDialog />}
      />
      <UsersTable />
    </>
  );
}
