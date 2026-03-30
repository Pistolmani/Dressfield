/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/catalog";
import type { ProductSummaryDto } from "@/types/catalog";

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
          <img
            src={product.primaryImageUrl || fallbackImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
          {product.isFeatured ? (
            <Badge className="absolute left-4 top-4 bg-accent text-white hover:bg-accent">
              რჩეული
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-ui text-3xl font-semibold tracking-[0.04em]">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-2 min-h-12 text-sm text-muted-foreground">
            {product.shortDescription || "დეტალები ხელმისაწვდომია პროდუქტის გვერდზე."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-ui text-2xl font-semibold text-accent">
            {formatPrice(product.basePrice)}
          </span>
          <Button
            className="bg-accent px-4 text-white hover:bg-accent-hover"
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.basePrice,
                quantity: 1,
                imageUrl: product.primaryImageUrl || undefined,
              })
            }
          >
            კალათაში დამატება
          </Button>
        </div>
      </div>
    </article>
  );
}
