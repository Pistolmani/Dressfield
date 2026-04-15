"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["products-categories-mobile"],
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 10,
    enabled: open,
  });

  const categories = useMemo(() => {
    const products = productsQuery.data ?? [];
    const seen = new Map<string, string>();

    for (const product of products) {
      if (product.categorySlug && product.categoryName && !seen.has(product.categorySlug)) {
        seen.set(product.categorySlug, product.categoryName);
      }
    }

    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
  }, [productsQuery.data]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black text-white"
      style={{ height: "100dvh" }}
    >
      {/* Top bar — mirrors header height */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 shrink-0">
        <Link href="/" onClick={onClose} aria-label="DressField — მთავარი">
          <Logo className="h-5 w-auto" />
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col flex-1 overflow-y-auto px-6 pt-10 pb-10">

        {/* Primary nav */}
        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            onClick={onClose}
            className="font-ui text-5xl tracking-wide text-white/50 hover:text-white transition-colors py-1"
          >
            მთავარი
          </Link>

          {/* Products with category expansion */}
          <div>
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              className="w-full flex items-center gap-3 font-ui text-5xl tracking-wide text-white hover:text-white/80 transition-colors py-1"
            >
              პროდუქცია
              <ChevronDown
                className={cn(
                  "h-6 w-6 text-white/30 transition-transform duration-300 mt-1",
                  categoriesOpen && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "flex flex-col gap-2 overflow-hidden transition-all duration-300",
                categoriesOpen ? "max-h-[400px] opacity-100 pt-3" : "max-h-0 opacity-0"
              )}
            >
              <Link
                href="/products"
                onClick={onClose}
                className="pl-4 font-ui text-2xl text-white/40 hover:text-white transition-colors tracking-wide py-1"
              >
                ყველა პროდუქტი
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  onClick={onClose}
                  className="pl-4 font-ui text-2xl text-white/40 hover:text-white transition-colors tracking-wide py-1"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/custom-order"
            onClick={onClose}
            className="font-ui text-5xl tracking-wide text-white/50 hover:text-white transition-colors py-1"
          >
            შეკვეთა
          </Link>
        </nav>

        {/* Divider */}
        <div className="my-8 h-px bg-white/10 shrink-0" />

        {/* Auth section */}
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <p className="text-xs uppercase tracking-widest text-white/30 font-medium mb-2">
                {user.firstName} {user.lastName}
              </p>
              <Link
                href="/orders"
                onClick={onClose}
                className="font-ui text-2xl text-white/70 hover:text-white transition-colors tracking-wide py-1"
              >
                ჩემი შეკვეთები
              </Link>
              <Link
                href="/profile"
                onClick={onClose}
                className="font-ui text-2xl text-white/70 hover:text-white transition-colors tracking-wide py-1"
              >
                პროფილი
              </Link>
              <button
                onClick={() => { logout(); onClose(); }}
                className="text-left font-ui text-2xl text-white/30 hover:text-red-400 transition-colors tracking-wide py-1"
              >
                გამოსვლა
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={onClose}
                className="font-ui text-2xl text-white/70 hover:text-white transition-colors tracking-wide py-1"
              >
                შესვლა
              </Link>
              <Link
                href="/auth/register"
                onClick={onClose}
                className="font-ui text-2xl text-white/40 hover:text-white transition-colors tracking-wide py-1"
              >
                რეგისტრაცია
              </Link>
            </>
          )}
        </div>

        {/* Bottom — social + brand */}
        <div className="mt-auto pt-10 flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Globe className="h-4 w-4" />
          </a>
          <span className="text-white/20 text-xs tracking-widest uppercase">DressField</span>
        </div>
      </div>
    </div>
  );
}
