/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Upload, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ProductCard } from "@/components/catalog/product-card";
import { getStaticProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getStaticProducts().catch(() => [] as Awaited<ReturnType<typeof getStaticProducts>>);

  const featured = products.filter((p) => p.isFeatured).slice(0, 3);

  return (
    <div className="flex-1">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Embroidery photo background */}
        <div className="absolute inset-0">
          <img
            src="/slidepic.png"
            alt=""
            className="h-full w-full object-contain scale-90"
            style={{ objectPosition: "center center" }}
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <Logo className="h-12 sm:h-16 w-auto mx-auto mb-8 text-white" />
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            ქართული ნაქარგი,{" "}
            <span className="text-white">შენი სტილით</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-xl mx-auto leading-relaxed">
            ავტვირთე შენი დიზაინი, ნახე live preview და შეუკვეთე
            ინდივიდუალური ნაქარგი.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/custom-order">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-8 py-4 text-base font-semibold"
              >
                <Upload className="h-4 w-4 mr-2" />
                ჩემი დიზაინი
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 text-base font-semibold"
              >
                მზა პროდუქცია
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-background py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">
                  კოლექცია
                </p>
                <h2 className="font-[family-name:var(--font-inter)] text-3xl font-bold tracking-tight">
                  პოპულარული პროდუქტები
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline text-foreground"
              >
                ყველა ნახვა
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products">
                <Button variant="outline">
                  ყველა პროდუქტი
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CUSTOM ORDER CTA ─────────────────────────────── */}
      <section className="bg-foreground py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">
                ინდივიდუალური შეკვეთა
              </p>
              <h2 className="font-[family-name:var(--font-inter)] text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                შეიქმენი შენი უნიკალური ნაქარგი
              </h2>
              <ol className="space-y-4 mb-10">
                {[
                  { icon: Upload, text: "ავტვირთე შენი დიზაინი ან სურათი" },
                  { icon: Eye, text: "ნახე live preview პროდუქტზე" },
                  { icon: ShoppingBag, text: "შეუკვეთე და მიიღე სახლში" },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-white/90">{text}</span>
                  </li>
                ))}
              </ol>
              <Link href="/custom-order">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold px-8"
                >
                  დაიწყე ახლავე
                </Button>
              </Link>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-80 h-80 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
                <div className="text-center text-white/40">
                  <Upload className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-sm">Design Preview Mockup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}


