/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { PRODUCT_TYPES, type ProductTypeId } from "@/config/custom-order";

interface Step1ProductSelectorProps {
  selected: ProductTypeId | null;
  onSelect: (id: ProductTypeId) => void;
}

export function Step1ProductSelector({
  selected,
  onSelect,
}: Step1ProductSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-600">
          აირჩიე პროდუქტის ტიპი
        </h2>
        <p className="mt-1 text-base text-gray-400">
          რომელ ტანსაცმელზე გინდა ნაქარგი?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PRODUCT_TYPES.map((product) => {
          const isSelected = selected === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product.id)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border bg-white p-4 select-none touch-manipulation transition-[border-color,background-color,box-shadow,transform] duration-100 ease-out hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected
                  ? "border-accent bg-violet-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* Price badge — hidden for custom */}
              {product.id !== "custom" && (
                <span className="pointer-events-none absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black text-[11px] font-bold leading-tight text-white shadow-sm">
                  {product.basePrice}₾
                </span>
              )}

              <div className="pointer-events-none flex h-[150px] w-[150px] items-center justify-center">
                <img
                  src={product.svgTemplate}
                  alt={product.label}
                  width={150}
                  height={150}
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              </div>
              <span
                className={cn(
                  "pointer-events-none text-sm font-medium",
                  isSelected ? "text-accent" : "text-gray-700 group-hover:text-foreground"
                )}
              >
                {product.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
