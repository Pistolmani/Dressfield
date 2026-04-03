import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-lg text-lg">
        <CardHeader className="text-center pb-8 pt-8">
          <Logo className="h-9 w-auto mx-auto mb-4" />
          <CardTitle className="text-4xl mb-1">შესვლა</CardTitle>
          <CardDescription className="text-lg">
            შეიყვანეთ თქვენი მონაცემები
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <LoginForm />
          <div className="mt-6 text-center text-base space-y-2">
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
