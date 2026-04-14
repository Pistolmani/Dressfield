"use client";

import Link from "next/link";
import {
  Globe,
  ChevronRight,
  Home,
  ShoppingBag,
  Wand2,
  UserCircle,
  LogOut,
  ListOrdered
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex relative h-full flex-col bg-[#050505] text-white overflow-hidden selection:bg-white/20">
      {/* Decorative gradient blur background */}
      <div className="pointer-events-none absolute left-0 top-0 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-[0.03] blur-[100px]" />
      
      <div className="flex items-center justify-between px-6 pt-12 pb-4 border-b border-white/5 relative z-10">
        <Logo className="h-4 w-auto" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 relative z-10">
        <nav className="flex flex-col gap-3">
          {/* Main Navigation Block */}
          <div className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-2xl">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.05] border-b border-white/5 group"
            >
              <div className="flex items-center gap-4">
                <Home className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                <span className="font-ui text-xl tracking-wide text-white/90 group-hover:text-white">მთავარი</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>

            <Link
              href="/products"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.05] border-b border-white/5 group"
            >
              <div className="flex items-center gap-4">
                <ShoppingBag className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                <span className="font-ui text-xl tracking-wide text-white/90 group-hover:text-white">პროდუქცია</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>

            <Link
              href="/custom-order"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.05] group"
            >
              <div className="flex items-center gap-4">
                <Wand2 className="h-5 w-5 text-accent-light group-hover:text-white transition-colors" />
                <span className="font-ui text-xl tracking-wide text-white/90 group-hover:text-white">შექმენი შენი დიზაინი</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>
          </div>

          <div className="mt-4 px-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 ml-2">პირადი პროფილი</p>
            <div className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-2xl">
              {user ? (
                <>
                  <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                        {user.firstName?.charAt(0) || <UserCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-wide">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-white/50">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.05] border-b border-white/5 group"
                  >
                    <div className="flex items-center gap-4">
                      <ListOrdered className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                      <span className="font-ui text-lg tracking-wide text-white/80 group-hover:text-white">ჩემი შეკვეთები</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  </Link>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-red-500/10 group w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <LogOut className="h-5 w-5 text-red-400/70 group-hover:text-red-400 transition-colors" />
                      <span className="font-ui text-lg tracking-wide text-red-400/80 group-hover:text-red-400">გამოსვლა</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.05] border-b border-white/5 group"
                  >
                    <div className="flex items-center gap-4">
                      <UserCircle className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" />
                      <span className="font-ui text-lg tracking-wide text-white/90 group-hover:text-white">შესვლა ან რეგისტრაცია</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto px-6 py-8 border-t border-white/5 relative z-10 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          aria-label="Instagram"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <Globe className="h-4 w-4" />
          </div>
          <span className="text-xs tracking-wide">Instagram</span>
        </a>
        <span className="text-white/20 text-[10px] tracking-widest uppercase font-brand text-right">DressField<br/>Store</span>
      </div>
    </div>
  );
}
