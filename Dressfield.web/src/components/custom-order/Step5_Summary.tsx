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
  const designCount = Math.max(frontDesigns.length + backDesigns.length, 1);
  const totalPrice = basePrice + embroideryExtra * designCount;

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

    toast.success("კალათაში დაემატა", { duration: 2500 });
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
          <h2 className="text-xl font-semibold text-foreground">კალათაში დაემატა</h2>
          <p className="text-sm text-gray-500">გადავდივართ კალათაზე...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-foreground">შეკვეთის შეჯამება</h2>

        <div className="space-y-2">
          {orderIntent && (
            <SummaryRow
              label="შეკვეთის ტიპი"
              value={orderIntent === "own-product" ? "ჩემი პროდუქტი" : "პროდუქტის შეძენა + დიზაინი"}
            />
          )}
          <SummaryRow label="პროდუქტი" value={product.label} />
          {clothingSize && <SummaryRow label="ზომა" value={clothingSize} />}
          {selectedColor && <SummaryRow label="ფერი" value={selectedColor.label} />}
          <SummaryRow
            label="ნაქარგის ზომა"
            value={product.skipEmbroiderySizePicker ? "6x30სმ (მაქს)" : embrSize.label}
          />
          <SummaryRow
            label="დიზაინები"
            value={`წინა ${frontDesigns.length} / უკანა ${backDesigns.length}`}
          />
        </div>

        <div className="h-px bg-gray-100" />

        <div className="space-y-1.5">
          <label htmlFor="custom-order-note" className="text-xs font-medium text-foreground">
            შენიშვნა (არა სავალდებულო)
          </label>
          <textarea
            id="custom-order-note"
            rows={2}
            value={orderNote}
            onChange={(event) => onOrderNoteChange?.(event.target.value)}
            placeholder="დამატებითი დეტალები შეკვეთისთვის..."
            className="w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2.5">
        {!isOwnProductMode ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">ძირითადი ფასი</span>
            <span className="font-medium">{basePrice.toFixed(2)} ₾</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">ნაქარგი{designCount > 1 ? ` × ${designCount}` : ""}</span>
          <span className="font-medium">{(embroideryExtra * designCount).toFixed(2)} ₾</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">ჯამი</span>
          <span className="text-xl font-bold text-accent">{totalPrice.toFixed(2)} ₾</span>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full h-11 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          კალათაში დამატება
        </Button>
      </div>
    </div>
  );
}
