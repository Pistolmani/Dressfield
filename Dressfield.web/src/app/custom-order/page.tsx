"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/custom-order/StepIndicator";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2SizeAndColor } from "@/components/custom-order/Step2_SizeAndColor";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import {
  PRODUCT_TYPES,
  PRODUCT_COLORS,
  getSkippedSteps,
  type DesignItem,
  type DesignTransform,
  type ProductTypeId,
  type ClothingSize,
  type EmbroiderySizeId,
  type ProductColor,
} from "@/config/custom-order";

function isSameTransform(a: DesignTransform | undefined, b: DesignTransform) {
  if (!a) return false;

  const epsilon = 0.001;
  return (
    Math.abs(a.left - b.left) < epsilon &&
    Math.abs(a.top - b.top) < epsilon &&
    Math.abs(a.scaleX - b.scaleX) < epsilon &&
    Math.abs(a.scaleY - b.scaleY) < epsilon &&
    Math.abs(a.angle - b.angle) < epsilon
  );
}

export default function CustomOrderPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedProduct, setSelectedProduct] = useState<ProductTypeId | null>(null);
  // Step 2
  const [clothingSize, setClothingSize] = useState<ClothingSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  // Step 3 - multi-design, per side
  const [frontDesigns, setFrontDesigns] = useState<DesignItem[]>([]);
  const [backDesigns,  setBackDesigns]  = useState<DesignItem[]>([]);
  const [activeSide,   setActiveSide]   = useState<"front" | "back">("front");
  // Step 4
  const [embroiderySize, setEmbroiderySize] = useState<EmbroiderySizeId | null>(null);

  // Skipped steps based on selected product
  const skippedSteps = useMemo(
    () => (selectedProduct ? getSkippedSteps(selectedProduct) : []),
    [selectedProduct],
  );

  const getNextStep = (current: number): number => {
    let next = current + 1;
    while (skippedSteps.includes(next) && next <= 5) next++;
    return next;
  };

  const getPrevStep = (current: number): number => {
    let prev = current - 1;
    while (skippedSteps.includes(prev) && prev >= 1) prev--;
    return prev;
  };

  const activeDesigns    = activeSide === "front" ? frontDesigns : backDesigns;
  const setActiveDesigns = activeSide === "front" ? setFrontDesigns : setBackDesigns;
  const allDesigns       = [...frontDesigns, ...backDesigns];

  function revokeIfBlobUrl(url: string) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  function addDesign(url: string) {
    const id = `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setActiveDesigns((prev) => [...prev, { id, url }]);
  }

  function removeDesign(id: string) {
    setFrontDesigns((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) revokeIfBlobUrl(target.url);
      return prev.filter((d) => d.id !== id);
    });

    setBackDesigns((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) revokeIfBlobUrl(target.url);
      return prev.filter((d) => d.id !== id);
    });
  }

  function replaceDesignUrl(id: string, newUrl: string) {
    const replaceIn = (prev: DesignItem[]) => prev.map((design) => {
      if (design.id !== id) return design;
      if (design.url !== newUrl) revokeIfBlobUrl(design.url);
      return { ...design, url: newUrl };
    });

    setFrontDesigns((prev) => replaceIn(prev));
    setBackDesigns((prev) => replaceIn(prev));
  }

  const updateDesignTransform = useCallback((id: string, transform: DesignTransform) => {
    const applyTransform = (prev: DesignItem[]) => {
      let changed = false;
      const next = prev.map((design) => {
        if (design.id !== id) return design;
        if (isSameTransform(design.transform, transform)) return design;

        changed = true;
        return { ...design, transform };
      });

      return changed ? next : prev;
    };

    setFrontDesigns((prev) => applyTransform(prev));
    setBackDesigns((prev) => applyTransform(prev));
  }, []);

  // Step completion check
  const isStepComplete = (): boolean => {
    if (step === 1) return selectedProduct !== null;
    if (step === 2) {
      if (!currentProduct) return false;
      const hasSize = currentProduct.skipClothingSize || clothingSize !== null;
      const colors = selectedProduct ? (PRODUCT_COLORS[selectedProduct] ?? []) : [];
      const hasColor = colors.length === 0 || selectedColor !== null;
      return hasSize && hasColor;
    }
    if (step === 3) return allDesigns.length > 0;
    if (step === 4) return embroiderySize !== null;
    if (step === 5) return true;
    return false;
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    const next = getNextStep(step);
    if (next <= 5) setStep(next);
  };

  const handleBack = () => {
    const prev = getPrevStep(step);
    if (prev >= 1) setStep(prev);
  };

  // When product changes, reset downstream state
  const handleProductSelect = (id: ProductTypeId) => {
    allDesigns.forEach((design) => revokeIfBlobUrl(design.url));
    setSelectedProduct(id);
    setClothingSize(null);
    setSelectedColor(null);
    setFrontDesigns([]);
    setBackDesigns([]);
    setActiveSide("front");
    setEmbroiderySize(null);
  };

  const currentProduct =
    selectedProduct !== null
      ? PRODUCT_TYPES.find((p) => p.id === selectedProduct) ?? null
      : null;

  const isCustomProduct = selectedProduct === "custom";
  const isLastStep = getNextStep(step) > 5;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-foreground">
            რომელ ტანსაცმელზე გინდა ნაქარგი?
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            შექმენი შენი უნიკალური ნაქარგი ნებისმიერ ტანსაცმელზე
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={step} skippedSteps={skippedSteps} />
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <Step1ProductSelector
              selected={selectedProduct}
              onSelect={handleProductSelect}
            />
          )}

          {step === 2 && currentProduct && selectedProduct && (
            <Step2SizeAndColor
              selectedProduct={selectedProduct}
              skipSize={currentProduct.skipClothingSize}
              selectedSize={clothingSize}
              onSizeSelect={setClothingSize}
              availableColors={PRODUCT_COLORS[selectedProduct] ?? []}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          )}

          {step === 3 && currentProduct && (
            <Step3DesignUpload
              product={currentProduct}
              designs={activeDesigns}
              activeSide={activeSide}
              onDesignAdd={addDesign}
              onDesignRemove={removeDesign}
              onDesignReplace={replaceDesignUrl}
              onDesignTransformChange={updateDesignTransform}
              onSideChange={setActiveSide}
            />
          )}

          {step === 4 && currentProduct && (
            <>
              {isCustomProduct && (
                <div className="mb-6 rounded-2xl border border-dashed border-accent/40 bg-violet-50 p-8 text-center space-y-3">
                  <p className="text-lg font-semibold text-accent">სხვა პროდუქტი</p>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    თუ გსურს ნაქარგი სხვა სახის პროდუქტზე (ჩანთა, ქურთუკი, ქუდი, და სხვ.),
                    გთხოვ აირჩიო პარამეტრები ქვემოთ. შეკვეთის შემდეგ დაგიკავშირდებით დეტალების გასარკვევად.
                  </p>
                </div>
              )}
              <Step4Parameters
                product={currentProduct}
                embroiderySize={embroiderySize}
                onEmbroiderySizeChange={setEmbroiderySize}
              />
            </>
          )}

          {step === 5 &&
            selectedProduct !== null &&
            embroiderySize !== null && (
              <Step5Summary
                selectedProduct={selectedProduct}
                clothingSize={clothingSize}
                selectedColor={selectedColor}
                frontDesigns={frontDesigns}
                backDesigns={backDesigns}
                embroiderySize={embroiderySize}
              />
            )}
        </div>

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6"
            >
              უკან
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="bg-accent px-8 text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {isLastStep ? "შეჯამება" : "გაგრძელება"}
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Button variant="outline" onClick={handleBack} className="px-6">
              უკან
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
