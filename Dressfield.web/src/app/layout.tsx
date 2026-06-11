import type { Metadata } from "next";
import { Inter, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/ui/page-transition";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const notoGeorgianFallback = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["400", "700"],
  variable: "--font-georgian-fallback",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";
const apiOrigin = (() => {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
})();
const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ??
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const organizationSchemaJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DressField",
  url: siteUrl,
  logo: `${siteUrl}/dressfield-logo.png`,
  image: `${siteUrl}/dressfield-logo.png`,
  sameAs: ["https://www.instagram.com/dressfield.stitch/"],
});

const websiteSchemaJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DressField",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

const localBusinessSchemaJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "DressField",
  url: siteUrl,
  logo: `${siteUrl}/dressfield-logo.png`,
  image: `${siteUrl}/dressfield-logo.png`,
  description:
    "ქარგვა და ნაქარგი თბილისში — ხელით და მანქანური ქარგვა, ლოგოს ქარგვა და ინდივიდუალური ნაქარგი შეკვეთით.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "თბილისი",
    addressCountry: "GE",
  },
  areaServed: {
    "@type": "Country",
    name: "Georgia",
  },
  sameAs: ["https://www.instagram.com/dressfield.stitch/"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DressField — ქარგვა და ნაქარგი შენი სტილით",
    template: "%s — DressField",
  },
  description:
    "ქარგვა და ნაქარგი ონლაინ — ხელით და მანქანური ქარგვა, ლოგოს ქარგვა და ინდივიდუალური ნაქარგი შეკვეთით. ატვირთე შენი დიზაინი და შექმენი უნიკალური სტილი.",
  keywords: [
    "DressField",
    "dressfield",
    "dressfield.ge",
    "ქარგვა",
    "ნაქარგი",
    "ნაქარგები",
    "ქართული ნაქარგი",
    "მანქანური ქარგვა",
    "ხელით ქარგვა",
    "ლოგოს ქარგვა",
    "ქარგვა თბილისი",
    "ქარგვა შეკვეთით",
    "ინდივიდუალური შეკვეთა",
    "embroidery",
    "custom embroidery",
    "Georgian embroidery",
  ],
  openGraph: {
    siteName: "DressField",
    locale: "ka_GE",
    type: "website",
    title: "DressField — ქარგვა და ნაქარგი შენი სტილით",
    description:
      "ქარგვა და ნაქარგი ონლაინ — მზა პროდუქცია, ლოგოს ქარგვა და ინდივიდუალური შეკვეთები.",
    url: siteUrl,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DressField — ქარგვა და ნაქარგი" }],
  },
  manifest: "/manifest.webmanifest",
  twitter: {
    card: "summary_large_image",
    title: "DressField — ქარგვა და ნაქარგი შენი სტილით",
    description:
      "ქარგვა და ნაქარგი ონლაინ — მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
  },
  verification: {
    google: googleSiteVerification,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={cn(
        "h-full antialiased",
        inter.variable,
        notoGeorgianFallback.variable
      )}
    >
      <head>
        {apiOrigin ? (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchemaJson }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchemaJson }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: localBusinessSchemaJson }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <MetaPixel />
          <GoogleAnalytics />
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
