"use client";

import { Check } from "lucide-react";
import {
  CLOTHING_SIZES,
  type ClothingSize,
  type ProductColor,
  type ProductTypeId,
} from "@/config/custom-order";
import { cn } from "@/lib/utils";

interface Step2SizeAndColorProps {
  selectedProduct: ProductTypeId;
  skipSize: boolean;
  selectedSize: ClothingSize | null;
  onSizeSelect: (size: ClothingSize) => void;
  availableColors: ProductColor[];
  selectedColor: ProductColor | null;
  onColorSelect: (color: ProductColor) => void;
}

export function Step2SizeAndColor({
  skipSize,
  selectedSize,
  onSizeSelect,
  availableColors,
  selectedColor,
  onColorSelect,
}: Step2SizeAndColorProps) {
  const hasColors = availableColors && availableColors.length > 0;

  return (
    <div className="space-y-5">
      {!skipSize && (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">ტანსაცმლის ზომა</p>
            <p className="text-xs text-gray-400">აირჩიე სასურველი ზომა</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CLOTHING_SIZES.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeSelect(size)}
                  className={cn(
                    "flex min-w-[56px] items-center justify-center rounded-2xl border-2 px-4 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isSelected
                      ? "border-accent bg-accent/5 shadow-[0_4px_15px_rgba(0,0,0,0.1)] translate-y-[1px]"
                      : "border-gray-100 bg-white hover:border-accent/40 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1",
                  )}
                >
                  <span
                    className={cn(
                      "text-base font-bold",
                      isSelected ? "text-accent" : "text-foreground",
                    )}
                  >
                    {size}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasColors && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 max-w-2xl">
            {availableColors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              const isLightColor =
                color.hex.toLowerCase() === "#ffffff" ||
                color.hex.toLowerCase() === "#eaeaea";

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  title={color.label}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer",
                    isLightColor ? "border-2 border-gray-200" : "border border-white/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]",
                    isSelected
                      ? "ring-[2.5px] ring-accent ring-offset-4 scale-110 shadow-lg"
                      : "shadow-md hover:shadow-xl hover:scale-110 hover:-translate-y-1",
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected ? (
                    <Check
                      className={cn(
                        "h-5 w-5",
                        isLightColor ? "text-black" : "text-white",
                      )}
                      strokeWidth={3}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {selectedColor ? (
            <p className="text-sm font-medium text-gray-500 pt-1">
              არჩეული: <span className="text-foreground">{selectedColor.label}</span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
