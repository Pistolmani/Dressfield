"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",            label: "მთავარი" },
  { href: "/products",    label: "პროდუქცია" },
  { href: "/custom-order", label: "შეკვეთა" },
];

interface NavLinksProps {
  className?: string;
  onNavigate?: () => void;
  baseClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function NavLinks({
  className,
  onNavigate,
  baseClassName,
  activeClassName,
  inactiveClassName,
}: NavLinksProps) {
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
              baseClassName ??
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-all duration-200",
              "font-[family-name:var(--font-brand-text)]",
              isActive
                ? (activeClassName ??
                  "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]")
                : (inactiveClassName ?? "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"),
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
