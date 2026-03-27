import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-inter)] mb-2">
            <span className="text-accent">●</span>DRESS
            <span className="font-normal">Field</span>
          </div>
          <CardTitle className="text-xl">შესვლა</CardTitle>
          <CardDescription>
            შეიყვანეთ თქვენი მონაცემები
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-accent hover:underline block"
            >
              პაროლის აღდგენა
            </Link>
            <p className="text-muted-foreground">
              არ გაქვთ ანგარიში?{" "}
              <Link
                href="/auth/register"
                className="text-accent hover:underline"
              >
                რეგისტრაცია
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
