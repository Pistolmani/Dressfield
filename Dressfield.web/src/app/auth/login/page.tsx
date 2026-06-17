import { LoginForm } from "@/components/auth/login-form";
import { InteractiveThreads } from "@/components/auth/interactive-threads";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "შესვლა — DressField",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-50 relative overflow-hidden">
      {/* Interactive background simulation simulating weaving threads */}
      <InteractiveThreads />

      {/* Glassmorphic animated Login Card */}
      <LoginForm />
    </div>
  );
}
