import Link from "next/link";

// Georgian-language FAQ targeting the search term "ქარგვა" and its variants.
// Doubles as crawlable keyword-rich content and a FAQPage rich-result source.
const faqs = [
  {
    question: "რატომ უნდა ავირჩიო ნაქარგი და არა პრინტი?",
    answer:
      "ნაქარგი არ ხუნდება, არ სკდება და არ ძვრება გარეცხვის შემდეგ. DressField-ში ჩვენ ვიყენებთ პრემიუმ ხარისხის მყარ ძაფებს, რაც უზრუნველყოფს, რომ შენი დიზაინი წლების განმავლობაში შეინარჩუნებს თავდაპირველ ფაქტურასა და ფერს. ეს არის პირდაპირი ინვესტიცია ხარისხსა და გამძლეობაში.",
  },
  {
    question: "როგორ მუშაობს ონლაინ-პრევიუ (Live-Preview) ფუნქცია?",
    answer:
      "ეს ჩვენი მთავარი უპირატესობაა! ნაცვლად ბრმად შეკვეთისა, უბრალოდ ატვირთე შენი დიზაინი (ლოგო, წარწერა თუ ილუსტრაცია) ჩვენს საიტზე და რეალურ დროში დაინახავ, ზუსტად როგორ დაჯდება ის შერჩეულ სამოსზე. რასაც ხედავ ეკრანზე, ზუსტად იმ ხარისხს იღებ რეალობაში.",
  },
  {
    question: "როგორ დგინდება ინდივიდუალური შეკვეთის ფასი?",
    answer:
      "არანაირი ფარული ხარჯი და ფასის ლოდინი. ღირებულება ავტომატურად ითვლება ჩვენი სისტემის მიერ დიზაინის ზომის, სირთულისა და ნაკერების რაოდენობის მიხედვით. როგორც კი ატვირთავ დიზაინს ჩვენს პლატფორმაზე, ეკრანზე მაშინვე გამოჩნდება ზუსტი ფასი.",
  },
  {
    question: "რა განსხვავებაა მანქანურ და ხელით ქარგვას შორის?",
    answer:
      "მანქანური ქარგვა უზრუნველყოფს მილიმეტრულ სიზუსტეს, რაც იდეალურია დეტალური ვექტორული დიზაინების, ლოგოებისა და კორპორაციული შეკვეთებისთვის. ხელით ქარგვა კი ექსკლუზიური პროცესია — ის საუკეთესოა უნიკალური, სენტიმენტალური საჩუქრებისთვის, სადაც ადამიანის ხელის შეხება და ავთენტურობა ფასობს.",
  },
  {
    question: "რომელ პროდუქტებზეა შესაძლებელი დიზაინის დატანა?",
    answer:
      "ჩვენ გთავაზობთ მაღალი ხარისხის საბაზისო ტანსაცმელს, რომელიც სპეციალურად არის შერჩეული ნაქარგის ფაქტურისთვის. შეგიძლია აირჩიო პრემიუმ ხარისხის ჰუდები, სვიტერები, მაისურები და კეპები.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function EmbroideryFaq() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-black/50 mb-4">
            ხშირად დასმული კითხვები
          </p>
          <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-black">
            რა უნდა იცოდე
          </h2>
          <p className="text-base text-black/55 mb-12">
            ყველაფერი ნაქარგზე, ფასებსა და შეკვეთის პროცესზე — ერთ ადგილას.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-black/10 bg-white px-5 sm:px-6 shadow-sm transition-colors open:border-black/20 open:shadow-md hover:border-black/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base sm:text-lg font-semibold text-black [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg leading-none text-black/50 transition-all duration-300 group-open:rotate-45 group-open:bg-black group-open:text-white"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-black/65">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-black/90"
          >
            აქციე შენი იდეა რეალობად
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
