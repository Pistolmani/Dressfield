"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "მთავარი" },
  { href: "/products", label: "პროდუქცია" },
  { href: "/categories", label: "კატეგორიები" },
  { href: "/custom-order", label: "შეკვეთა" },
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-[15px] font-medium font-[family-name:var(--font-inter)] transition-colors hover:text-accent",
            pathname === link.href ? "text-accent" : "",
            className
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
