/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import type { ProductSummaryDto } from "@/types/catalog";

const fallbackImage = "/dressfield-fallback.jpg";

export function ProductList({
  products,
  loading = false,
}: {
  products: ProductSummaryDto[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-black/8 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-4 p-4 border-b border-black/8 last:border-b-0 animate-pulse">
            <div className="h-24 w-24 rounded bg-black/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-black/10" />
              <div className="h-3 w-1/2 rounded bg-black/10" />
            </div>
            <div className="h-10 w-20 rounded bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-black/8 bg-white shadow-sm overflow-hidden">
      {products.map((product) => {
        const displayPrice = product.effectivePrice ?? product.basePrice;
        const hasSale = product.isOnSale && product.salePercentage > 0 && displayPrice < product.basePrice;

        return (
          <div
            key={product.id}
            className="flex gap-4 p-4 border-b border-black/8 last:border-b-0 hover:bg-black/2 transition-colors"
          >
          <Link
            href={`/products/${product.slug}`}
            className="flex-shrink-0"
          >
            <img
              src={product.primaryImageUrl || fallbackImage}
              alt={product.name}
              className="h-24 w-24 object-cover rounded-md"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                const img = event.currentTarget;
                if (img.dataset.fallbackApplied === "1") return;
                img.dataset.fallbackApplied = "1";
                img.src = fallbackImage;
              }}
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="block"
            >
              <h3 className="font-ui text-base font-semibold text-foreground truncate hover:underline">
                {product.name}
              </h3>
            </Link>
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.shortDescription}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              რამდენიმე ზომა
            </p>
          </div>

          <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-end leading-none">
              {hasSale ? (
                <span className="mb-1 text-xs text-gray-400 line-through whitespace-nowrap">
                  {formatPrice(product.basePrice)}
                </span>
              ) : null}
              <span className="font-ui text-lg font-bold text-accent whitespace-nowrap">
                {formatPrice(displayPrice)}
              </span>
            </div>
            <Link href={`/products/${product.slug}`}>
              <Button
                size="sm"
                className="bg-accent text-xs text-white hover:bg-accent-hover whitespace-nowrap"
              >
                დეტალები
              </Button>
            </Link>
          </div>
          </div>
        );
      })}
    </div>
  );
}
