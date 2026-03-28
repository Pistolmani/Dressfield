"use client";

import Link from "next/link";
import { ShoppingCart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { Logo } from "@/components/ui/logo";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-header-bg text-header-text">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        {/* Logo */}
        <Link href="/" aria-label="DressField — მთავარი">
          <Logo className="h-5 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
              0
            </span>
          </Link>

          {/* Auth / User */}
          <div className="hidden md:block">
            {user ? (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-header-text hover:bg-white/10"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  {user.firstName}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-header-text hover:bg-white/10"
                >
                  შესვლა
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger className="md:hidden p-2 text-header-text hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] max-w-sm">
              <MobileMenu />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
