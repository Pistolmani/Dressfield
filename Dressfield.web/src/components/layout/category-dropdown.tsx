"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProducts } from "@/lib/catalog";

export function CategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["products-categories-nav"],
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 10, // 10 minutes
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
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href="/products"
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-all duration-200",
          "font-[family-name:var(--font-brand-text)]",
          isOpen
            ? "bg-white text-[#1b1512] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]"
            : "text-white/74 hover:bg-white/8 hover:text-white"
        )}
      >
        პროდუქცია
        <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </Link>

      <div
        className={cn(
          "absolute left-0 top-full pt-4 transition-all duration-300",
          isOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2"
        )}
      >
        <div className="w-64 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 p-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">კატეგორიები</p>
          </div>

          <div className="space-y-1">
            <Link
              href="/products"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Layers className="h-4 w-4" />
              ყველა პროდუქტი
            </Link>

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {category.name}
              </Link>
            ))}

            {productsQuery.isLoading && (
              <div className="p-3">
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
