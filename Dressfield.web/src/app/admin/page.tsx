"use client";

import Link from "next/link";
import { Package, ShoppingBag, Scissors, ArrowRight } from "lucide-react";

const cards = [
  {
    href: "/admin/products",
    icon: Package,
    label: "პროდუქტები",
    description: "პროდუქტების დამატება, რედაქტირება და წაშლა",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    label: "შეკვეთები",
    description: "მომხმარებლების შეკვეთები",
  },
  {
    href: "/admin/custom-orders",
    icon: Scissors,
    label: "ინდივიდუალური შეკვეთები",
    description: "კერძო ნაქარგის შეკვეთები",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">ადმინისტრატორი</p>
        <h1 className="text-3xl font-bold text-foreground mt-1">მართვის პანელი</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm hover:border-accent hover:shadow-md transition-all"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
