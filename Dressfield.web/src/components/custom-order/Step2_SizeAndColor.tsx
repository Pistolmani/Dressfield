"use client";

import { cn } from "@/lib/utils";
import { CLOTHING_SIZES, type ClothingSize, type ProductColor, type ProductTypeId } from "@/config/custom-order";
import { Check } from "lucide-react";

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
    <div className="space-y-10">
      {!skipSize && (
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-600">
              ტანსაცმლის ზომა
            </h2>
            <p className="mt-1 text-base text-gray-400">
              აირჩიე სასურველი ზომა
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {CLOTHING_SIZES.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeSelect(size)}
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
      )}

      {hasColors && (
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-600">
              ტანსაცმლის ფერი
            </h2>
            <p className="mt-1 text-base text-gray-400">
              აირჩიე შენი დიზაინისთვის ფერი
            </p>
          </div>

          <div className="flex flex-wrap gap-3 max-w-2xl">
            {availableColors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              // A slight border logic so white/light colors are visible
              const isLightColor = color.hex.toLowerCase() === "#ffffff" || color.hex.toLowerCase() === "#eaeaea";
              
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  title={color.label}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hover:scale-110",
                    isLightColor ? "border border-gray-300" : "border border-transparent",
                    isSelected ? "ring-2 ring-accent ring-offset-2 scale-110 shadow-sm" : "shadow-sm hover:shadow-md"
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        "h-5 w-5",
                        isLightColor ? "text-black" : "text-white"
                      )}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedColor && (
            <p className="text-sm font-medium text-gray-500 pt-1">
              არჩეული: <span className="text-foreground">{selectedColor.label}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
