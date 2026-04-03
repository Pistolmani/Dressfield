"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ShoppingCart, Menu, User, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { Logo } from "@/components/ui/logo";
import { useCartStore } from "@/stores/cart-store";

import { AnimatePresence, motion } from "framer-motion";

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const cartCount = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
          <Link
            href="/cart"
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {isHydrated && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <div 
                className="relative flex items-center gap-2"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
                      პანელი
                    </Button>
                  </Link>
                )}
                <div className="relative">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10 flex items-center gap-2 pr-6">
                      <User className="h-4 w-4" />
                      {user.firstName}
                      <ChevronDown className={`h-3 w-3 absolute right-2 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                    </Button>
                  </Link>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-50 py-1"
                      >
                        <Link href="/profile">
                          <button className="group w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-3">
                            <User className="h-4 w-4 opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                            თქვენი პროფილი
                          </button>
                        </Link>
                        <Link href="/profile?tab=orders">
                          <button className="group w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-3">
                            <ShoppingCart className="h-4 w-4 opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                            შეკვეთების ისტორია
                          </button>
                        </Link>
                        <div className="h-px bg-black/5 mx-2 my-1" />
                        <button 
                          onClick={() => void logout()}
                          className="group w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50/80 transition-all flex items-center gap-3"
                        >
                          <LogOut className="h-4 w-4 opacity-60 shrink-0 group-hover:opacity-100 transition-opacity" />
                          გასვლა
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
                  შესვლა
                </Button>
              </Link>
            )}
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
