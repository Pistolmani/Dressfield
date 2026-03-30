"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSummary } from "@/components/custom-order/PricingSummary";
import {
  PRODUCT_TYPES,
  EMBROIDERY_SIZES,
  type DesignItem,
  type ProductTypeId,
  type ClothingSize,
  type EmbroiderySizeId,
} from "@/config/custom-order";

interface Step5SummaryProps {
  selectedProduct: ProductTypeId;
  clothingSize:    ClothingSize | null;
  frontDesigns:    DesignItem[];
  backDesigns:     DesignItem[];
  embroiderySize:  EmbroiderySizeId;
}

export function Step5Summary({
  selectedProduct,
  clothingSize,
  frontDesigns,
  backDesigns,
  embroiderySize,
}: Step5SummaryProps) {
  const [submitted, setSubmitted] = useState(false);

  const product    = PRODUCT_TYPES.find((p) => p.id === selectedProduct)!;
  const embrSize   = EMBROIDERY_SIZES.find((s) => s.id === embroiderySize)!;

  const handleSubmit = () => {
    toast.success("შეკვეთა მიღებულია! მალე დაგიკავშირდებით.", { duration: 5000 });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-accent" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">შეკვეთა მიღებულია!</h2>
          <p className="text-gray-500">მადლობა! მალე დაგიკავშირდებით შეკვეთის დასაზუსტებლად.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-semibold text-gray-600">შეკვეთის შეჯამება</h2>
        <p className="mt-1 text-base text-gray-400">გადაამოწმე ყველა დეტალი გაფორმებამდე</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">

        {/* Product */}
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
            <img
              src={product.svgTemplate}
              alt={product.label}
              className="h-14 w-14 object-contain"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">პროდუქტი</p>
            <p className="font-semibold text-foreground">{product.label}</p>
          </div>
        </div>

        {/* Clothing size — only for products that have sizes */}
        {clothingSize && (
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-500">ტანსაცმლის ზომა</p>
            <span className="rounded-full bg-gray-100 px-3 py-0.5 text-sm font-semibold text-foreground">
              {clothingSize}
            </span>
          </div>
        )}

        {/* Front designs */}
        {frontDesigns.length > 0 && (
          <div className="p-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">ზედა · {frontDesigns.length} დიზაინი</p>
            <div className="flex flex-wrap gap-2">
              {frontDesigns.map((d) => (
                <div key={d.id} className="h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <img src={d.url} alt="" className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back designs */}
        {backDesigns.length > 0 && (
          <div className="p-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">უკანა · {backDesigns.length} დიზაინი</p>
            <div className="flex flex-wrap gap-2">
              {backDesigns.map((d) => (
                <div key={d.id} className="h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <img src={d.url} alt="" className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embroidery size */}
        <div className="flex items-center justify-between p-4">
          <p className="text-sm text-gray-500">ნაქარგის ზომა</p>
          <div className="text-right">
            <span className="text-sm font-medium text-foreground">{embrSize.label}</span>
            <p className="text-xs text-gray-400">{embrSize.note}</p>
          </div>
        </div>

      </div>

      {/* Pricing */}
      <PricingSummary
        basePrice={product.basePrice}
        embroideryExtra={embrSize.extraPrice}
      />

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full h-12 rounded-2xl bg-accent text-white text-base font-semibold hover:bg-accent-hover transition-colors"
      >
        შეკვეთის გაფორმება
      </Button>
    </div>
  );
}
