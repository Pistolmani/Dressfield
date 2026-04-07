"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { useCartStore } from "@/stores/cart-store";
import {
  EMBROIDERY_SIZES,
  PRODUCT_TYPES,
  type ClothingSize,
  type DesignItem,
  type EmbroiderySizeId,
  type ProductColor,
  type ProductTypeId,
} from "@/config/custom-order";

interface Step5SummaryProps {
  selectedProduct: ProductTypeId;
  orderIntent?: "own-product" | "buy-product";
  clothingSize: ClothingSize | null;
  frontDesigns: DesignItem[];
  backDesigns: DesignItem[];
  embroiderySize: EmbroiderySizeId;
  selectedColor?: ProductColor | null;
  orderNote?: string;
  onOrderNoteChange?: (value: string) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

export function Step5Summary({
  selectedProduct,
  orderIntent,
  clothingSize,
  frontDesigns,
  backDesigns,
  embroiderySize,
  selectedColor = null,
  orderNote = "",
  onOrderNoteChange,
}: Step5SummaryProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const product = PRODUCT_TYPES.find((p) => p.id === selectedProduct)!;
  const embrSize = EMBROIDERY_SIZES.find((s) => s.id === embroiderySize)!;
  const isOwnProductMode = orderIntent === "own-product";
  const basePrice = isOwnProductMode ? 0 : product.basePrice;
  const embroideryExtra = product.skipEmbroiderySizePicker ? 0 : embrSize.extraPrice;
  const totalPrice = basePrice + embroideryExtra;

  const handleSubmit = () => {
    const existingCustomIds = useCartStore
      .getState()
      .items.map((item) => item.productId)
      .filter((id) => id >= 1_000_000_000);
    const uniqueId =
      existingCustomIds.length > 0
        ? Math.max(...existingCustomIds) + 1
        : 1_000_000_000;
    const firstDesign = frontDesigns[0] ?? backDesigns[0];

    const labelParts: string[] = [];
    if (clothingSize) labelParts.push(`Size: ${clothingSize}`);
    if (selectedColor) labelParts.push(`Color: ${selectedColor.label}`);
    if (!product.skipEmbroiderySizePicker) labelParts.push(`Embroidery: ${embrSize.label}`);
    const variantLabel = labelParts.join(" | ") || undefined;

    addItem({
      productId: uniqueId,
      name: `${product.label} - Custom order`,
      variantLabel,
      price: totalPrice,
      quantity: 1,
      imageUrl: firstDesign?.url ?? undefined,
      customOrderData: {
        productLabel: product.label,
        productTypeId: selectedProduct,
        clothingSize: clothingSize ?? undefined,
        selectedColor: selectedColor ?? undefined,
        orderIntent,
        embroiderySize,
        frontDesignCount: frontDesigns.length,
        backDesignCount: backDesigns.length,
        designs: [
          ...frontDesigns.map((design, index) => ({
            url: design.url,
            side: "front" as const,
            sortOrder: index,
            transform: design.transform,
          })),
          ...backDesigns.map((design, index) => ({
            url: design.url,
            side: "back" as const,
            sortOrder: frontDesigns.length + index,
            transform: design.transform,
          })),
        ],
        orderNote: orderNote.trim() || undefined,
      },
    });

    toast.success("Added to cart", { duration: 2500 });
    setShowConfetti(true);
    setSubmitted(true);

    setTimeout(() => {
      router.push("/cart");
    }, 900);
  };

  useEffect(() => {
    if (!showConfetti) return;
    const timer = setTimeout(() => setShowConfetti(false), 2200);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        {showConfetti && <Confetti />}
        <CheckCircle2 className="h-14 w-14 text-accent" />
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Added to cart</h2>
          <p className="text-sm text-gray-500">Redirecting to cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Order summary</h2>

        <div className="space-y-2">
          {orderIntent && (
            <SummaryRow
              label="Order type"
              value={orderIntent === "own-product" ? "Own product" : "Buy product + design"}
            />
          )}
          <SummaryRow label="Product" value={product.label} />
          {clothingSize && <SummaryRow label="Size" value={clothingSize} />}
          {selectedColor && <SummaryRow label="Color" value={selectedColor.label} />}
          <SummaryRow
            label="Embroidery size"
            value={product.skipEmbroiderySizePicker ? "6x30cm (max)" : embrSize.label}
          />
          <SummaryRow
            label="Designs"
            value={`Front ${frontDesigns.length} / Back ${backDesigns.length}`}
          />
        </div>

        <div className="h-px bg-gray-100" />

        <div className="space-y-1.5">
          <label htmlFor="custom-order-note" className="text-xs font-medium text-foreground">
            Note (optional)
          </label>
          <textarea
            id="custom-order-note"
            rows={2}
            value={orderNote}
            onChange={(event) => onOrderNoteChange?.(event.target.value)}
            placeholder="Any details for this order..."
            className="w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2.5">
        {!isOwnProductMode ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Base</span>
            <span className="font-medium">GEL {basePrice.toFixed(2)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Embroidery</span>
          <span className="font-medium">GEL {embroideryExtra.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-accent">GEL {totalPrice.toFixed(2)}</span>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-11 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
