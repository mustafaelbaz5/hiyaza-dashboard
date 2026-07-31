import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";

/** Topbar: sidebar trigger, global search, theme toggle, user menu. City switcher lands in Phase 1. */
export function AppTopbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="relative max-w-sm flex-1">
        <Search className="absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="بحث..." className="pe-8" />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
