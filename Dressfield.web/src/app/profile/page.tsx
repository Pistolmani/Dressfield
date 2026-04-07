"use client";

import Link from "next/link";
import { User, Package, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "არ არის მითითებული";
  if (phone.startsWith("+995")) return phone;
  return `+995 ${phone}`;
}

export default function ProfilePage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        იტვირთება...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">პროფილის სანახავად გაიარეთ ავტორიზაცია.</p>
        <Link
          href="/auth/login"
          className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          შესვლა
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-ui text-2xl font-semibold">პროფილი</h1>

      <section className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{`${user.firstName} ${user.lastName}`.trim() || "მომხმარებელი"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-black/[0.03] px-3 py-2">
            <p className="text-muted-foreground">ტელეფონი</p>
            <p className="font-medium">{normalizePhone(user.phoneNumber ?? user.phone ?? null)}</p>
          </div>
          <div className="rounded-xl bg-black/[0.03] px-3 py-2">
            <p className="text-muted-foreground">როლი</p>
            <p className="font-medium">{isAdmin ? "ადმინი" : "მომხმარებელი"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/8 bg-white p-6">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition-colors"
          >
            <Package className="h-4 w-4" />
            ჩემი შეკვეთები
          </Link>

          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-black/90 transition-colors"
            >
              <Shield className="h-4 w-4" />
              ადმინ პანელი
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
