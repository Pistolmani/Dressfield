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
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
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
        phone: data.phone || undefined,
      });
      toast.success("რეგისტრაცია წარმატებულია");
      router.push("/");
    } catch {
      toast.error("რეგისტრაცია ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">სახელი</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">გვარი</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">ელ-ფოსტა</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">ტელეფონი (არასავალდებულო)</Label>
        <Input id="phone" placeholder="+995 5XX XXX XXX" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">პაროლი</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">პაროლის დადასტურება</Label>
        <Input
          id="confirmPassword"
          type="password"
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
        className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
        disabled={loading}
      >
        {loading ? "იტვირთება..." : "რეგისტრაცია"}
      </Button>
    </form>
  );
}
