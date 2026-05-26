"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { uploadDesignImage } from "@/lib/upload";
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

const CUSTOM_PRODUCT_ID_FLOOR = 1_000_000_000;
const MISSING_DESIGN_MESSAGE = "გთხოვთ ატვირთოთ მინიმუმ ერთი დიზაინი კალათაში დამატებამდე.";
const DESIGN_UNAVAILABLE_MESSAGE =
  "დიზაინის ფაილი აღარ არის ხელმისაწვდომი. გთხოვთ თავიდან ატვირთოთ ფაილი.";
const DESIGN_UPLOAD_FAILED_MESSAGE =
  "დიზაინის ატვირთვა ვერ მოხერხდა. გთხოვთ თავიდან ატვირთოთ ფაილი.";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

type DurableDesign = {
  url: string;
  side: "front" | "back";
  sortOrder: number;
  transform?: DesignItem["transform"];
};

function guessExtensionFromMime(type: string | undefined): string {
  if (!type) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("webp")) return "webp";
  if (type.includes("png")) return "png";
  return "png";
}

async function uploadBlobDesignUrl(url: string, sequence: number): Promise<string> {
  if (!url.startsWith("blob:")) return url;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(DESIGN_UNAVAILABLE_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(DESIGN_UNAVAILABLE_MESSAGE);
  }

  const blob = await response.blob();
  const type = blob.type || "image/png";
  const extension = guessExtensionFromMime(type);
  const file = new File([blob], `custom-design-${Date.now()}-${sequence}.${extension}`, {
    type,
  });

  return uploadDesignImage(file);
}

async function buildDurableDesigns(
  frontDesigns: DesignItem[],
  backDesigns: DesignItem[]
): Promise<DurableDesign[]> {
  const designs: DurableDesign[] = [
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
  ];

  let uploadSequence = 0;
  const durableDesigns: DurableDesign[] = [];

  for (const design of designs) {
    const url = await uploadBlobDesignUrl(design.url, uploadSequence);
    if (design.url.startsWith("blob:")) {
      uploadSequence += 1;
    }

    durableDesigns.push({ ...design, url });
  }

  return durableDesigns;
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
  const submittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const product = PRODUCT_TYPES.find((p) => p.id === selectedProduct)!;
  const embrSize = EMBROIDERY_SIZES.find((s) => s.id === embroiderySize)!;
  const isOwnProductMode = orderIntent === "own-product";
  const basePrice = isOwnProductMode ? 0 : product.basePrice;
  const embroideryExtra = embrSize.extraPrice;
  const designCount = Math.max(frontDesigns.length + backDesigns.length, 1);
  const totalPrice = basePrice + embroideryExtra * designCount;
  const embroiderySizeDisplay =
    selectedProduct === "cap"
      ? embroiderySize === "L"
        ? "MAX (სიმაღლე 6სმ · სიგრძე 30სმ)"
        : `${embrSize.label} (${embrSize.note})`
      : embrSize.label;

  const handleSubmit = async () => {
    if (submitted || submittingRef.current) return;

    if (frontDesigns.length + backDesigns.length === 0) {
      toast.error(MISSING_DESIGN_MESSAGE);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const existingCustomIds = useCartStore
        .getState()
        .items.map((item) => item.productId)
        .filter((id) => id >= CUSTOM_PRODUCT_ID_FLOOR);
      const nextSequentialId =
        existingCustomIds.length > 0
          ? Math.max(...existingCustomIds) + 1
          : CUSTOM_PRODUCT_ID_FLOOR;
      const uniqueId = Math.max(Date.now(), nextSequentialId);
      const durableDesigns = await buildDurableDesigns(frontDesigns, backDesigns);
      const firstDesign = durableDesigns[0];

      const labelParts: string[] = [];
      if (clothingSize) labelParts.push(`Size: ${clothingSize}`);
      if (selectedColor) labelParts.push(`Color: ${selectedColor.label}`);
      if (!product.skipEmbroiderySizePicker) {
        labelParts.push(
          product.id === "cap" && embrSize.id === "L"
            ? "Embroidery: MAX (Height 6cm · Length 30cm)"
            : `Embroidery: ${embrSize.label}`
        );
      }
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
          designs: durableDesigns,
          orderNote: orderNote.trim() || undefined,
        },
      });

      toast.success("კალათაში დაემატა", { duration: 2500 });
      setShowConfetti(true);
      setSubmitted(true);

      setTimeout(() => {
        router.push("/cart");
      }, 900);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === DESIGN_UNAVAILABLE_MESSAGE
          ? DESIGN_UNAVAILABLE_MESSAGE
          : DESIGN_UPLOAD_FAILED_MESSAGE
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
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
            value={embroiderySizeDisplay}
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
          disabled={submitting || submitted}
          className="w-full h-11 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          {submitting ? "დიზაინი იტვირთება..." : "კალათაში დამატება"}
        </Button>
      </div>
    </div>
  );
}
