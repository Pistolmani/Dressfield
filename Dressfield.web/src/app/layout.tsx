import type { Metadata } from "next";
import { Inter, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorTrail } from "@/components/ui/CursorTrail";
import { PageTransition } from "@/components/ui/page-transition";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DressField — ქართული ნაქარგები",
    template: "%s — DressField",
  },
  description:
    "ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
  openGraph: {
    siteName: "DressField",
    locale: "ka_GE",
    type: "website",
    title: "DressField — ქართული ნაქარგები",
    description:
      "ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "DressField — ქართული ნაქარგები",
    description:
      "ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <CursorTrail />
          <Header />
          <main className="flex-1"><PageTransition>{children}</PageTransition></main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
