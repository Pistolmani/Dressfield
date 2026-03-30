"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";

function EditProductInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const productId = id ? Number(id) : undefined;

  if (!productId || Number.isNaN(productId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-destructive/40 bg-white p-6 text-sm text-destructive">
          პროდუქტის ID არ არის მითითებული.
        </div>
      </div>
    );
  }

  return <ProductEditor productId={productId} />;
}

export default function EditAdminProductPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="rounded-3xl border border-black/8 bg-white p-6 text-sm text-muted-foreground">
            იტვირთება...
          </div>
        </div>
      }
    >
      <EditProductInner />
    </Suspense>
  );
}
