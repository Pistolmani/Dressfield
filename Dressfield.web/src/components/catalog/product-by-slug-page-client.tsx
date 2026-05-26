"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductDetailClient } from "@/components/catalog/product-detail-client";
import { getProductBySlug } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export function ProductBySlugPageClient() {
  const searchParams = useSearchParams();
  const slug = (searchParams.get("slug") ?? "").trim();

  const productQuery = useQuery({
    queryKey: ["product-by-slug", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: slug.length > 0,
    retry: 1,
  });

  if (!slug) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">პროდუქტი ვერ მოიძებნა</h1>
        <p className="mt-4 text-muted-foreground">გთხოვთ აირჩიოთ პროდუქტი კატალოგიდან.</p>
        <div className="mt-6">
          <Link href="/products">
            <Button>პროდუქტებზე გადასვლა</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (productQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">იტვირთება პროდუქტის გვერდი...</p>
      </main>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">პროდუქტი ვერ მოიძებნა</h1>
        <p className="mt-4 text-muted-foreground">
          შესაძლებელია პროდუქტი წაიშალა ან ბმული შეიცვალა.
        </p>
        <div className="mt-6">
          <Link href="/products">
            <Button>პროდუქტებზე დაბრუნება</Button>
          </Link>
        </div>
      </main>
    );
  }

  return <ProductDetailClient key={productQuery.data.slug} product={productQuery.data} />;
}
