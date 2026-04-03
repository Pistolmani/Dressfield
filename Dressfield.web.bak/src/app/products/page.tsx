import type { Metadata } from "next";
import { ProductsPageClient } from "@/components/catalog/products-page-client";

export const metadata: Metadata = {
  title: "პროდუქცია",
  description: "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. ათვალიერე ქართული ნაქარგების კოლექცია.",
  openGraph: {
    title: "პროდუქცია — DressField",
    description: "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. ათვალიერე ქართული ნაქარგების კოლექცია.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
  },
  twitter: {
    card: "summary_large_image",
    title: "პროდუქცია — DressField",
    description: "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ.",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
