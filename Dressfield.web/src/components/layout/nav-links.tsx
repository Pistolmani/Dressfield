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
              "text-3xl font-light tracking-wide transition-opacity hover:opacity-60",
              "font-[family-name:var(--font-brand)]",
              isActive ? "text-white underline underline-offset-4" : "text-white/80",
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
