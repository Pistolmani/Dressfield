"use client";

import { cn } from "@/lib/utils";
import { CLOTHING_SIZES, type ClothingSize } from "@/config/custom-order";

interface Step2ClothingSizeProps {
  selected: ClothingSize | null;
  onSelect: (size: ClothingSize) => void;
}

export function Step2ClothingSize({
  selected,
  onSelect,
}: Step2ClothingSizeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-600">
          ტანსაცმლის ზომა
        </h2>
        <p className="mt-1 text-base text-gray-400">
          ეს არის ტანსაცმლის ზომა, ნაქარგის ზომა მოგვიანებით
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {CLOTHING_SIZES.map((size) => {
          const isSelected = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              className={cn(
                "flex min-w-[80px] items-center justify-center rounded-2xl border px-6 py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected
                  ? "border-accent bg-violet-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              )}
            >
              <span
                className={cn(
                  "text-2xl font-bold",
                  isSelected ? "text-accent" : "text-foreground"
                )}
              >
                {size}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
