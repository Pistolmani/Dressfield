import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "ინდივიდუალური შეკვეთა",
  description:
    "ატვირთე შენი დიზაინი და შექმენი ინდივიდუალური ნაქარგი DressField-ზე.",
  alternates: {
    canonical: "/custom-order",
  },
  openGraph: {
    title: "ინდივიდუალური შეკვეთა — DressField",
    description:
      "ატვირთე შენი დიზაინი და შექმენი ინდივიდუალური ნაქარგი DressField-ზე.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/custom-order`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ინდივიდუალური შეკვეთა — DressField",
    description:
      "ატვირთე შენი დიზაინი და შექმენი ინდივიდუალური ნაქარგი DressField-ზე.",
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
