import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <Card className="w-full max-w-lg text-lg">
        <CardHeader className="text-center pb-8 pt-8">
          <Logo className="h-9 w-auto mx-auto mb-4" />
          <CardTitle className="text-4xl mb-1">რეგისტრაცია</CardTitle>
          <CardDescription className="text-lg">
            შექმენით ახალი ანგარიში
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <RegisterForm />
          <div className="mt-6 text-center text-base">
            <p className="text-muted-foreground">
              უკვე გაქვთ ანგარიში?{" "}
              <Link
                href="/auth/login"
                className="text-accent hover:underline"
              >
                შესვლა
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
