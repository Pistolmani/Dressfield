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
    <div className="flex flex-col h-full bg-black text-white px-8 py-10">

      {/* Nav links */}
      <nav className="flex flex-col gap-6 mt-4">
        <NavLinks
          className="text-4xl text-white/90 hover:text-white hover:opacity-100"
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
