import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Order",
  description: "Upload your design and request a custom embroidery order at DressField.",
  openGraph: {
    title: "Custom Order - DressField",
    description: "Upload your design and request a custom embroidery order at DressField.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Order - DressField",
    description: "Upload your design and request a custom embroidery order at DressField.",
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

