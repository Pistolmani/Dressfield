"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ShoppingCart, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ProfileDropdown } from "./profile-dropdown";
import { Logo } from "@/components/ui/logo";
import { useCartStore } from "@/stores/cart-store";
import { CartHoverPreview } from "./cart-hover-preview";

export function Header() {
  const cartCount = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <header className="sticky top-0 z-50 bg-header-bg text-header-text">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        <Link href="/" aria-label="DressField — მთავარი">
          <Logo className="h-5 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <CartHoverPreview />
          <Link
            href="/cart"
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
          >
            <ShoppingCart className="h-5 w-5" />
            {isHydrated && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <ProfileDropdown />
          </div>

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
