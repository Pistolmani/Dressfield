"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailedContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
      <XCircle className="h-20 w-20 text-red-500 mb-6" />

      <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold mb-2">
        გადახდა ვერ მოხერხდა
      </h1>

      {orderId && (
        <p className="text-muted-foreground text-lg mb-2">
          შეკვეთა{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>{" "}
          ჯერ არ არის დადასტურებული.
        </p>
      )}

      <p className="text-muted-foreground max-w-md mb-8">
        სცადეთ თავიდან ან დაგვიკავშირდით.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/checkout">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            თავიდან სცადეთ
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            მთავარ გვერდზე
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
