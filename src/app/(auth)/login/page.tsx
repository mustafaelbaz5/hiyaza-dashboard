import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
          <CardDescription>لوحة تحكم هيازة فايندر</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="admin@example.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" disabled />
            </div>
            <Button type="submit" className="w-full" disabled>
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
