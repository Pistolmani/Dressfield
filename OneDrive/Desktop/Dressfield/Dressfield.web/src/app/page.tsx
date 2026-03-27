import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold font-[family-name:var(--font-inter)] tracking-tight">
          <span className="text-accent">●</span>DRESS
          <span className="font-normal">Field</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
          ქართული ნაქარგების ონლაინ მაღაზია. მზა პროდუქცია და
          ინდივიდუალური შეკვეთები.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button className="bg-accent hover:bg-accent-hover text-accent-foreground px-8 py-3 text-base">
              პროდუქციის ნახვა
            </Button>
          </Link>
          <Link href="/custom-order">
            <Button
              variant="outline"
              className="px-8 py-3 text-base border-accent text-accent hover:bg-accent-light"
            >
              ინდივიდუალური შეკვეთა
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
