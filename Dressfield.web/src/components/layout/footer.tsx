import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="relative z-10 bg-footer-bg text-footer-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Logo className="h-7 w-auto text-white mb-3" />
            <p className="max-w-sm text-base leading-relaxed">
              ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და
              ინდივიდუალური შეკვეთები.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-3">ნავიგაცია</h4>
            <nav className="flex flex-col gap-2 text-base">
              <Link href="/" className="hover:text-white/70 transition-colors">
                მთავარი
              </Link>
              <Link
                href="/products"
                className="hover:text-white/70 transition-colors"
              >
                პროდუქცია
              </Link>
              <Link
                href="/custom-order"
                className="hover:text-white/70 transition-colors"
              >
                შეკვეთა
              </Link>
              <Link
                href="/about"
                className="hover:text-white/70 transition-colors"
              >
                ჩვენ შესახებ
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-3">კონტაქტი</h4>
            <div className="flex flex-col gap-2.5 text-base">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+995511226148" className="hover:text-white/70 transition-colors">+995 511 226 148</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@dressfield.ge" className="hover:text-white/70 transition-colors">contact@dressfield.ge</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>თბილისი, საქართველო</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com/dressfield.stitch/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DressField Instagram"
                className="inline-flex items-center gap-2 hover:text-white/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-medium">Dressfield</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-white/10" />

        <p className="text-center text-sm text-footer-text/70">
          &copy; {new Date().getFullYear()} {" "}<span className="font-brand-text">DressField</span>. ყველა უფლება
          დაცულია.
        </p>
      </div>
    </footer>
  );
}
