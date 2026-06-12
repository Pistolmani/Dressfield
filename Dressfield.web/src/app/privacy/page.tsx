import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, BUSINESS_LEGAL_LINE } from "@/config/business";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "კონფიდენციალურობის პოლიტიკა",
  description:
    "როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს პერსონალურ მონაცემებს DressField-ის ვებგვერდზე.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "კონფიდენციალურობის პოლიტიკა — DressField",
    description:
      "როგორ ვამუშავებთ და ვიცავთ თქვენს პერსონალურ მონაცემებს.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <nav className="text-sm text-black/50 mb-8">
          <Link href="/" className="hover:text-black/80 transition-colors">
            მთავარი
          </Link>
          {" / "}
          <span className="text-black/80">კონფიდენციალურობის პოლიტიკა</span>
        </nav>

        <h1 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="text-sm text-black/50 mb-10">
          ბოლო განახლება: 2026 წელი
        </p>

        <div className="space-y-8 text-base leading-relaxed text-black/80">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. ვინ ვართ ჩვენ</h2>
            <p>
              მონაცემთა დამმუშავებელია {BUSINESS.legalForm} {BUSINESS_LEGAL_LINE}
              (ვებგვერდი {siteUrl}). წინამდებარე პოლიტიკა განმარტავს, თუ რა
              პერსონალურ მონაცემებს ვაგროვებთ და როგორ ვამუშავებთ მათ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. რა მონაცემებს ვაგროვებთ</h2>
            <ul className="space-y-1 list-disc pl-5">
              <li>საიდენტიფიკაციო და საკონტაქტო მონაცემები: სახელი, გვარი, ტელეფონი, ელ-ფოსტა;</li>
              <li>მიწოდების მისამართი;</li>
              <li>შეკვეთის ინფორმაცია და ინდივიდუალური შეკვეთისთვის ატვირთული დიზაინი/სურათები;</li>
              <li>ვებგვერდით სარგებლობის ტექნიკური მონაცემები (მაგ. ბრაუზერი, მოწყობილობა, ქუქი-ფაილები).</li>
            </ul>
            <p className="mt-3">
              ბარათის (გადახდის) მონაცემებს ვებგვერდზე <strong>არ ვაგროვებთ და არ
              ვინახავთ</strong> — გადახდას ამუშავებს საქართველოს ბანკი (iPay)
              უსაფრთხო გარემოში.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. რისთვის ვიყენებთ მონაცემებს</h2>
            <ul className="space-y-1 list-disc pl-5">
              <li>შეკვეთის დამუშავება, დამზადება და მიწოდება;</li>
              <li>თქვენთან კომუნიკაცია შეკვეთის სტატუსზე;</li>
              <li>მომსახურების გაუმჯობესება და ვებგვერდის გამართული მუშაობა;</li>
              <li>კანონით დადგენილი ვალდებულებების შესრულება.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. ქუქი-ფაილები და ანალიტიკა</h2>
            <p>
              ვებგვერდი იყენებს ქუქი-ფაილებს და ანალიტიკურ ხელსაწყოებს — Google
              Analytics-ს და Meta Pixel-ს — სტატისტიკისა და სარეკლამო
              ეფექტიანობის გასაზომად. ეს ხელსაწყოები აგროვებენ აგრეგირებულ,
              არაიდენტიფიცირებად მონაცემებს ვებგვერდით სარგებლობის შესახებ. ქუქი-
              ფაილების მიღებაზე კონტროლი შეგიძლიათ ბრაუზერის პარამეტრებიდან.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. მონაცემთა გაზიარება</h2>
            <p>
              მონაცემებს ვუზიარებთ მხოლოდ იმ პარტნიორებს, რომლებიც აუცილებელია
              მომსახურების გასაწევად — გადახდის პროვაიდერს (საქართველოს ბანკი) და
              საკურიერო/მიწოდების სამსახურს. მონაცემებს არ ვყიდით მესამე პირებზე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. შენახვის ვადა და უსაფრთხოება</h2>
            <p>
              მონაცემებს ვინახავთ მხოლოდ იმდენ ხანს, რამდენიც საჭიროა შეკვეთის
              შესასრულებლად და კანონით დადგენილი ვალდებულებების დასაკმაყოფილებლად.
              ვიყენებთ გონივრულ ტექნიკურ და ორგანიზაციულ ზომებს მონაცემთა დასაცავად.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. თქვენი უფლებები</h2>
            <p>
              თქვენ გაქვთ უფლება მოითხოვოთ თქვენი პერსონალური მონაცემების ნახვა,
              შესწორება ან წაშლა. ამისთვის დაგვიკავშირდით: {BUSINESS.email}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. კონტაქტი</h2>
            <p>
              კონფიდენციალურობასთან დაკავშირებული შეკითხვები: {BUSINESS.email} /{" "}
              {BUSINESS.phone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
