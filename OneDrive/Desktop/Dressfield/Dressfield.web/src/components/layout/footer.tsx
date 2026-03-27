import Link from "next/link";
import { Globe, Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white font-[family-name:var(--font-inter)] mb-3">
              <span className="text-accent">●</span>DRESS
              <span className="font-normal">Field</span>
            </h3>
            <p className="text-sm leading-relaxed">
              ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და
              ინდივიდუალური შეკვეთები.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-3">ნავიგაცია</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-accent transition-colors">
                მთავარი
              </Link>
              <Link
                href="/products"
                className="hover:text-accent transition-colors"
              >
                პროდუქცია
              </Link>
              <Link
                href="/categories"
                className="hover:text-accent transition-colors"
              >
                კატეგორიები
              </Link>
              <Link
                href="/custom-order"
                className="hover:text-accent transition-colors"
              >
                შეკვეთა
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">კონტაქტი</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+995 5XX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@dressfield.ge</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>თბილისი, საქართველო</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <p className="text-center text-xs text-footer-text/60">
          &copy; {new Date().getFullYear()} DressField. ყველა უფლება
          დაცულია.
        </p>
      </div>
    </footer>
  );
}
