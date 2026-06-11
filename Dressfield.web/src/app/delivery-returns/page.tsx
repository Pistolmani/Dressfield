import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/config/business";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dressfield.ge";

export const metadata: Metadata = {
  title: "მიწოდება და დაბრუნება",
  description:
    "DressField-ის მიწოდების, შეკვეთის გაუქმების, დაბრუნებისა და თანხის დაბრუნების პოლიტიკა.",
  alternates: {
    canonical: "/delivery-returns",
  },
  openGraph: {
    title: "მიწოდება და დაბრუნება — DressField",
    description:
      "მიწოდების, გაუქმების, დაბრუნებისა და თანხის დაბრუნების პირობები.",
    type: "website",
    locale: "ka_GE",
    siteName: "DressField",
    url: `${siteUrl}/delivery-returns`,
  },
};

export default function DeliveryReturnsPage() {
  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <nav className="text-sm text-black/50 mb-8">
          <Link href="/" className="hover:text-black/80 transition-colors">
            მთავარი
          </Link>
          {" / "}
          <span className="text-black/80">მიწოდება და დაბრუნება</span>
        </nav>

        <h1 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          მიწოდება და დაბრუნება
        </h1>
        <p className="text-sm text-black/50 mb-10">
          ბოლო განახლება: 2026 წელი
        </p>

        <div className="space-y-8 text-base leading-relaxed text-black/80">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. მიწოდება</h2>
            <ul className="space-y-1 list-disc pl-5">
              <li>მიწოდება ხდება კურიერის მეშვეობით, საქართველოს მთელ ტერიტორიაზე.</li>
              <li>
                მიწოდების სავარაუდო ვადაა {BUSINESS.deliveryDays} შეკვეთის
                დადასტურებისა და (ინდივიდუალური შეკვეთის შემთხვევაში) დამზადების
                დასრულების შემდეგ.
              </li>
              <li>
                მიწოდების ზუსტი ღირებულება და ვადა დამოკიდებულია ლოკაციაზე და
                ჩანს შეკვეთის გაფორმებისას.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. შეკვეთის გაუქმება</h2>
            <p>
              შეკვეთის გაუქმება შესაძლებელია უფასოდ, სანამ დამზადება/გაგზავნა არ
              დაწყებულა. ინდივიდუალური (პერსონალური ქარგვის) შეკვეთის გაუქმება
              შესაძლებელია მხოლოდ დამზადების დაწყებამდე. გასაუქმებლად დაგვიკავშირდით:{" "}
              {BUSINESS.email} ან {BUSINESS.phone}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. დაბრუნება</h2>
            <p className="font-medium text-black">მზა (არაპერსონალური) პროდუქცია</p>
            <p>
              მზა პროდუქციის დაბრუნება შესაძლებელია მიღებიდან 14 კალენდარული დღის
              განმავლობაში, თუ ნივთი გამოუყენებელია, თავდაპირველ მდგომარეობასა და
              შეფუთვაშია. დაბრუნების ტრანსპორტირების ხარჯს ფარავს მომხმარებელი, გარდა
              იმ შემთხვევისა, როცა ნივთი დეფექტურია ან არასწორად გამოიგზავნა.
            </p>
            <p className="mt-4 font-medium text-black">ინდივიდუალური / პერსონალური ქარგვა</p>
            <p>
              ინდივიდუალურად, მომხმარებლის დიზაინით დამზადებული ნაქარგი
              <strong> არ ექვემდებარება დაბრუნებას ან თანხის დაბრუნებას</strong>,
              ვინაიდან ის იქმნება კონკრეტული შეკვეთისთვის. გამონაკლისია ნივთის
              დეფექტი ან ჩვენი მხრიდან დაშვებული შეცდომა (იხ. პუნქტი 5).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. თანხის დაბრუნება</h2>
            <p>
              დამტკიცებული დაბრუნების შემთხვევაში თანხა უბრუნდება იმავე ბარათს,
              რომლითაც განხორციელდა გადახდა, საქართველოს ბანკის iPay სისტემის
              მეშვეობით. თანხის ჩარიცხვას, როგორც წესი, სჭირდება რამდენიმე სამუშაო
              დღე ბანკის რეგლამენტის შესაბამისად.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">5. დეფექტური ან არასწორი ნივთი</h2>
            <p>
              თუ მიღებული ნივთი დაზიანებული, დეფექტური ან შეკვეთისგან განსხვავებულია,
              გთხოვთ მიღებიდან 48 საათში დაგვიკავშირდეთ {BUSINESS.email}-ზე და
              მოგვაწოდოთ ფოტო. ასეთ შემთხვევაში ჩვენ ვფარავთ ხარჯებს და გთავაზობთ
              შეცვლას ან თანხის სრულ დაბრუნებას.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">6. კონტაქტი</h2>
            <p>
              მიწოდებასა და დაბრუნებაზე შეკითხვები: {BUSINESS.email} /{" "}
              {BUSINESS.phone}. იხილეთ აგრეთვე{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:no-underline">
                წესები და პირობები
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
