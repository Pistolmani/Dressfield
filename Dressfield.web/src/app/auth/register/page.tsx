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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="h-7 w-auto mx-auto mb-2" />
          <CardTitle className="text-xl">რეგისტრაცია</CardTitle>
          <CardDescription>
            შექმენით ახალი ანგარიში
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
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
