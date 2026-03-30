"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-4">
      <h1 className="font-ui text-4xl font-semibold">შეცდომა მოხდა</h1>
      <p className="text-muted-foreground max-w-sm">
        დაფიქსირდა მოულოდნელი შეცდომა. გთხოვთ სცადოთ თავიდან.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-accent text-white hover:bg-accent-hover">
          თავიდან ცდა
        </Button>
        <Link href="/">
          <Button variant="outline">მთავარი გვერდი</Button>
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 mt-2">
          კოდი: {error.digest}
        </p>
      )}
    </div>
  );
}
