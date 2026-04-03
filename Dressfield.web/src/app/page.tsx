import Link from "next/link";
import { ArrowRight, Upload, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ProductCard } from "@/components/catalog/product-card";
import { getStaticProducts } from "@/lib/catalog";
import { HeroGalleryClient } from "@/components/ui/hero-gallery-client";

export default async function HomePage() {
  const products = await getStaticProducts().catch(() => [] as Awaited<ReturnType<typeof getStaticProducts>>);
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const heroImages = ["/slidepic.png", ...products.flatMap(p => p.primaryImageUrl ? [p.primaryImageUrl] : [])];

  return (
    <div className="flex-1">
      {/* ── HERO BACKGROUND ───────────────────────────── */}
      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-embroidery.jpg"
            alt="Georgian embroidery collection"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <HeroGalleryClient images={heroImages} count={18} className="opacity-60" />
        </div>

        {/* ── HERO CONTENT ──────────────────────────── */}
        <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <Logo className="mx-auto mb-8 h-14 w-auto text-white" />

          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            ქართული ნაქარგი, შენი სტილით
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            ატვირთე შენი დიზაინი, ნახე live preview და შეუკვეთე.
          </p>

          {/* ── PRIMARY CTA ONLY ──────────────────── */}
          <div className="mt-10 pointer-events-auto">
            <Link href="/custom-order">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Upload className="h-5 w-5 mr-2" />
                დაწყე
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      {featured.length > 0 && (
        <section className="relative z-10 bg-background py-14 sm:py-16 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">
                  კოლექცია
                </p>
                <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-[0.03em]">
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
      <section className="relative z-10 bg-foreground py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">
                ინდივიდუალური შეკვეთა
              </p>
              <h2 className="font-ui text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.03em] mb-5">
                შეიქმენი შენი უნიკალური ნაქარგი
              </h2>
              <ol className="space-y-3 mb-8">
                {[
                  { icon: Upload, text: "ატვირთე შენი დიზაინი ან სურათი" },
                  { icon: Eye, text: "ნახე live preview პროდუქტზე" },
                  { icon: ShoppingBag, text: "შეუკვეთე და მიიღე სახლში" },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {i + 1}
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

      {/* ── FOOTER SPACER ─────────────────────────────────── */}
      {/* This transparent space allows the fixed dynamic background to peek through at the end of the scroll */}
      <section className="relative h-[35vh] pointer-events-none" aria-hidden="true" />

    </div>
  );
}
