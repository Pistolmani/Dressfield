/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";
import type { ProductSummaryDto } from "@/types/catalog";

const fallbackImage = "/hero-embroidery.jpg";

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const addItem = useCartStore((state) => state.addItem);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      quantity: 1,
      imageUrl: product.primaryImageUrl || undefined,
    });

    trackAddToCart({
      contentId: String(product.id),
      contentName: product.name,
      value: product.basePrice,
      quantity: 1,
    });

    toast.success(`${product.name} კალათაში დაემატა`, {
      duration: 2500,
    });
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-black/8 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
          <img
            src={product.primaryImageUrl || fallbackImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(event) => {
              const img = event.currentTarget;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = fallbackImage;
            }}
          />
          {product.isFeatured ? (
            <Badge className="absolute left-3 top-3 bg-accent text-white hover:bg-accent">
              რჩეული
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col p-4">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <h3 className="mb-1 line-clamp-2 font-ui text-sm font-semibold tracking-[0.03em] text-foreground">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-ui text-lg font-bold text-accent">
              {formatPrice(product.basePrice)}
            </span>
            <p className="text-xs text-muted-foreground">
              რამდენიმე ზომა
            </p>
          </div>
          <Button
            size="sm"
            className="bg-accent text-xs text-white hover:bg-accent-hover"
            onClick={handleAddToCart}
          >
            კალათაში
          </Button>
        </div>
      </div>
    </article>
  );
}
