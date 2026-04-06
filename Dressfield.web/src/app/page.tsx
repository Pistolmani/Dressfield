/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Eye, ShoppingBag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import { getStaticProducts } from "@/lib/catalog";
import { HeroGalleryClient } from "@/components/ui/hero-gallery-client";

const FALLBACK_HERO_IMAGES = ["/slidepic.png", "/hero-embroidery.jpg", "/hero-main-bg.jpg"];

export default async function HomePage() {
  const products = await getStaticProducts().catch(
    () => [] as Awaited<ReturnType<typeof getStaticProducts>>,
  );

  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 6);
  const showcaseProducts = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 6);

  const heroImages = Array.from(
    new Set([
      ...FALLBACK_HERO_IMAGES,
      ...products.flatMap((product) => (product.primaryImageUrl ? [product.primaryImageUrl] : [])),
    ]),
  );

  return (
    <div className="flex-1 bg-white">
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="/hero-main-bg.jpg"
            alt="Georgian embroidery collection"
            className="h-full w-full object-cover opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />
          <HeroGalleryClient images={heroImages} count={8} className="z-20 opacity-60" />
        </div>

        <div className="pointer-events-none relative z-30 mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            ქართული ნაკარგი, შენი სტილით
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

      <section className="bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">
                {featuredProducts.length > 0 ? "კოლექცია" : "კატალოგი"}
              </p>
              <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-[0.03em] text-black">
                {featuredProducts.length > 0 ? "პოპულარული პროდუქტები" : "პროდუქცია"}
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium hover:underline text-black"
            >
              ყველა ნახვა
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {showcaseProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/20 bg-black/[0.02] px-6 py-12 text-center">
              <p className="text-muted-foreground">პროდუქტები დროებით არ მოიძებნა.</p>
              <div className="mt-5">
                <Link href="/custom-order">
                  <Button className="bg-black text-white hover:bg-black/90">შექმენი ინდივიდუალური შეკვეთა</Button>
                </Link>
              </div>
            </div>
          )}

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

      <section className="bg-black py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">
                ინდივიდუალური შეკვეთა
              </p>
              <h2 className="font-ui text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.03em] mb-5">
                შექმენი შენი უნიკალური ნაკარგი
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
