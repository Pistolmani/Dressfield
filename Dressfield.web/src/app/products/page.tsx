import type { Metadata } from "next";
import { ProductsPageClient } from "@/components/catalog/products-page-client";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse embroidered products by DressField.",
  openGraph: {
    title: "Products - DressField",
    description: "Browse embroidered products by DressField.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products - DressField",
    description: "Browse embroidered products by DressField.",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
