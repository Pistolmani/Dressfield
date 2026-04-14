/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, getProductBySlug } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProductSummaryDto, ProductVariantDto } from "@/types/catalog";

const fallbackImage = "/dressfield-fallback.jpg";

function isSizeVariant(variant: ProductVariantDto): boolean {
  const n = variant.name?.trim().toLowerCase() ?? "";
  return n.includes("size") || n.includes("ზომ");
}

export function ProductCard({ product }: { product: ProductSummaryDto }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Fetch product detail eagerly to get variants — cached per session
  const detailQuery = useQuery({
    queryKey: ["product-detail", product.slug],
    queryFn: () => getProductBySlug(product.slug),
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

  // Size variants from the loaded detail
  const sizeVariants = detailQuery.data?.variants
    ? detailQuery.data.variants.filter((v) => v.isActive && isSizeVariant(v))
    : [];
  const hasVariants = sizeVariants.length > 0;
  const needsSizeSelection = hasVariants && selectedVariantId === null;

  const selectedVariant = sizeVariants.find((v) => v.id === selectedVariantId);
  const priceAdjustment = selectedVariant?.priceAdjustment ?? 0;
  const finalPrice = displayPrice + priceAdjustment;

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

  function handleSizeSelect(variantId: number) {
    setSelectedVariantId((prev) => (prev === variantId ? null : variantId));
  }

  function handleAddToCart() {
    if (hasVariants && needsSizeSelection) {
      toast.error("აირჩიე ზომა");
      return;
    }

    const variantLabel = selectedVariant
      ? `${selectedVariant.name}: ${selectedVariant.value || selectedVariant.name}`
      : undefined;

    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariantId ?? undefined,
      name: product.name,
      variantLabel,
      price: finalPrice,
      quantity: 1,
      imageUrl: product.primaryImageUrl || undefined,
    });

    trackAddToCart({
      contentId: String(product.id),
      contentName: product.name,
      value: finalPrice,
      quantity: 1,
    });

    toast.success(
      `${product.name}${selectedVariant ? ` (${selectedVariant.value ?? ""})` : ""} კალათაში დაემატა`,
      { duration: 2500 }
    );

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentIndex(0); }}
    >
      {/* ── Image ── */}
      <div className="relative block aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl">
        <Link
          href={{ pathname: "/product", query: { slug: product.slug } }}
          className="block h-full w-full"
        >
          <img
            src={currentImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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

        {/* Prev / Next arrows */}
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
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

      {/* ── Info ── */}
      <div className="flex flex-col pt-4 pb-2 px-1 gap-3">
        {/* Name & Price */}
        <div className="flex justify-between items-start gap-2">
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

        {/* ── Size chips ── */}
        {detailQuery.isLoading ? (
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 w-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : hasVariants ? (
          <div className="flex flex-wrap gap-1.5">
            {sizeVariants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              const outOfStock = v.stockQuantity === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => !outOfStock && handleSizeSelect(v.id)}
                  disabled={outOfStock}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 border",
                    isSelected
                      ? "bg-accent text-white border-accent shadow-sm"
                      : outOfStock
                        ? "bg-gray-50 text-gray-300 border-gray-100 line-through cursor-not-allowed"
                        : "bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent"
                  )}
                >
                  {v.value || v.name}
                </button>
              );
            })}
          </div>
        ) : detailQuery.data ? (
          <p className="text-[11px] text-gray-400 font-medium">
            ერთი ზომა
          </p>
        ) : null}

        {/* ── Add to Cart ── */}
        <Button
          size="sm"
          className={cn(
            "w-full rounded-xl font-bold transition-all duration-300",
            addedFeedback
              ? "bg-green-500 text-white hover:bg-green-500"
              : needsSizeSelection
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                : "bg-accent text-white hover:bg-accent-hover"
          )}
          onClick={handleAddToCart}
        >
          {addedFeedback ? (
            "✓ დაემატა"
          ) : needsSizeSelection ? (
            "აირჩიე ზომა"
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              კალათაში
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
