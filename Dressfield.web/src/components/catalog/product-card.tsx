/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, getProductBySlug } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProductSummaryDto } from "@/types/catalog";

const fallbackImage = "/hero-embroidery.jpg";

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const detailQuery = useQuery({
    queryKey: ["product-detail", product.slug],
    queryFn: () => getProductBySlug(product.slug),
    enabled: isHovered,
    staleTime: Infinity,
  });

  const images =
    detailQuery.data?.images && detailQuery.data.images.length > 0
      ? [...detailQuery.data.images].sort((a, b) => a.sortOrder - b.sortOrder)
      : null;

  const currentImageUrl = images
    ? (images[currentIndex]?.imageUrl ?? product.primaryImageUrl ?? fallbackImage)
    : (product.primaryImageUrl ?? fallbackImage);

  const imageCount = images?.length ?? 1;
  const displayPrice = product.effectivePrice ?? product.basePrice;
  const hasSale = product.isOnSale && product.salePercentage > 0 && displayPrice < product.basePrice;

  function handlePrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? imageCount - 1 : i - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i === imageCount - 1 ? 0 : i + 1));
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      imageUrl: product.primaryImageUrl || undefined,
    });

    trackAddToCart({
      contentId: String(product.id),
      contentName: product.name,
      value: displayPrice,
      quantity: 1,
    });

    toast.success(`${product.name} კალათაში დაემატა`, {
      duration: 2500,
    });
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentIndex(0); }}
    >
      <div className="relative block aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl">
        <Link
          href={{ pathname: "/product", query: { slug: product.slug } }}
          className="block h-full w-full"
        >
          <img
            src={currentImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(event) => {
              const img = event.currentTarget;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = fallbackImage;
            }}
          />
        </Link>

        {/* Prev / Next arrows — only when multiple images loaded */}
        {imageCount > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="წინა ფოტო"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/85 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="შემდეგი ფოტო"
            >
              <ChevronRight className="h-4 w-4 text-gray-800" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images!.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    i === currentIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}

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

        {hasSale && (
          <div className="absolute top-3 right-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            -{Math.round(product.salePercentage)}%
          </div>
        )}
      </div>

      <div className="flex flex-col pt-4 pb-2 px-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link
            href={{ pathname: "/product", query: { slug: product.slug } }}
            className="block flex-1"
          >
            <h3 className="font-ui text-sm font-medium text-gray-900 group-hover:text-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col items-end leading-none">
            {hasSale ? (
              <span className="mb-1 text-xs text-gray-400 line-through tabular-nums">
                {formatPrice(product.basePrice)}
              </span>
            ) : null}
            <span className="font-ui text-base font-bold text-gray-900 tabular-nums">
              {formatPrice(displayPrice)}
            </span>
          </div>
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
