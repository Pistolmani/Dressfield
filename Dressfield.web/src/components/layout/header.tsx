"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { Logo } from "@/components/ui/logo";
import { useCartStore } from "@/stores/cart-store";

export function Header() {
  const { user } = useAuth();
  const cartCount = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);

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
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Auth / User */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
                    ჩემი შეკვეთები
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
                    <User className="h-4 w-4 mr-1.5" />
                    {user.firstName}
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
                  შესვლა
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu — controlled so it closes on navigation */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden p-2 text-header-text hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] max-w-sm bg-black border-white/10 p-0">
              <MobileMenu onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
