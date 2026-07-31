import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
          <CardDescription>لوحة تحكم هيازة فايندر</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
