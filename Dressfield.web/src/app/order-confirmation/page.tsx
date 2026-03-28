"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const isMock = params.get("mock") === "1";

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />

      <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold mb-2">
        შეკვეთა წარმატებით გაფორმდა!
      </h1>

      {orderId && (
        <p className="text-muted-foreground text-lg mb-2">
          თქვენი შეკვეთის ნომერია{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>
        </p>
      )}

      <p className="text-muted-foreground max-w-md mb-8">
        გადახდის დადასტურების შემდეგ მიიღებთ შეკვეთის დეტალებს.
      </p>

      {isMock && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
          (Dev: mock payment — no real transaction)
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">
            საყიდლები გაგრძელება
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
