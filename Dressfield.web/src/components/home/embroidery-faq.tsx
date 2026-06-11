import Link from "next/link";

// Georgian-language FAQ targeting the search term "ქარგვა" and its variants.
// Doubles as crawlable keyword-rich content and a FAQPage rich-result source.
const faqs = [
  {
    question: "რა არის ქარგვა?",
    answer:
      "ქარგვა არის ქსოვილზე ძაფით ნახატის, ლოგოს ან წარწერის შესრულება. DressField გთავაზობთ როგორც ხელით ქარგვას, ისე მანქანურ ქარგვას ტანსაცმელზე, ქუდებსა და აქსესუარებზე.",
  },
  {
    question: "რა განსხვავებაა მანქანურ და ხელით ქარგვას შორის?",
    answer:
      "მანქანური ქარგვა სწრაფი და ზუსტია, იდეალურია ლოგოს ქარგვისა და სერიული შეკვეთებისთვის. ხელით ქარგვა უფრო დეტალური და უნიკალურია. ორივე შემთხვევაში ვიყენებთ მაღალი ხარისხის ძაფებს.",
  },
  {
    question: "როგორ შევუკვეთო ლოგოს ქარგვა ჩემს დიზაინზე?",
    answer:
      "ატვირთე შენი ლოგო ან დიზაინი ჩვენს პლატფორმაზე, ნახე live preview პროდუქტზე და დაადასტურე შეკვეთა. ჩვენ ამოვქარგავთ და მოგიტანთ მზა ნაქარგ პროდუქტს.",
  },
  {
    question: "რა ღირს ქარგვა შეკვეთით?",
    answer:
      "ქარგვის ფასი დამოკიდებულია დიზაინის ზომაზე, ფერების რაოდენობასა და პროდუქტზე. ზუსტი ფასის სანახავად ატვირთე დიზაინი ინდივიდუალური შეკვეთის გვერდზე.",
  },
  {
    question: "რა პროდუქტებზე შემიძლია ქარგვის შეკვეთა?",
    answer:
      "ვაკეთებთ ნაქარგს ჰუდიებზე, სვიტერებზე, მაისურებზე, ქუდებზე და სხვა ტანსაცმელზე. დაათვალიერე მზა ნაქარგების კოლექცია ან შექმენი ინდივიდუალური შეკვეთა.",
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
    <section className="bg-white py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-black/50 mb-4">
          ხშირად დასმული კითხვები
        </p>
        <h2 className="font-ui text-3xl sm:text-4xl font-bold tracking-tight mb-10 text-black">
          ქარგვა და ნაქარგი — რა უნდა იცოდე
        </h2>

        <div className="divide-y divide-black/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none text-lg font-semibold text-black flex items-center justify-between">
                {faq.question}
                <span className="ml-4 text-black/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-black/70">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/custom-order"
            className="text-sm font-semibold text-black underline underline-offset-4 hover:no-underline"
          >
            შეუკვეთე ქარგვა შენი დიზაინით →
          </Link>
        </div>
      </div>
    </section>
  );
}
