/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Scissors, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ",
  description:
    "DressField — ქართული ნაქარგების ბრენდი თბილისიდან. ვქმნით ხელნაქარგ პროდუქტებს და ვიღებთ ინდივიდუალურ შეკვეთებს. გაიცანი ჩვენი ისტორია და შექმენი შენი სტილი.",
  keywords: [
    "custom embroidery",
    "custom embroidered clothing",
    "embroidery on clothes",
    "embroidered hoodie",
    "embroidered sweatshirt",
    "embroidered t-shirt",
    "embroidered cap",
    "logo embroidery",
    "custom logo embroidery",
    "branded workwear embroidery",
    "embroidery Tbilisi",
    "custom embroidery Georgia",
    "embroidered clothing Tbilisi",
    "ქართული ნაქარგი",
    "ნაქარგი ტანსაცმელზე",
    "ლოგოს ქარგვა",
    "ბრენდირებული ტანსაცმელი",
    "შენი სტილით",
    "corporate embroidery",
    "company logo embroidery",
    "uniform embroidery",
    "staff apparel branding",
    "business merch embroidery",
    "custom embroidered uniforms",
    "design your hoodie",
    "customize sweatshirt",
    "custom embroidered hoodie",
    "upload your logo hoodie",
    "personalize embroidered apparel",
    "custom patchwork",
    "patchwork clothing",
    "custom patches",
    "embroidered patches",
    "sew-on patches",
    "iron-on patches",
    "logo patches",
    "branded patches",
    "patchwork hoodie",
    "patchwork sweatshirt",
    "custom patch design",
    "პატჩები",
    "პატჩის დამზადება",
    "ლოგოს პატჩი",
    "ტანსაცმლის პატჩი",
    "ბრენდირებული პატჩები"
  ],
  alternates: {
    canonical: "https://dressfield.ge/about",
  },
  openGraph: {
    title: "ჩვენ შესახებ — DressField",
    description:
      "DressField — ქართული ნაქარგების ბრენდი თბილისიდან. ვქმნით ხელნაქარგ პროდუქტებს და ვიღებთ ინდივიდუალურ შეკვეთებს.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: "https://dressfield.ge/about",
    images: [
      {
        url: "https://dressfield.ge/hero-embroidery.jpg",
        width: 1200,
        height: 630,
        alt: "DressField — ქართული ნაქარგები",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ჩვენ შესახებ — DressField",
    description:
      "ქართული ნაქარგების ბრენდი თბილისიდან. მზა პროდუქცია და ინდივიდუალური შეკვეთები.",
  },
};

const values = [
  {
    icon: Scissors,
    title: "ხელნაკეთი",
    body: "ყოველი ნაქარგი იქმნება ყურადღებით და სიყვარულით. ვიყენებთ მაღალი ხარისხის ძაფებს და ქსოვილებს, რომ შედეგი გაძლოს წლობით.",
  },
  {
    icon: Heart,
    title: "ინდივიდუალური",
    body: "გჯერა, რომ ტანსაცმელი შენი პიროვნების ანარეკლია. ამიტომ ყოველ კლიენტთან ვმუშაობთ პერსონალურად და ვქმნით უნიკალურ ნიმუშებს.",
  },
  {
    icon: Award,
    title: "ხარისხიანი",
    body: "არ ვკომპრომისობთ ხარისხზე. ყოველი პროდუქტი გადის ხელით შემოწმებას, სანამ კლიენტამდე მიაღწევს.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/hero-embroidery.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <nav className="text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition-colors">მთავარი</Link>
            {" / "}
            <span className="text-white/80">ჩვენ შესახებ</span>
          </nav>
          <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-4">ჩვენ შესახებ</p>
          <h1 className="font-ui text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-3xl leading-tight">
            ქართული ნაქარგი,<br />
            <span className="text-accent">შენი სტილით</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
            DressField — ნაქარგების ბრენდი, რომლის მიზანია აქციოს შენი იდეა რეალობად.
          </p>
        </div>
      </section>

      {/* ── STORY ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-4">ჩვენი ისტორია</p>
              <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                სიყვარულით შექმნილი, საქართველოში
              </h2>
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                <p>
                  DressField-ის ისტორია თბილისში დაიწყო, ერთი მარტივი იდეით — შეგვექმნა ადგილი, სადაც ნაქარგი
                  და პატჩები გახდებოდა თვითგამოხატვის თანამედროვე ფორმა. ჩვენთვის ეს მხოლოდ დეკორი არ არის;
                  ეს არის გზა, რომ ჩვეულებრივი ტანსაცმელი გადაიქცეს შენს იდენტობის სარკედ და გამოაჩინოს შენი უნიკალურობა.
                </p>
                <p>
                  ჩვენ ვხელმძღვანელობთ იმ რწმენით, რომ ტანსაცმელი არ არის მხოლოდ ფუნქცია — ის ამბავია. ყოველი
                  ნაქარგი ატარებს ემოციას, მეხსიერებას ან სიმბოლოს, რომელიც კლიენტისთვის მნიშვნელოვანია.
                </p>
                <p>
                  ჩვენ გთავაზობთ მზა ნაქარგ კოლექციებს და სრულ ინდივიდუალურ სერვისს — ატვირთე შენი დიზაინი,
                  ნახე live preview და შეუკვეთე. ყველაფერი ერთ პლატფორმაზე.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-black/8 shadow-xl">
                <img
                  src="/hero-embroidery.jpg"
                  alt="DressField ნაქარგი სახელოსნო"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-black/2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-4">ჩვენი ფასეულობები</p>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight">
              რით ვგამოვირჩევით
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-ui text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-4">როგორ ვმუშაობთ</p>
            <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight">
              ინდივიდუალური შეკვეთის პროცესი
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "ატვირთე დიზაინი",
                body: "ატვირთე შენი ლოგო, სურათი ან ნიმუში ჩვენს პლატფორმაზე.",
              },
              {
                step: "02",
                title: "ნახე Live Preview",
                body: "ჩვენი ინტერაქტიული ხელსაწყო გიჩვენებს, როგორ გამოიყურება შენი დიზაინი პროდუქტზე — რეალურ დროში.",
              },
              {
                step: "03",
                title: "მიიღე სახლში",
                body: "გადახდის შემდეგ ჩვენ ამოვქარგავთ და გიგზავნით თქვენს შეკვეთას.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="relative">
                <div className="flex items-start gap-5">
                  <span className="font-ui text-5xl font-bold text-accent/20 leading-none shrink-0 select-none">
                    {step}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-ui text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-foreground">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-ui text-3xl sm:text-4xl font-bold text-white mb-4">
            მზად ხარ შენი უნიკალური ნაქარგისთვის?
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            დაათვალიერე ჩვენი კოლექცია ან შექმენი სრულიად ინდივიდუალური ნაქარგი შენი დიზაინით.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/custom-order">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8">
                შექმენი შენი ნაქარგი
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                პროდუქციის კატალოგი
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
