"use client";

import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentProfile } from "@/features/auth/hooks/use-current-profile";
import { useSignOut } from "@/features/auth/hooks/use-login";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  editor: "محرر",
  viewer: "مشاهد",
  field: "ميداني",
};

/** Account menu: shows the signed-in profile and dispatches real sign-out. */
export function UserMenu() {
  const { data: profile } = useCurrentProfile();
  const signOut = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="قائمة الحساب">
          <Avatar className="size-8">
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-medium">{profile?.displayName ?? profile?.email ?? "الحساب"}</p>
          {profile ? (
            <p className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut.mutate()} disabled={signOut.isPending}>
          <LogOut />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
