"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { motion, Variants } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

const loginSchema = z.object({
  email: z.email("ელ-ფოსტის ფორმატი არასწორია"),
  password: z.string().min(1, "პაროლი აუცილებელია"),
});

type LoginForm = z.infer<typeof loginSchema>;

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.85, rotate: -3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 16,
      stiffness: 60,
      mass: 1,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 14,
      stiffness: 85,
    },
  },
};

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success("წარმატებით შეხვედით");
      router.push("/");
    } catch {
      toast.error("Google-ით შესვლა ვერ მოხერხდა");
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("წარმატებით შეხვედით");
      router.push("/");
    } catch {
      toast.error("ელ-ფოსტა ან პაროლი არასწორია");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md panel-surface p-6 sm:p-10 relative overflow-hidden"
    >
      {/* Subtle backdrop glows inside the card */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-slate-100/50 blur-xl pointer-events-none -z-10" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-slate-100/50 blur-lg pointer-events-none -z-10" />

      {/* Header section with brand Logo and slogan */}
      <div className="text-center mb-8">
        <motion.div variants={itemVariants} className="flex justify-center mb-4.5">
          <Logo className="h-9 w-auto text-accent" />
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-2xl font-extrabold text-gray-900 tracking-tight"
        >
          შესვლა
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-2 text-[10px] sm:text-[11px] text-slate-400 font-bold tracking-widest uppercase"
        >
          &ldquo;აქციე რეალობად შენი დიზაინი&rdquo;
        </motion.p>
      </div>

      <div className="space-y-5">
        {/* Google Sign-In */}
        <motion.div variants={itemVariants} className="flex justify-center w-full max-w-[360px] mx-auto">
          <div className="w-full flex justify-center hover:scale-[1.01] transition-transform active:scale-[0.99]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google-ით შესვლა ვერ მოხერხდა")}
              theme="outline"
              size="large"
              text="signin_with"
              width="360"
              useOneTap={false}
            />
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-200/80" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ან</span>
          <div className="flex-1 h-px bg-gray-200/80" />
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input field */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ელ-ფოსტა
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm outline-none shadow-sm px-4"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
            )}
          </motion.div>

          {/* Password input field */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              პაროლი
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all text-sm outline-none shadow-sm px-4"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current loading-dot" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current loading-dot" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current loading-dot" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                "შესვლა"
              )}
            </Button>
          </motion.div>
        </form>

        {/* Footer Link Options */}
        <motion.div variants={itemVariants} className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2.5 text-xs text-center">
          <Link
            href="/auth/forgot-password"
            className="text-accent hover:text-accent-hover font-semibold transition-colors hover:underline underline-offset-2"
          >
            პაროლი დაგავიწყდა?
          </Link>
          <p className="text-gray-400 font-medium">
            არ გაქვთ ანგარიში?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-accent hover:text-accent-hover transition-colors hover:underline underline-offset-2"
            >
              დარეგისტრირდი
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
