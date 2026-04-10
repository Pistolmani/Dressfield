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

const loginSchema = z.object({
  email: z.email("ელ-ფოსტის ფორმატი არასწორია"),
  password: z.string().min(1, "პაროლი აუცილებელია"),
});

type LoginForm = z.infer<typeof loginSchema>;

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
    <div className="space-y-5">
      {/* Google Sign-In */}
      <div className="flex justify-center">
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

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">ან</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          ელ-ფოსტა
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@mail.com"
          className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          პაროლი
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-sm font-bold rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground mt-1 shadow-md hover:shadow-lg transition-all"
        disabled={loading || googleLoading}
      >
        {loading ? "იტვირთება..." : "შესვლა"}
      </Button>
    </form>
    </div>
  );
}
