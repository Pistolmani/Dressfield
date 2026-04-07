import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "შესვლა — DressField",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col items-center justify-center p-12 overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.06)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04)_0%,_transparent_60%)]" />

        {/* Decorative blurred circles */}
        <div className="absolute top-[-80px] left-[-80px] h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <Logo className="h-10 w-auto mx-auto mb-8 brightness-0 invert" />
          <blockquote className="text-white/80 text-xl font-medium leading-relaxed italic">
            &ldquo;ქართული ხელოვნება, შენი სტილით.&rdquo;
          </blockquote>
          <p className="mt-4 text-white/40 text-sm">
            ინდივიდუალური ნაქარგები, შენი ხედვით.
          </p>
        </div>

        {/* Bottom brand mark */}
        <div className="absolute bottom-6 text-white/20 text-xs tracking-widest uppercase">
          dressfield.ge
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-10 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Logo className="h-8 w-auto mx-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              შესვლა
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              შეიყვანეთ თქვენი ანგარიშის მონაცემები
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 space-y-3 text-sm text-center">
            <Link
              href="/auth/forgot-password"
              className="block text-accent hover:underline underline-offset-2 font-medium"
            >
              პაროლი დაგავიწყდა?
            </Link>
            <p className="text-gray-500">
              არ გაქვთ ანგარიში?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-accent hover:underline underline-offset-2"
              >
                დარეგისტრირდი
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
