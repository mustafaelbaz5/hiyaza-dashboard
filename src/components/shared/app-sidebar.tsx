"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNotificationCounts } from "@/features/notifications/hooks/use-notification-counts";
import { formatNumber } from "@/lib/format";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  History,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/cities", label: "المدن", icon: Building2 },
  {
    href: "/review",
    label: "الإضافات الميدانية",
    icon: ClipboardCheck,
    badge: "pendingReviews" as const,
  },
  { href: "/audit", label: "سجل النشاط", icon: History },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/users", label: "المستخدمون", icon: Users },
  { href: "/settings", label: "الإعدادات", icon: Settings },
] as const;

/** Persistent right-side (RTL) navigation — collapsible to icons, active route highlighted. */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: counts } = useNotificationCounts();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            ه
          </span>
          <span className="group-data-[collapsible=icon]:hidden">حيازة</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
                const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                const badgeCount = "badge" in rest && counts ? counts[rest.badge] : 0;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label} size="lg">
                      <Link href={href} className="cursor-pointer">
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badgeCount > 0 ? (
                      <SidebarMenuBadge>{formatNumber(badgeCount)}</SidebarMenuBadge>
                    ) : null}
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
