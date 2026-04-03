/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { PricingSummary } from "@/components/custom-order/PricingSummary";
import {
  EMBROIDERY_SIZE_NOTES,
  getColorDisplayLabel,
  getProductDisplayLabel,
  normalizeText,
} from "@/lib/custom-order-labels";
import { submitCustomOrder } from "@/lib/custom-orders";
import { uploadDesignImage } from "@/lib/upload";
import {
  EMBROIDERY_SIZES,
  PRODUCT_TYPES,
  type ClothingSize,
  type DesignItem,
  type EmbroiderySizeId,
  type ProductColor,
  type ProductTypeId,
} from "@/config/custom-order";
import type { CreateCustomOrderRequest } from "@/types/custom-order";

interface Step5SummaryProps {
  selectedProduct: ProductTypeId;
  clothingSize: ClothingSize | null;
  frontDesigns: DesignItem[];
  backDesigns: DesignItem[];
  embroiderySize: EmbroiderySizeId;
  selectedColor?: ProductColor | null;
  onBack?: () => void;
}

function guessExtensionFromBlob(blob: Blob) {
  if (blob.type.includes("png")) return "png";
  if (blob.type.includes("webp")) return "webp";
  if (blob.type.includes("jpeg") || blob.type.includes("jpg")) return "jpg";
  return "png";
}

export function Step5Summary({
  selectedProduct,
  clothingSize,
  frontDesigns,
  backDesigns,
  embroiderySize,
  selectedColor = null,
  onBack,
}: Step5SummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("+995");
  const [contactEmail, setContactEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const product = PRODUCT_TYPES.find((p) => p.id === selectedProduct)!;
  const embroidery = EMBROIDERY_SIZES.find((s) => s.id === embroiderySize)!;
  const productLabel = getProductDisplayLabel(product.id, product.label);
  const embroideryNote =
    embroidery.id in EMBROIDERY_SIZE_NOTES
      ? normalizeText(
          embroidery.note,
          EMBROIDERY_SIZE_NOTES[embroidery.id as "S" | "M" | "L" | "XL"]
        )
      : embroidery.note;
  const totalPrice = product.basePrice + embroidery.extraPrice;

  const allDesigns = useMemo(
    () => [
      ...frontDesigns.map((design, index) => ({
        design,
        placement: "front",
        sortOrder: index,
      })),
      ...backDesigns.map((design, index) => ({
        design,
        placement: "back",
        sortOrder: frontDesigns.length + index,
      })),
    ],
    [frontDesigns, backDesigns]
  );

  const canSubmit =
    contactName.trim().length > 1 &&
    contactPhone.trim().length >= 7 &&
    contactEmail.includes("@") &&
    allDesigns.length > 0 &&
    !isSubmitting;

  async function resolveDesignUrl(url: string, sortOrder: number) {
    if (!url.startsWith("blob:")) {
      return url;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("დიზაინის ფაილის წაკითხვა ვერ მოხერხდა");
    }

    const blob = await response.blob();
    const ext = guessExtensionFromBlob(blob);
    const file = new File([blob], `custom-design-${sortOrder}.${ext}`, {
      type: blob.type || "image/png",
    });

    return await uploadDesignImage(file);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const designs = await Promise.all(
        allDesigns.map(async (entry) => {
          const url = await resolveDesignUrl(entry.design.url, entry.sortOrder);
          return {
            designImageUrl: url,
            placement: entry.placement,
            size: embroidery.id,
            threadColor: null,
            width: entry.design.transform ? Number(entry.design.transform.scaleX.toFixed(3)) : null,
            height: entry.design.transform ? Number(entry.design.transform.scaleY.toFixed(3)) : null,
            positionX: entry.design.transform ? Number(entry.design.transform.left.toFixed(2)) : null,
            positionY: entry.design.transform ? Number(entry.design.transform.top.toFixed(2)) : null,
            sortOrder: entry.sortOrder,
          };
        })
      );

      const payload: CreateCustomOrderRequest = {
        baseProductId: null,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        totalPrice,
        customerNotes: customerNotes.trim() || null,
        designs,
      };

      const order = await submitCustomOrder(payload);
      setSubmittedOrderId(order.id);
      setShowConfetti(true);
      toast.success("შეკვეთა წარმატებით გაიგზავნა");
    } catch (error) {
      console.error("Custom order submission failed:", error);
      toast.error("შეკვეთის გაგზავნა ვერ მოხერხდა. სცადე თავიდან.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedOrderId !== null) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        {showConfetti ? <Confetti /> : null}
        <CheckCircle2 className="h-16 w-16 text-accent" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">შეკვეთა მიღებულია!</h2>
          <p className="text-gray-500">
            მადლობა. შეკვეთის ნომერია <strong>#{submittedOrderId}</strong> და მალე დაგიკავშირდებით.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-semibold text-gray-700">შეკვეთის შეჯამება</h2>
        <p className="mt-1 text-base text-gray-500">გადაამოწმე დეტალები და შეავსე საკონტაქტო ინფორმაცია</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
            <img src={product.svgTemplate} alt={productLabel} className="h-14 w-14 object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">პროდუქტი</p>
            <p className="font-semibold text-foreground">{productLabel}</p>
          </div>
        </div>

        {clothingSize ? (
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-500">ტანსაცმლის ზომა</p>
            <span className="rounded-full bg-gray-100 px-3 py-0.5 text-sm font-semibold text-foreground">
              {clothingSize}
            </span>
          </div>
        ) : null}

        {selectedColor ? (
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-500">ფერი</p>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="text-sm font-medium text-foreground">{getColorDisplayLabel(selectedColor)}</span>
            </div>
          </div>
        ) : null}

        {frontDesigns.length > 0 ? (
          <div className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              წინა მხარე · {frontDesigns.length} დიზაინი
            </p>
            <div className="flex flex-wrap gap-2">
              {frontDesigns.map((design) => (
                <div
                  key={design.id}
                  className="h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                >
                  <img src={design.url} alt="" className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {backDesigns.length > 0 ? (
          <div className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              უკანა მხარე · {backDesigns.length} დიზაინი
            </p>
            <div className="flex flex-wrap gap-2">
              {backDesigns.map((design) => (
                <div
                  key={design.id}
                  className="h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                >
                  <img src={design.url} alt="" className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between p-4">
          <p className="text-sm text-gray-500">ნაქარგის ზომა</p>
          <div className="text-right">
            <span className="text-sm font-medium text-foreground">{embroidery.label}</span>
            <p className="text-xs text-gray-400">{embroideryNote}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-black/8 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">საკონტაქტო ინფორმაცია</h3>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="სახელი და გვარი"
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-accent"
        />
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+995 5XX XX XX XX"
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-accent"
        />
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="ელ-ფოსტა"
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-accent"
        />
        <textarea
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="დამატებითი შენიშვნა (არასავალდებულო)"
          className="min-h-[96px] w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-accent"
        />
      </div>

      <PricingSummary basePrice={product.basePrice} embroideryExtra={embroidery.extraPrice} />

      <div className="flex gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-12 rounded-2xl px-5"
          >
            უკან
          </Button>
        ) : null}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-12 flex-1 rounded-2xl bg-accent text-base font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              იგზავნება...
            </>
          ) : (
            "შეკვეთის გაგზავნა"
          )}
        </Button>
      </div>
    </div>
  );
}
