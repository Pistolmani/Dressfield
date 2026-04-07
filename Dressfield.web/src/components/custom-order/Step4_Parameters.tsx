"use client";

import { PricingSummary } from "@/components/custom-order/PricingSummary";
import {
  EMBROIDERY_SIZES,
  type EmbroiderySizeId,
  type ProductType,
} from "@/config/custom-order";
import { cn } from "@/lib/utils";

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
  const selectedEmbSize = EMBROIDERY_SIZES.find((size) => size.id === embroiderySize);
  const extraPrice = product.skipEmbroiderySizePicker ? 0 : (selectedEmbSize?.extraPrice ?? 0);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-gray-500">ნაქარგის ზომა</h3>
        {product.skipEmbroiderySizePicker ? (
          <div className="rounded-2xl border border-accent/30 bg-violet-50 px-5 py-4">
            <p className="text-sm font-bold text-accent">ნაქარგის ზომა: 6×30სმ (მაქს.)</p>
            <p className="text-xs text-gray-500 mt-1">კეპისთვის ნაქარგის ზონა ფიქსირებულია</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {EMBROIDERY_SIZES.map((size) => {
              const isSelected = embroiderySize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    onEmbroiderySizeChange(size.id);
                    onSizeButtonClick?.(size.zoneScaleFraction);
                  }}
                  className={cn(
                    "flex min-w-[80px] flex-col items-center gap-1 rounded-2xl border px-5 py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isSelected
                      ? "border-accent bg-violet-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "text-xl font-bold",
                      isSelected ? "text-accent" : "text-foreground",
                    )}
                  >
                    {size.label}
                  </span>
                  <span
                    className={cn(
                      "text-center text-xs leading-tight",
                      isSelected ? "text-accent/80" : "text-gray-400",
                    )}
                  >
                    {size.note}
                  </span>
                  {size.extraPrice > 0 ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-accent" : "text-gray-500",
                      )}
                    >
                      +₾{size.extraPrice}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isCompact ? (
        <PricingSummary basePrice={product.basePrice} embroideryExtra={extraPrice} />
      ) : null}
    </div>
  );
}
