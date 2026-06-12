import type { Metadata } from "next";
import { ProductsPageClient } from "@/components/catalog/products-page-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "ნაქარგების და ქარგვის კატალოგი",
  description:
    "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. დაათვალიერე ქართული ნაქარგების კოლექცია და შეუკვეთე ქარგვა შენი დიზაინით.",
  keywords: [
    "ქარგვა",
    "ნაქარგი",
    "ნაქარგები",
    "ქართული ნაქარგი",
    "ლოგოს ქარგვა",
    "ქარგვა შეკვეთით",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "ნაქარგების და ქარგვის კატალოგი — DressField",
    description:
      "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ. დაათვალიერე ქართული ნაქარგების კოლექცია და შეუკვეთე ქარგვა.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/products`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ნაქარგების და ქარგვის კატალოგი — DressField",
    description:
      "DressField-ის ნაქარგები — მზა პროდუქცია ონლაინ.",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
