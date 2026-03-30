/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { ChevronDown, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { useCartStore } from "@/stores/cart-store";
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
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  }, [addItem, product.id, product.name, selectedVariantItems, totalPrice, quantity, selectedImage.imageUrl]);

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
                áƒ›áƒ—áƒáƒ•áƒáƒ áƒ˜
              </Link>{" "}
              /{" "}
              <Link href="/products" className="hover:text-foreground">
                áƒžáƒ áƒáƒ“áƒ£áƒ¥áƒ¢áƒ”áƒ‘áƒ˜
              </Link>{" "}
              / <span>{product.name}</span>
            </nav>

            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="font-ui text-5xl sm:text-6xl font-semibold tracking-[0.04em]">
                  {product.name}
                </h1>
                <p className="font-ui text-5xl font-semibold text-accent">
                  {formatPrice(totalPrice)}
                </p>
                {product.shortDescription ? (
                  <p className="max-w-2xl text-base text-muted-foreground">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>
            </div>

            {variantGroups.length > 0 ? (
              <div className="space-y-5">
                {variantGroups.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <p className="text-sm font-medium">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
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
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            selectedVariants[group.name] === variant.id
                              ? "border-accent bg-accent text-white"
                              : "border-black/10 bg-white hover:border-accent/40"
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

            <div className="flex flex-col gap-4 border-y border-black/8 py-5 sm:flex-row sm:items-center">
              <div className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 flex-1 bg-accent text-white hover:bg-accent-hover"
                  onClick={handleAddToCart}
                  disabled={addedFeedback}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      áƒ“áƒáƒ›áƒáƒ¢áƒ”áƒ‘áƒ£áƒšáƒ˜áƒ
                    </>
                  ) : (
                    'áƒ™áƒáƒšáƒáƒ—áƒáƒ¨áƒ˜ áƒ“áƒáƒ›áƒáƒ¢áƒ”áƒ‘áƒ'
                  )}
                </Button>
                <Button variant="outline" className="h-11 flex-1">
                  áƒ˜áƒœáƒ“áƒ˜áƒ•áƒ˜áƒ“áƒ£áƒáƒšáƒ£áƒ áƒ˜ áƒ¨áƒ”áƒ™áƒ•áƒ”áƒ—áƒ
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-black/8 bg-white">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-ui text-2xl font-semibold">
                  áƒ¡áƒ áƒ£áƒšáƒ˜ áƒáƒ¦áƒ¬áƒ”áƒ áƒ
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

