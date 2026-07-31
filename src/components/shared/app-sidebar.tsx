"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  History,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/cities", label: "المدن", icon: Building2 },
  { href: "/review", label: "المراجعة", icon: ClipboardCheck },
  { href: "/audit", label: "سجل النشاط", icon: History },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/users", label: "المستخدمون", icon: Users },
  { href: "/settings", label: "الإعدادات", icon: Settings },
] as const;

/** Persistent right-side (RTL) navigation — collapsible to icons, active route highlighted. */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            ه
          </span>
          <span className="group-data-[collapsible=icon]:hidden">هيازة فايندر</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
