/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ChevronDown, Minus, Plus, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { useCartStore } from "@/stores/cart-store";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import type { ProductDetailDto } from "@/types/catalog";

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80";

function groupVariants(product: ProductDetailDto) {
  const groups = new Map<string, ProductDetailDto["variants"]>();

  for (const variant of product.variants.filter((item) => item.isActive)) {
    const current = groups.get(variant.name) || [];
    current.push(variant);
    groups.set(variant.name, current);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}

export function ProductDetailClient({ product }: { product: ProductDetailDto }) {
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
  const addItem = useCartStore((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      variantGroups.map((group) => [group.name, group.items[0]?.id]).filter((entry) => entry[1])
    )
  );

  const selectedVariantItems = variantGroups
    .map((group) =>
      group.items.find((item) => item.id === selectedVariants[group.name]) || group.items[0]
    )
    .filter(Boolean);

  const totalPrice =
    product.basePrice +
    selectedVariantItems.reduce((sum, item) => sum + item.priceAdjustment, 0);

  const handleAddToCart = useCallback(() => {
    const primaryVariant = selectedVariantItems[0];
    const variantLabel = selectedVariantItems.length > 0
      ? selectedVariantItems.map((v) => `${v.name}: ${v.value || v.name}`).join(', ')
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
  }, [addItem, product.id, product.name, selectedVariantItems, totalPrice, quantity, selectedImage.imageUrl]);

  useEffect(() => {
    trackViewContent({
      contentId: String(product.id),
      contentName: product.name,
      value: product.basePrice,
    });
  }, [product.id, product.name, product.basePrice]);

  return (
    <div className="bg-background py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
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
                      ? "border-accent"
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
            <nav className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                მთავარი
              </Link>{" "}
              /{" "}
              <Link href="/products" className="hover:text-foreground">
                პროდუქტები
              </Link>{" "}
              / <span>{product.name}</span>
            </nav>

            {/* Header with Title & Price */}
            <div className="space-y-3 border-b border-black/8 pb-5">
              <h1 className="font-ui text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2">
                <p className="font-ui text-4xl font-bold text-accent">
                  {formatPrice(totalPrice)}
                </p>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground">
                    {product.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Availability & Shipping Info */}
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-black/2 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">ხელმისაწვდომი</p>
                <p className="text-sm text-green-600 font-medium">მარაგი: ხელმისაწვდომი</p>
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

            {/* Variant Selectors */}
            {variantGroups.length > 0 ? (
              <div className="space-y-5 border-b border-black/8 pb-5">
                {variantGroups.map((group) => (
                  <div key={group.name} className="space-y-2.5">
                    <label className="text-sm font-semibold text-foreground">
                      {group.name} აირჩიეთ:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {group.items.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((current) => ({
                              ...current,
                              [group.name]: variant.id,
                            }))
                          }
                          className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedVariants[group.name] === variant.id
                              ? "border-accent bg-accent text-white shadow-md"
                              : "border-black/15 bg-white hover:border-black/25"
                          }`}
                        >
                          {variant.value || variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Quantity & Purchase Actions */}
            <div className="space-y-4 border-b border-black/8 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">რაოდენობა:</p>
                  <div className="inline-flex items-center rounded-lg border-2 border-black/15 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="p-2 hover:bg-black/5"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-12 text-center font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="p-2 hover:bg-black/5"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="h-12 w-full bg-accent text-white text-base font-bold hover:bg-accent-hover shadow-md"
                  onClick={handleAddToCart}
                  disabled={addedFeedback}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      კალათაში დამატებულია
                    </>
                  ) : (
                    "კალათაში დამატება"
                  )}
                </Button>
                <Button variant="outline" className="h-11 w-full font-medium">
                  ინდივიდუალური შეკვეთა
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="space-y-3 border-b border-black/8 pb-5">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">დაცული ყიდვა</p>
                  <p className="text-xs text-muted-foreground">თქვენი ხარჯი დაცულია ჩვენი გარანტიით</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">დაბრუნება 30 დღის შიგნით</p>
                  <p className="text-xs text-muted-foreground">უსიტყო დაბრუნება თუ კმაყოფილი არ ხართ</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-black/8 bg-white">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-ui text-2xl font-semibold">
                  სრული აღწერა
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
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
