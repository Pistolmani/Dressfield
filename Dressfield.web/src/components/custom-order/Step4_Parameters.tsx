"use client";

import { cn } from "@/lib/utils";
import {
  EMBROIDERY_SIZES,
  type EmbroiderySizeId,
  type ProductType,
} from "@/config/custom-order";
import { PricingSummary } from "@/components/custom-order/PricingSummary";

interface Step4ParametersProps {
  product: ProductType;
  embroiderySize: EmbroiderySizeId | null;
  onEmbroiderySizeChange: (id: EmbroiderySizeId) => void;
  isCompact?: boolean;
  onSizeButtonClick?: (fraction: number) => void;
}

export function Step4Parameters({
  product,
  embroiderySize,
  onEmbroiderySizeChange,
  isCompact,
  onSizeButtonClick,
}: Step4ParametersProps) {
  const selectedEmbSize = EMBROIDERY_SIZES.find((s) => s.id === embroiderySize);
  const extraPrice = product.skipEmbroiderySizePicker ? 0 : (selectedEmbSize?.extraPrice ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-600">პარამეტრები</h2>
        <p className="mt-1 text-base text-gray-400">
          აირჩიე ნაქარგის ზომა
        </p>
      </div>

      {/* Embroidery size */}
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-gray-500">ნაქარგის ზომა</h3>
        {product.skipEmbroiderySizePicker ? (
          <div className="rounded-2xl border border-accent/30 bg-violet-50 px-5 py-4">
            <p className="text-sm font-bold text-accent">ნაქარგის ზომა: 6×30სმ (მაქს.)</p>
            <p className="text-xs text-gray-500 mt-1">კეპისთვის ნაქარგის ზონა ფიქსირებულია</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {EMBROIDERY_SIZES.map((s) => {
              const isSelected = embroiderySize === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { onEmbroiderySizeChange(s.id); onSizeButtonClick?.(s.zoneScaleFraction); }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border px-5 py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-w-[80px]",
                    isSelected
                      ? "border-accent bg-violet-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  <span
                    className={cn(
                      "text-xl font-bold",
                      isSelected ? "text-accent" : "text-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-center leading-tight",
                      isSelected ? "text-accent/80" : "text-gray-400"
                    )}
                  >
                    {s.note}
                  </span>
                  {s.extraPrice > 0 && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-accent" : "text-gray-500"
                      )}
                    >
                      +₾{s.extraPrice}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price summary - only show if not compact */}
      {!isCompact && (
        <PricingSummary
          basePrice={product.basePrice}
          embroideryExtra={extraPrice}
        />
      )}
    </div>
  );
}
