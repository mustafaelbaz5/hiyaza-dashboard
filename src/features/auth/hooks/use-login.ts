"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAuthRepository } from "../api/supabase-auth-repository";
import type { LoginInput } from "../schemas/login-schema";
import { queryKeys } from "@/lib/query-keys";

/** Signs the user in and redirects to the dashboard root on success. */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const repo = createSupabaseAuthRepository(createClient());
      const result = await repo.signInWithPassword(email, password);
      if (!result.ok) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.current });
      router.push("/");
      router.refresh();
    },
  });
}

/** Signs the user out and redirects to /login. */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const repo = createSupabaseAuthRepository(createClient());
      const result = await repo.signOut();
      if (!result.ok) throw result.error;
    },
    onSuccess: async () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
