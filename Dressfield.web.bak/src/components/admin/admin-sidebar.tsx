"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Scissors, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "დაფა", icon: LayoutDashboard },
  { href: "/admin/products", label: "პროდუქტები", icon: Package },
  { href: "/admin/orders", label: "შეკვეთები", icon: ShoppingBag },
  { href: "/admin/custom-orders", label: "ინდ. შეკვეთები", icon: Scissors },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground mr-4">
          <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
            <LayoutDashboard className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="hidden sm:inline">Admin</span>
        </div>

        {/* Nav items */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">გასვლა</span>
        </button>
      </div>
    </header>
  );
}
