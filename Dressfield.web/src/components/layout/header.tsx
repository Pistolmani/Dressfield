"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ProfileDropdown } from "./profile-dropdown";
import { Logo } from "@/components/ui/logo";
import { CartHoverPreview } from "./cart-hover-preview";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl text-white border-b border-white/5 transition-all duration-300">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
        <Link href="/" aria-label="DressField — მთავარი">
          <Logo className="h-5 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <CartHoverPreview />

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
