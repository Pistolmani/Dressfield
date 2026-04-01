"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NavLinks } from "./nav-links";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-black px-8 pb-10 pt-16 text-white sm:pt-14">

      {/* Nav links */}
      <nav className="mt-2 flex flex-col gap-6 pr-10">
        <NavLinks
          baseClassName="inline-flex items-center justify-start py-1 font-ui text-4xl tracking-wide transition-colors"
          activeClassName="text-white"
          inactiveClassName="text-white/70 hover:text-white"
          className="w-full"
          onNavigate={onClose}
        />
      </nav>

      {/* Divider */}
      <div className="my-8 h-px bg-white/10" />

      {/* Auth section */}
      <div className="flex flex-col gap-4">
        {user ? (
          <>
            <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-1">
              {user.firstName} {user.lastName}
            </p>
            <Link
              href="/orders"
              onClick={onClose}
              className="font-ui text-2xl text-white/80 hover:text-white transition-colors tracking-wide"
            >
              ჩემი შეკვეთები
            </Link>
            <button
              onClick={() => { logout(); onClose(); }}
              className="text-left font-ui text-2xl text-white/40 hover:text-red-400 transition-colors tracking-wide"
            >
              გამოსვლა
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              onClick={onClose}
              className="font-ui text-3xl text-white/90 hover:text-white transition-colors tracking-wide"
            >
              შესვლა
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="font-ui text-3xl text-white/50 hover:text-white transition-colors tracking-wide"
            >
              რეგისტრაცია
            </Link>
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex items-center gap-4 pb-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white transition-colors"
          aria-label="Instagram"
        >
          <Globe className="h-5 w-5" />
        </a>
        <span className="text-white/20 text-xs tracking-widest uppercase">DressField</span>
      </div>
    </div>
  );
}
