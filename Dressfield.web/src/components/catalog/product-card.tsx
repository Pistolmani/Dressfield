/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
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
    <article className="group relative flex flex-col overflow-hidden bg-white transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl">
        <img
          src={product.primaryImageUrl || fallbackImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallbackApplied === "1") return;
            img.dataset.fallbackApplied = "1";
            img.src = fallbackImage;
          }}
        />
        
        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
          <Button
            size="sm"
            className="w-full bg-white text-black hover:bg-white/90 rounded-full font-bold shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            კალათაში
          </Button>
        </div>

        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-black">
            რჩეული
          </div>
        )}
      </Link>

      <div className="flex flex-col pt-4 pb-2 px-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link href={`/products/${product.slug}`} className="block flex-1">
            <h3 className="font-ui text-sm font-medium text-gray-900 group-hover:text-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <span className="font-ui text-base font-bold text-gray-900 tabular-nums">
            {formatPrice(product.basePrice)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
            ზომები: S, M, L, XL, XXL
          </p>
        </div>
      </div>
    </article>
  );
}
