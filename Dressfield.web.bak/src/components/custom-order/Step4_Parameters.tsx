"use client";

import { cn } from "@/lib/utils";
import { PricingSummary } from "@/components/custom-order/PricingSummary";
import { EMBROIDERY_SIZE_NOTES, normalizeText } from "@/lib/custom-order-labels";
import {
  EMBROIDERY_SIZES,
  type EmbroiderySizeId,
  type ProductType,
} from "@/config/custom-order";

interface Step4ParametersProps {
  product: ProductType;
  embroiderySize: EmbroiderySizeId | null;
  onEmbroiderySizeChange: (id: EmbroiderySizeId) => void;
  isCompact?: boolean;
}

export function Step4Parameters({
  product,
  embroiderySize,
  onEmbroiderySizeChange,
  isCompact,
}: Step4ParametersProps) {
  const selectedEmbroidery = EMBROIDERY_SIZES.find((size) => size.id === embroiderySize);
  const extraPrice = selectedEmbroidery?.extraPrice ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-600">პარამეტრები</h2>
        <p className="mt-1 text-base text-gray-400">აირჩიე ნაქარგის ზომა</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-gray-500">ნაქარგის ზომა</h3>
        <div className="flex flex-wrap gap-3">
          {EMBROIDERY_SIZES.map((size) => {
            const isSelected = embroiderySize === size.id;
            const sizeNote =
              size.id in EMBROIDERY_SIZE_NOTES
                ? normalizeText(size.note, EMBROIDERY_SIZE_NOTES[size.id as "S" | "M" | "L" | "XL"])
                : size.note;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => onEmbroiderySizeChange(size.id)}
                className={cn(
                  "min-w-[80px] rounded-2xl border px-5 py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isSelected
                    ? "border-accent bg-violet-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("text-xl font-bold", isSelected ? "text-accent" : "text-foreground")}>
                    {size.label}
                  </span>
                  <span
                    className={cn(
                      "text-center text-xs leading-tight",
                      isSelected ? "text-accent/80" : "text-gray-400"
                    )}
                  >
                    {sizeNote}
                  </span>
                  {size.extraPrice > 0 ? (
                    <span className={cn("text-xs font-medium", isSelected ? "text-accent" : "text-gray-500")}>
                      +₾{size.extraPrice}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!isCompact ? (
        <PricingSummary basePrice={product.basePrice} embroideryExtra={extraPrice} />
      ) : null}
    </div>
  );
}
