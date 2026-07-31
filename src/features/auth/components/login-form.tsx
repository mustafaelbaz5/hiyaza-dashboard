"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas/login-schema";
import { useLogin } from "../hooks/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The login page's form — fetches nothing, only renders and dispatches the login mutation. */
export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginInput) {
    login.mutate(values);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" type="email" placeholder="admin@example.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      {login.isError ? (
        <p className="text-sm text-destructive">
          فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
