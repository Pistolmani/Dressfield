import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/ui/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "რეგისტრაცია — DressField",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.06)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04)_0%,_transparent_60%)]" />

        <div className="absolute top-[-80px] left-[-80px] h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <Logo className="h-10 w-auto mx-auto mb-8 brightness-0 invert" />
          <blockquote className="text-white/80 text-xl font-medium leading-relaxed italic">
            &ldquo;შექმენი შენი უნიკალური სტილი.&rdquo;
          </blockquote>
          <p className="mt-4 text-white/40 text-sm">
            დარეგისტრირდი და შეუკვეთე ნაქარგები.
          </p>
        </div>

        <div className="absolute bottom-6 text-white/20 text-xs tracking-widest uppercase">
          dressfield.ge
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-10 bg-white">
        <div className="lg:hidden mb-8">
          <Logo className="h-8 w-auto mx-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              ანგარიშის შექმნა
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              შეავსეთ ფორმა და დარეგისტრირდით
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-sm text-center">
            <p className="text-gray-500">
              უკვე გაქვთ ანგარიში?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-accent hover:underline underline-offset-2"
              >
                შესვლა
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
