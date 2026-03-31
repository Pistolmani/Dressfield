"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",            label: "მთავარი" },
  { href: "/products",    label: "პროდუქცია" },
  { href: "/custom-order", label: "შეკვეთა" },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = link.href === "/"
          ? pathname === "/"
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-all duration-200",
              "font-[family-name:var(--font-brand-text)]",
              isActive
                ? "bg-white text-[#1b1512] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]"
                : "text-white/74 hover:bg-white/8 hover:text-white",
              className
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
