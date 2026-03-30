"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BASE_CUSTOM_PRICE,
  getSizePriceAdjustment,
  PLACEMENT_OPTIONS,
  SIZE_OPTIONS,
  THREAD_COLOR_OPTIONS,
} from "@/lib/custom-orders";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useCustomOrderStore } from "@/stores/custom-order-store";

export function OptionsStep() {
  const design = useCustomOrderStore((state) => state.design);
  const setDesign = useCustomOrderStore((state) => state.setDesign);
  const setStep = useCustomOrderStore((state) => state.setStep);
  const setTotalPrice = useCustomOrderStore((state) => state.setTotalPrice);

  if (!design) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">ჯერ დიზაინის რედაქტირებაა საჭირო.</p>
        <Button variant="outline" onClick={() => setStep(3)}>
          დაბრუნება რედაქტირებაზე
        </Button>
      </div>
    );
  }

  const sizeAdjustment = getSizePriceAdjustment(design.size);
  const total = BASE_CUSTOM_PRICE + sizeAdjustment;

  function handleContinue() {
    setTotalPrice(total);
    setStep(5);
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setStep(3)}>
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <h2 className="font-ui text-3xl font-semibold">
          განთავსება
        </h2>
        <div className="flex flex-wrap gap-2">
          {PLACEMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDesign({ ...design, placement: option.value })}
              className={cn(
                "rounded-full border border-black/8 bg-white px-4 py-2 text-sm hover:border-accent/40",
                design.placement === option.value && "bg-accent text-white"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <h2 className="font-ui text-3xl font-semibold">ზომა</h2>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDesign({ ...design, size: option.value })}
              className={cn(
                "rounded-full border border-black/8 bg-white px-4 py-2 text-sm hover:border-accent/40",
                design.size === option.value && "bg-accent text-white"
              )}
            >
              {option.label}
              {option.priceAdj > 0 ? `  +${option.priceAdj} ₾` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <h2 className="font-ui text-3xl font-semibold">
          ძაფის ფერი
        </h2>
        <div className="flex flex-wrap gap-3">
          {THREAD_COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              onClick={() => setDesign({ ...design, threadColor: option.value })}
              className={cn(
                "h-10 w-10 rounded-full",
                design.threadColor === option.value && "ring-2 ring-accent ring-offset-2",
                option.value === "#FFFFFF" && "border border-black/10"
              )}
              style={{ backgroundColor: option.value }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">საბაზო ფასი:</span>
            <span>{formatPrice(BASE_CUSTOM_PRICE)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ზომის დამატება:</span>
            <span>{sizeAdjustment > 0 ? `+${sizeAdjustment} ₾` : "0 ₾"}</span>
          </div>
          <div className="flex items-center justify-between border-t border-black/8 pt-3 font-semibold">
            <span>სულ:</span>
            <span className="text-accent">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-accent text-white hover:bg-accent-hover" onClick={handleContinue}>
          გაგრძელება
        </Button>
      </div>
    </div>
  );
}
