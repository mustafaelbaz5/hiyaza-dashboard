"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseUsersRepository } from "../api/supabase-users-repository";
import { queryKeys } from "@/lib/query-keys";
import type { AppRole, InviteUserInput } from "../types";

function getUsersRepo() {
  return createSupabaseUsersRepository(createClient());
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const result = await getUsersRepo().setRole(userId, role);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const result = await getUsersRepo().setActive(userId, isActive);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InviteUserInput) => {
      const result = await getUsersRepo().invite(input);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useForceSignOut() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await getUsersRepo().forceSignOut(userId);
      if (!result.ok) throw result.error;
    },
  });
}

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await getUsersRepo().sendPasswordReset(email);
      if (!result.ok) throw result.error;
    },
  });
}
