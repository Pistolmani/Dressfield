import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-inter)] mb-2">
            <span className="text-accent">●</span>DRESS
            <span className="font-normal">Field</span>
          </div>
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
