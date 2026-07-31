import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppTopbar } from "@/components/shared/app-topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
