import type { Metadata } from "next";
import { ProductsPageClient } from "@/components/catalog/products-page-client";
import { getStaticProducts } from "@/lib/catalog";
import type { ProductSummaryDto } from "@/types/catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "პროდუქცია",
  description:
    "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. დაათვალიერე ქართული ნაქარგების კოლექცია.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "პროდუქცია — DressField",
    description:
      "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. დაათვალიერე ქართული ნაქარგების კოლექცია.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/products`,
  },
  twitter: {
    card: "summary_large_image",
    title: "პროდუქცია — DressField",
    description:
      "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ.",
  },
};

export default async function ProductsPage() {
  let initialProducts: ProductSummaryDto[] = [];
  try {
    initialProducts = await getStaticProducts();
  } catch {
    // API unavailable at build time — client will fetch on mount
  }

  return <ProductsPageClient initialProducts={initialProducts} />;
}
