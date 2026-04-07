"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, Plus, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["products-categories-mobile"],
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 10,
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

  return (
    <div className="flex h-full flex-col bg-black px-8 pb-10 pt-16 text-white sm:pt-14 overflow-y-auto">

      {/* Nav links */}
      <nav className="mt-2 flex flex-col gap-6 pr-10">
        <Link
          href="/"
          onClick={onClose}
          className="inline-flex items-center justify-start py-1 font-ui text-4xl tracking-wide transition-colors text-white/70 hover:text-white"
        >
          მთავარი
        </Link>

        {/* Categories Collapsible */}
        <div className="space-y-4">
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="w-full flex items-center justify-between py-1 font-ui text-4xl tracking-wide transition-colors text-white"
          >
            პროდუქცია
            {categoriesOpen ? <Minus className="h-6 w-6 text-white/40" /> : <Plus className="h-6 w-6 text-white/40" />}
          </button>

          <div
            className={cn(
              "flex flex-col gap-4 overflow-hidden transition-all duration-300",
              categoriesOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <Link
              href="/products"
              onClick={onClose}
              className="pl-4 font-ui text-2xl text-white/50 hover:text-white transition-colors tracking-wide"
            >
              ყველა პროდუქტი
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                onClick={onClose}
                className="pl-4 font-ui text-2xl text-white/50 hover:text-white transition-colors tracking-wide"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/custom-order"
          onClick={onClose}
          className="inline-flex items-center justify-start py-1 font-ui text-4xl tracking-wide transition-colors text-white/70 hover:text-white"
        >
          შეკვეთა
        </Link>
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
