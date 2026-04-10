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
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "სახელი მინიმუმ 2 სიმბოლო"),
    lastName: z.string().min(2, "გვარი მინიმუმ 2 სიმბოლო"),
    email: z.email("ელ-ფოსტის ფორმატი არასწორია"),
    phone: z
      .string()
      .regex(/^\+995\s?5\d{2}\s?\d{3}\s?\d{3}$/, "ფორმატი: +995 5XX XXX XXX")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "პაროლი მინიმუმ 8 სიმბოლო")
      .regex(/[A-Z]/, "უნდა შეიცავდეს დიდ ასოს")
      .regex(/[a-z]/, "უნდა შეიცავდეს პატარა ასოს")
      .regex(/[0-9]/, "უნდა შეიცავდეს ციფრს"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "პაროლები არ ემთხვევა",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success("წარმატებით დარეგისტრირდით");
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
    getValues,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const phoneField = register("phone", {
    onChange: (event) => {
      const raw = String(event.target.value ?? "");
      if (!raw) return;

      let normalized = raw.replace(/[^\d+]/g, "");
      normalized = normalized.replace(/^\++/, "+");

      if (normalized.startsWith("995")) normalized = `+${normalized}`;
      else if (normalized.startsWith("5")) normalized = `+995${normalized}`;
      else if (normalized.startsWith("0")) normalized = `+995${normalized.slice(1)}`;

      if (!normalized.startsWith("+995")) {
        const withoutPlus = normalized.replace(/^\+/, "");
        normalized = `+995${withoutPlus.replace(/^995/, "")}`;
      }

      event.target.value = normalized;
    },
    onBlur: (event) => {
      if (String(event.target.value ?? "").trim() === "+995") {
        setValue("phone", "");
      }
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone:
          data.phone?.trim() && data.phone.trim() !== "+995"
            ? data.phone.trim()
            : undefined,
      });
      toast.success("რეგისტრაცია წარმატებულია");
      router.push("/");
    } catch (error) {
      const detail =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : undefined;

      if (detail) {
        toast.error(detail);
        return;
      }
      toast.error("რეგისტრაცია ვერ მოხერხდა");
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
          text="signup_with"
          width="360"
          useOneTap={false}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">ან შეავსე ფორმა</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-lg">სახელი</Label>
          <Input id="firstName" className="h-12" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-lg">გვარი</Label>
          <Input id="lastName" className="h-12" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg">ელ-ფოსტა</Label>
        <Input id="email" type="email" className="h-12" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-lg">ტელეფონი (არასავალდებულო)</Label>
        <Input
          id="phone"
          placeholder="+995 5XX XXX XXX"
          className="h-12"
          {...phoneField}
          onFocus={(event) => {
            if (!event.currentTarget.value && !getValues("phone")) {
              setValue("phone", "+995 ");
            }
          }}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-lg">პაროლი</Label>
        <Input id="password" type="password" className="h-12" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-lg">პაროლის დადასტურება</Label>
        <Input
          id="confirmPassword"
          type="password"
          className="h-12"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base bg-accent hover:bg-accent-hover text-accent-foreground mt-2"
        disabled={loading || googleLoading}
      >
        {loading ? "იტვირთება..." : "რეგისტრაცია"}
      </Button>
    </form>
    </div>
  );
}
