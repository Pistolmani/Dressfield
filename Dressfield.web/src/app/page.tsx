/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Eye, ShoppingBag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeHeroGalleryClient } from "@/components/home/home-hero-gallery-client";
import { HomeShowcaseClient } from "@/components/home/home-showcase-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "DressField — ქართული ნაქარგი, შენი სტილით",
  description:
    "ქართული ნაქარგების ონლაინ მაღაზია. ატვირთე შენი დიზაინი და შექმენი უნიკალური სტილი.",
  keywords: [
    "DressField",
    "dressfield",
    "dressfield.ge",
    "embroidery",
    "custom embroidery",
    "custom order",
    "ნაქარგი",
    "ქართული ნაქარგი",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DressField — ქართული ნაქარგი, შენი სტილით",
    description:
      "ქართული ნაქარგების ონლაინ მაღაზია. ატვირთე დიზაინი და შეუკვეთე.",
    url: siteUrl,
    type: "website",
    siteName: "DressField",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: "DressField — ქართული ნაქარგი, შენი სტილით",
    description:
      "ქართული ნაქარგების ონლაინ მაღაზია. ატვირთე დიზაინი და შეუკვეთე.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DressField",
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  description:
    "ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DressField",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <div className="flex-1 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="/hero-main-bg.jpg"
            alt="Georgian embroidery collection"
            className="h-full w-full object-cover opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />
          <HomeHeroGalleryClient count={8} className="z-20 opacity-60" />
        </div>

        <div className="pointer-events-none relative z-30 mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            ქართული ნაქარგი, შენი სტილით
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
            ატვირთე შენი დიზაინი, ნახე live preview და შეუკვეთე.
          </p>

          <div className="mt-12 pointer-events-auto">
            <Link href="/custom-order">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-10 py-4 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 rounded-full"
              >
                <Upload className="h-5 w-5 mr-3" />
                შექმენი
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-black to-white w-full pointer-events-none" />

      <HomeShowcaseClient />

      <section className="bg-black py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">
                ინდივიდუალური შეკვეთა
              </p>
              <h2 className="font-ui text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.03em] mb-5">
                შექმენი შენი უნიკალური ნაქარგი
              </h2>
              <ol className="space-y-3 mb-8">
                {[
                  { icon: Upload, text: "ატვირთე შენი დიზაინი ან სურათი" },
                  { icon: Eye, text: "ნახე live preview პროდუქტზე" },
                  { icon: ShoppingBag, text: "შეუკვეთე და მიიღე სახლში" },
                ].map(({ icon: Icon, text }, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {index + 1}
                    </span>
                    <Icon className="h-4 w-4 text-white/75 shrink-0" />
                    <span className="text-sm sm:text-base text-white/90">{text}</span>
                  </li>
                ))}
              </ol>
              <Link href="/custom-order">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold px-6 text-sm"
                >
                  დაიწყე ახლავე
                </Button>
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="w-72 h-72 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
                <div className="text-center text-white/40">
                  <Upload className="h-14 w-14 mx-auto mb-3" />
                  <p className="text-sm">დიზაინის პრევიუ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
