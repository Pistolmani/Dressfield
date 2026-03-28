/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts, formatPrice } from "@/lib/catalog";
import { useCustomOrderStore } from "@/stores/custom-order-store";

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

export function ProductPickerStep() {
  const setStep = useCustomOrderStore((state) => state.setStep);
  const setSelectedProduct = useCustomOrderStore((state) => state.setSelectedProduct);
  const storedProduct = useCustomOrderStore((state) => state.selectedProduct);
  const [selectedId, setSelectedId] = useState<number | "blank">(
    storedProduct?.id ?? "blank"
  );

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  function handleContinue() {
    const selectedProduct =
      selectedId === "blank"
        ? null
        : (productsQuery.data || []).find((product) => product.id === selectedId) || null;

    setSelectedProduct(selectedProduct);
    setStep(2);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight">
          აირჩიეთ საბაზო პროდუქტი
        </h1>
        <p className="text-muted-foreground">
          ან გამოტოვეთ ცარიელი ტილოს შესაქმნელად
        </p>
      </div>

      {productsQuery.isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-white p-6 text-destructive">
          პროდუქტების ჩატვირთვა ვერ მოხერხდა.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => setSelectedId("blank")}
            className={`rounded-3xl border-2 border-dashed bg-white p-5 text-left shadow-sm transition ${
              selectedId === "blank" ? "ring-2 ring-accent ring-offset-2" : "border-black/20"
            }`}
          >
            <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-black/[0.03]">
              <Palette className="h-10 w-10 text-accent" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="font-[family-name:var(--font-inter)] text-lg font-semibold">
                ცარიელი ტილო
              </p>
              <p className="text-sm text-muted-foreground">
                ატვირთე დიზაინი დამოუკიდებელი მაკეტისათვის
              </p>
            </div>
          </button>

          {productsQuery.isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-black/8 bg-white p-4 shadow-sm">
                  <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))
            : productsQuery.data?.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  className={`rounded-3xl border border-black/8 bg-white p-4 text-left shadow-sm transition ${
                    selectedId === product.id ? "ring-2 ring-accent ring-offset-2" : ""
                  }`}
                >
                  <img
                    src={product.primaryImageUrl || fallbackImage}
                    alt={product.name}
                    className="aspect-[4/5] w-full rounded-3xl object-cover"
                  />
                  <div className="mt-4 space-y-1">
                    <p className="font-[family-name:var(--font-inter)] text-lg font-semibold">
                      {product.name}
                    </p>
                    <p className="text-accent">{formatPrice(product.basePrice)}</p>
                  </div>
                </button>
              ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button className="bg-accent text-white hover:bg-accent-hover" onClick={handleContinue}>
          გაგრძელება
        </Button>
      </div>
    </div>
  );
}
