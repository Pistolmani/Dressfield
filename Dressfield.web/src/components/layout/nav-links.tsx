"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CategoryDropdown } from "./category-dropdown";

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
        if (link.href === "/products") {
          return (
            <CategoryDropdown 
              key={link.href} 
              baseClassName={baseClassName} 
              onNavigate={onNavigate}
            />
          );
        }

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
                  "bg-white text-[#1b1512] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]")
                : (inactiveClassName ?? "text-white/74 hover:bg-white/8 hover:text-white"),
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
