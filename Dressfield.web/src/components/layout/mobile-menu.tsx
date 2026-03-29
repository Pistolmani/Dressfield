"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { NavLinks } from "./nav-links";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full pt-8">
      <nav className="flex flex-col gap-5">
        {/* NavLinks with onNavigate to close the sheet */}
        <NavLinks
          className="text-xl text-foreground"
          onNavigate={onClose}
        />
      </nav>

      <Separator className="my-6" />

      <div className="flex flex-col gap-3">
        {user ? (
          <>
            <p className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </p>
            <button
              onClick={() => { logout(); onClose(); }}
              className="text-left text-sm text-destructive hover:underline"
            >
              გამოსვლა
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              onClick={onClose}
              className="text-lg font-medium hover:text-accent transition-colors"
            >
              შესვლა
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="text-lg font-medium hover:text-accent transition-colors"
            >
              რეგისტრაცია
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto pb-6 flex gap-4">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <Globe className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
