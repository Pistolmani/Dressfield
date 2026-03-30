"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/custom-order/StepIndicator";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2ClothingSize } from "@/components/custom-order/Step2_ClothingSize";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import {
  PRODUCT_TYPES,
  getSkippedSteps,
  type DesignItem,
  type ProductTypeId,
  type ClothingSize,
  type EmbroiderySizeId,
} from "@/config/custom-order";

export default function CustomOrderPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedProduct, setSelectedProduct] = useState<ProductTypeId | null>(null);
  // Step 2
  const [clothingSize, setClothingSize] = useState<ClothingSize | null>(null);
  // Step 3 — multi-design, per side
  const [frontDesigns, setFrontDesigns] = useState<DesignItem[]>([]);
  const [backDesigns,  setBackDesigns]  = useState<DesignItem[]>([]);
  const [activeSide,   setActiveSide]   = useState<"front" | "back">("front");
  // Step 4
  const [embroiderySize, setEmbroiderySize] = useState<EmbroiderySizeId | null>(null);

  // ── Skipped steps based on selected product ──────────────────────────────
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

  function addDesign(url: string) {
    const id = `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setActiveDesigns((prev) => [...prev, { id, url }]);
  }

  function removeDesign(id: string) {
    setFrontDesigns((prev) => prev.filter((d) => d.id !== id));
    setBackDesigns((prev)  => prev.filter((d) => d.id !== id));
  }

  // ── Step completion check ────────────────────────────────────────────────
  const isStepComplete = (): boolean => {
    if (step === 1) return selectedProduct !== null;
    if (step === 2) return clothingSize !== null;
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
    setSelectedProduct(id);
    setClothingSize(null);
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

          {step === 2 && (
            <Step2ClothingSize
              selected={clothingSize}
              onSelect={setClothingSize}
            />
          )}

          {step === 3 && currentProduct && (
            <Step3DesignUpload
              product={currentProduct}
              designs={activeDesigns}
              activeSide={activeSide}
              onDesignAdd={addDesign}
              onDesignRemove={removeDesign}
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
