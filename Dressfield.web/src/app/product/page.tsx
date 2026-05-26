import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductBySlugPageClient } from "@/components/catalog/product-by-slug-page-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">იტვირთება პროდუქტის გვერდი...</p>
        </main>
      }
    >
      <ProductBySlugPageClient />
    </Suspense>
  );
}
