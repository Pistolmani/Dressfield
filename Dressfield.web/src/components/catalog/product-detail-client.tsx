/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Minus, Plus, RotateCcw, Shield, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import { formatPrice } from "@/lib/catalog";
import { useCartStore } from "@/stores/cart-store";
import type { ProductDetailDto } from "@/types/catalog";

const fallbackImage = "/dressfield-fallback.jpg";

function groupVariants(product: ProductDetailDto) {
  const groups = new Map<string, ProductDetailDto["variants"]>();

  for (const variant of product.variants.filter((item) => item.isActive)) {
    const current = groups.get(variant.name) ?? [];
    current.push(variant);
    groups.set(variant.name, current);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}

function isSizeGroup(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized.includes("size") || normalized.includes("ზომ") || normalized.includes("áƒ–áƒáƒ›");
}

export function ProductDetailClient({ product }: { product: ProductDetailDto }) {
  const addItem = useCartStore((state) => state.addItem);

  const images = useMemo(() => {
    const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.length > 0
      ? sorted
      : [
          {
            id: 0,
            imageUrl: fallbackImage,
            altText: product.name,
            sortOrder: 0,
            isPrimary: true,
          },
        ];
  }, [product.images, product.name]);

  const variantGroups = useMemo(() => groupVariants(product), [product]);

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      variantGroups
        .map((group) => {
          if (isSizeGroup(group.name)) return null;
          return [group.name, group.items[0]?.id] as const;
        })
        .filter((entry): entry is readonly [string, number] => Boolean(entry && entry[1]))
    )
  );

  const selectedVariantItems = variantGroups
    .map((group) => group.items.find((item) => item.id === selectedVariants[group.name]))
    .filter((item): item is ProductDetailDto["variants"][number] => Boolean(item));

  const sizeGroups = variantGroups.filter((group) => isSizeGroup(group.name));
  const missingRequiredSize = sizeGroups.some((group) => !selectedVariants[group.name]);

  const variantAdjustmentsTotal = selectedVariantItems.reduce(
    (sum, item) => sum + item.priceAdjustment,
    0
  );
  const effectiveBasePrice = product.effectivePrice ?? product.basePrice;
  const totalPrice = effectiveBasePrice + variantAdjustmentsTotal;
  const originalTotalPrice = product.basePrice + variantAdjustmentsTotal;
  const hasSale = product.isOnSale && product.salePercentage > 0 && totalPrice < originalTotalPrice;

  useEffect(() => {
    trackViewContent({
      contentId: String(product.id),
      contentName: product.name,
      value: effectiveBasePrice,
    });
  }, [product.id, product.name, effectiveBasePrice]);

  const handleVariantSelect = useCallback(
    (groupName: string, variantId: number) => {
      const next = { ...selectedVariants, [groupName]: variantId };
      setSelectedVariants(next);
      try {
        sessionStorage.setItem(`pd_variants_${product.id}`, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
    },
    [product.id, selectedVariants]
  );

  const handleAddToCart = useCallback(() => {
    if (missingRequiredSize) {
      toast.error("აირჩიე ზომა");
      return;
    }

    const primaryVariant =
      selectedVariantItems.find((variant) => isSizeGroup(variant.name)) ?? selectedVariantItems[0];
    const variantLabel =
      selectedVariantItems.length > 0
        ? selectedVariantItems.map((v) => `${v.name}: ${v.value || v.name}`).join(", ")
        : undefined;

    addItem({
      productId: product.id,
      variantId: primaryVariant?.id,
      name: product.name,
      variantLabel,
      price: totalPrice,
      quantity,
      imageUrl: selectedImage.imageUrl,
    });

    trackAddToCart({
      contentId: String(product.id),
      contentName: product.name,
      value: totalPrice * quantity,
      quantity,
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  }, [
    addItem,
    missingRequiredSize,
    product.id,
    product.name,
    quantity,
    selectedImage.imageUrl,
    selectedVariantItems,
    totalPrice,
  ]);

  return (
    <div className="bg-background py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-black/8 bg-white">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.altText || product.name}
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-2xl border ${
                    selectedImage.id === image.id
                      ? "border-accent shadow-[0_0_0_2px_rgba(var(--accent),0.2)]"
                      : "border-black/8"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                    className="aspect-square h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                მთავარი
              </Link>
              <span>/</span>
              <Link href="/products" className="hover:text-foreground">
                პროდუქტები
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground">{product.name}</span>
            </nav>

            <div className="space-y-3 border-b border-black/8 pb-6">
              <h1 className="font-ui text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-end gap-3">
                  {hasSale ? (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(originalTotalPrice)}
                    </span>
                  ) : null}
                  <p className="font-ui text-4xl font-extrabold text-accent">{formatPrice(totalPrice)}</p>
                  {hasSale ? (
                    <span className="mb-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{Math.round(product.salePercentage)}%
                    </span>
                  ) : null}
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-gray-400">
                    მიწოდება
                  </span>
                  <span className="text-xs font-semibold text-green-600">1-3 სამუშაო დღე</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg bg-black/2 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">ხელმისაწვდომი</p>
                <p className="text-sm font-medium text-green-600">მარაგშია</p>
              </div>
              <div className="flex flex-col gap-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">დღე 1-3</p>
              </div>
              <div className="flex flex-col gap-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">100% ნატურალური</p>
              </div>
            </div>

            {variantGroups.length > 0 ? (
              <div className="space-y-6 border-b border-black/8 pb-6 pt-2">
                {variantGroups.map((group) => {
                  const isSize =
                    group.name.toLowerCase().includes("ზომა") ||
                    group.name.toLowerCase().includes("size");

                  return (
                    <div key={group.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold uppercase tracking-tight text-gray-900">
                          {group.name}
                        </label>
                        {isSize ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-accent underline-offset-4 hover:underline decoration-accent/30"
                          >
                            ზომების ცხრილი
                          </button>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {group.items.map((variant) => {
                          const isSelected = selectedVariants[group.name] === variant.id;
                          const outOfStock = variant.stockQuantity === 0;

                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={outOfStock}
                              onClick={() => handleVariantSelect(group.name, variant.id)}
                              className={`relative rounded-xl border-2 px-5 py-3 transition-all duration-200 ${
                                isSelected
                                  ? "border-accent bg-accent/5 font-bold text-accent shadow-[0_0_0_1px_rgba(var(--accent),0.1)]"
                                  : outOfStock
                                    ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through opacity-60"
                                    : "border-gray-200 bg-white hover:border-accent/40 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected ? <div className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                                <span className="text-sm">{variant.value || variant.name}</span>
                                {variant.priceAdjustment !== 0 && !outOfStock ? (
                                  <span
                                    className={`text-[10px] font-bold ${
                                      isSelected ? "text-accent" : "text-gray-400"
                                    }`}
                                  >
                                    {variant.priceAdjustment > 0 ? "+" : ""}
                                    {formatPrice(variant.priceAdjustment)}
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="space-y-6 border-b border-black/8 pb-8 pt-4">
              <div className="flex items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">რაოდენობა</p>
                  <div className="flex h-12 w-full max-w-[140px] items-center rounded-xl border border-gray-200 bg-gray-50/50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="flex h-full w-10 items-center justify-center rounded-lg transition-all hover:bg-white hover:shadow-sm"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex-1 text-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="flex h-full w-10 items-center justify-center rounded-lg transition-all hover:bg-white hover:shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">
                    ჯამური ფასი
                  </p>
                  <p className="font-ui text-3xl font-extrabold text-gray-900">
                    {formatPrice(totalPrice * quantity)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-accent-hover"
                  onClick={handleAddToCart}
                  disabled={addedFeedback}
                >
                  {missingRequiredSize ? "აირჩიე ზომა" : addedFeedback ? (
                    <>
                      <Check className="mr-2 h-6 w-6" />
                      კალათაშია
                    </>
                  ) : (
                    "კალათაში დამატება"
                  )}
                </Button>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Truck className="h-3.5 w-3.5 text-green-600" />
                    <span>
                      მიიღეთ <strong>3 დღეში</strong>-დან
                    </span>
                  </div>

                  <Link
                    href="/custom-order"
                    className="text-sm font-semibold text-gray-400 underline-offset-8 transition-colors hover:text-accent"
                  >
                    გსურთ შეკვეთა საკუთარი დიზაინით?{" "}
                    <span className="text-accent underline">შექმენით აქ</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-b border-black/8 pb-5">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">დაცული ყიდვა</p>
                  <p className="text-xs text-muted-foreground">თქვენი შენაძენი დაცულია ჩვენი გარანტიით</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">დაბრუნება 30 დღის განმავლობაში</p>
                  <p className="text-xs text-muted-foreground">უსიტყვო დაბრუნება თუ კმაყოფილი არ ხართ</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-black/8 bg-white">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-ui text-2xl font-semibold">სრული აღწერა</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded ? (
                <div className="border-t border-black/8 px-5 py-4 text-sm leading-7 text-muted-foreground">
                  {product.description}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
