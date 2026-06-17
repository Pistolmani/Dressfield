"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/catalog";

export function HomeShowcaseClient() {
  const productsQuery = useQuery({
    queryKey: ["products", null],
    queryFn: () => getProducts(),
    staleTime: 5 * 60_000,
  });

  const products = productsQuery.data ?? [];
  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 8);
  const showcaseProducts = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 8);

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">
              {featuredProducts.length > 0 ? "კოლექცია" : "კატალოგი"}
            </p>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-[0.03em] text-black">
              {featuredProducts.length > 0 ? "პოპულარული პროდუქტები" : "პროდუქცია"}
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline text-black"
          >
            ყველა ნახვა
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`home-skeleton-${index}`}
                className="aspect-[3/4] rounded-xl bg-black/5 animate-pulse"
              />
            ))}
          </div>
        ) : null}

        {!productsQuery.isLoading && showcaseProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {showcaseProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {!productsQuery.isLoading && showcaseProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-black/[0.02] px-6 py-12 text-center">
            <p className="text-muted-foreground">პროდუქტები დროებით არ მოიძებნა.</p>
            <div className="mt-5">
              <Link href="/custom-order">
                <Button className="bg-black text-white hover:bg-black/90">
                  შექმენი ინდივიდუალური შეკვეთა
                </Button>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products">
            <Button variant="outline">
              ყველა პროდუქტი
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
