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
    <aside className="flex flex-col w-56 shrink-0 border-r border-border bg-white min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-accent text-white" : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          გასვლა
        </button>
      </div>
    </aside>
  );
}
