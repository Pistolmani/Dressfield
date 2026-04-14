/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-background flex flex-col items-center justify-center px-4 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-ui text-4xl font-semibold mb-2">
          კალათა ცარიელია
        </h1>
        <p className="text-muted-foreground mb-6">
          დაამატეთ პროდუქტები კალათაში, შემდეგ განაგრძეთ გადახდა.
        </p>
        <Link href="/products">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            პროდუქტების ნახვა
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-ui text-5xl font-semibold mb-8">
          კალათა
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] pb-48 lg:pb-0">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? 0}`}
                className="flex gap-4 rounded-2xl border border-black/8 bg-white p-4"
              >
                {/* Image */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-medium">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <p className="text-accent font-semibold">{formatPrice(item.price)}</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label="წაშლა"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="inline-flex items-center rounded-full border border-black/10 p-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))
                      }
                      className="rounded-full p-1.5 hover:bg-black/5"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, Math.min(99, item.quantity + 1))
                      }
                      className="rounded-full p-1.5 hover:bg-black/5"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="fixed bottom-0 left-0 right-0 z-40 space-y-4 rounded-t-[2rem] border-t border-black/10 bg-white p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] lg:static lg:h-fit lg:rounded-2xl lg:border lg:border-black/8 lg:p-6 lg:pb-6 lg:shadow-none">
            <h2 className="font-ui text-2xl font-semibold">
              შეკვეთის შეჯამება
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ჯამი</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">მიწოდება</span>
                <span className="text-muted-foreground text-xs">გამოთვლება მიწოდებისას</span>
              </div>
              <div className="border-t border-black/8 pt-2 flex justify-between font-semibold text-base">
                <span>სულ</span>
                <span className="text-accent">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-accent text-white hover:bg-accent-hover h-11"
              onClick={() => router.push("/checkout")}
            >
              გადახდაზე გადასვლა
            </Button>

            <Link
              href="/products"
              className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              საყიდლები გაგრძელება
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
