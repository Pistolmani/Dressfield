"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { NavLinks } from "./nav-links";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user } = useAuth();

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
              href="/profile"
              onClick={onClose}
              className="font-ui text-4xl text-white hover:text-white transition-colors tracking-wide"
            >
              პროფილი
            </Link>
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
          href="https://www.instagram.com/dressfield.stitch/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white transition-colors"
          aria-label="DressField Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <span className="text-white/20 text-xs tracking-widest uppercase">DressField</span>
      </div>
    </div>
  );
}
