import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, BUSINESS_LEGAL_LINE } from "@/config/business";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "წესები და პირობები",
  description:
    "DressField-ის ვებგვერდით სარგებლობის წესები და პირობები — შეკვეთა, გადახდა, ფასები და მომხმარებლის ვალდებულებები.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "წესები და პირობები — DressField",
    description:
      "DressField-ის ვებგვერდით სარგებლობის წესები და პირობები.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <nav className="text-sm text-black/50 mb-8">
          <Link href="/" className="hover:text-black/80 transition-colors">
            მთავარი
          </Link>
          {" / "}
          <span className="text-black/80">წესები და პირობები</span>
        </nav>

        <h1 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          წესები და პირობები
        </h1>
        <p className="text-sm text-black/50 mb-10">
          ბოლო განახლება: 2026 წელი
        </p>

        <div className="space-y-8 text-base leading-relaxed text-black/80">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. ზოგადი დებულებები</h2>
            <p>
              წინამდებარე წესები და პირობები არეგულირებს {BUSINESS.displayName}-ის
              ვებგვერდით ({siteUrl}) სარგებლობას. ვებგვერდით სარგებლობით თქვენ
              ეთანხმებით ამ წესებს. გთხოვთ, ყურადღებით გაეცნოთ მათ შეკვეთის
              განთავსებამდე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. მერჩანტის რეკვიზიტები</h2>
            <p>
              ვებგვერდს ოპერირებს {BUSINESS.legalForm} {BUSINESS_LEGAL_LINE}.
            </p>
            <ul className="mt-3 space-y-1">
              <li>დასახელება: {BUSINESS.displayName}</li>
              <li>იურიდიული ფორმა: ინდივიდუალური მეწარმე ({BUSINESS.legalForm})</li>
              <li>ელ-ფოსტა: {BUSINESS.email}</li>
              <li>ტელეფონი: {BUSINESS.phone}</li>
              <li>{BUSINESS.locationLabel}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. პროდუქცია და მომსახურება</h2>
            <p>
              {BUSINESS.displayName} გთავაზობთ მზა ნაქარგ პროდუქციას და
              ინდივიდუალური ქარგვის სერვისს. ინდივიდუალური შეკვეთისას მომხმარებელი
              ატვირთავს დიზაინს, ნახულობს ვიზუალურ პრევიუს და განათავსებს შეკვეთას.
              ვცდილობთ პროდუქტი მაქსიმალურად ზუსტად აღვწეროთ, თუმცა ფერების ასახვა
              შესაძლოა ეკრანის მიხედვით ოდნავ განსხვავდებოდეს.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. ფასები და გადახდა</h2>
            <p>
              ყველა ფასი მითითებულია ქართულ ლარში (GEL) და მოიცავს კანონით
              გათვალისწინებულ გადასახადებს. გადახდა ხორციელდება ონლაინ, საქართველოს
              ბანკის iPay სისტემით (ბარათით). ბარათის მონაცემებს ამუშავებს
              საქართველოს ბანკი — {BUSINESS.displayName} არ ინახავს და ვერ ხედავს
              თქვენი ბარათის სრულ მონაცემებს. იხილეთ აგრეთვე ჩვენი{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:no-underline">
                კონფიდენციალურობის პოლიტიკა
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. შეკვეთა და მიწოდება</h2>
            <p>
              შეკვეთის დადასტურებისა და გადახდის შემდეგ ვიწყებთ დამზადებას/მომზადებას.
              მიწოდების, გაუქმების, დაბრუნებისა და თანხის დაბრუნების პირობები
              დეტალურად აღწერილია გვერდზე{" "}
              <Link href="/delivery-returns" className="underline underline-offset-2 hover:no-underline">
                მიწოდება და დაბრუნება
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. ატვირთული დიზაინი და ინტელექტუალური საკუთრება</h2>
            <p>
              ინდივიდუალური შეკვეთისას ატვირთული დიზაინის გამოყენებით მომხმარებელი
              ადასტურებს, რომ მას აქვს შესაბამისი უფლება ამ მასალაზე და მისი
              ქარგვა/გამოყენება არ არღვევს მესამე პირის საავტორო ან სასაქონლო ნიშნის
              უფლებებს. იკრძალება უკანონო, შეურაცხმყოფელი ან მესამე პირის უფლებების
              დამრღვევი შინაარსის ატვირთვა. {BUSINESS.displayName} იტოვებს უფლებას
              უარი თქვას ასეთი შეკვეთის შესრულებაზე.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">7. პასუხისმგებლობის შეზღუდვა</h2>
            <p>
              {BUSINESS.displayName} არ აგებს პასუხს მომხმარებლის მიერ მოწოდებული
              არასწორი ინფორმაციით (მაგ. არასწორი მისამართი, დიზაინი ან ზომა)
              გამოწვეულ შეფერხებაზე ან შეცდომაზე. ჩვენი პასუხისმგებლობა შემოიფარგლება
              შესაბამისი შეკვეთის ღირებულებით.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">8. მოქმედი კანონმდებლობა</h2>
            <p>
              წინამდებარე წესები რეგულირდება საქართველოს კანონმდებლობით. ნებისმიერი
              დავა გადაწყდება მოლაპარაკების გზით, ხოლო შეთანხმების მიუღწევლობის
              შემთხვევაში — საქართველოს სასამართლოების მეშვეობით.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">9. კონტაქტი</h2>
            <p>
              შეკითხვების შემთხვევაში დაგვიკავშირდით: {BUSINESS.email} ან{" "}
              {BUSINESS.phone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
