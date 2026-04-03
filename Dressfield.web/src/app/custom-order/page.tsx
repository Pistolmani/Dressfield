"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2SizeAndColor } from "@/components/custom-order/Step2_SizeAndColor";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import {
  PRODUCT_TYPES,
  EMBROIDERY_SIZES,
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

  const isStepComplete = (): boolean => {
    if (step === 1) return selectedProduct !== null;
    if (step === 3) {
      if (!currentProduct) return false;
      const hasSize = currentProduct.skipClothingSize || clothingSize !== null;
      const colors = selectedProduct ? (PRODUCT_COLORS[selectedProduct] ?? []) : [];
      const hasColor = colors.length === 0 || selectedColor !== null;
      const hasDesign = allDesigns.length > 0;
      const hasEmbSize = embroiderySize !== null;
      return hasSize && hasColor && hasDesign && hasEmbSize;
    }
    if (step === 5) return true;
    return false;
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    if (step === 1) {
      setStep(3); // Enter unified editor
      return;
    }
    const next = getNextStep(step);
    if (next <= 5) setStep(next);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(1); // Back to product selector
      return;
    }
    const prev = getPrevStep(step);
    if (prev >= 1) setStep(prev);
  };

  const handleProductSelect = (id: ProductTypeId) => {
    allDesigns.forEach((design) => revokeIfBlobUrl(design.url));
    setSelectedProduct(id);
    setClothingSize(null);
    setSelectedColor(null);
    setFrontDesigns([]);
    setBackDesigns([]);
    setActiveSide("front");
    setEmbroiderySize(null);
    setStep(3); // Auto-advance to unified editor
  };

  const currentProduct =
    selectedProduct !== null
      ? PRODUCT_TYPES.find((p) => p.id === selectedProduct) ?? null
      : null;
  const selectedEmbroidery =
    embroiderySize !== null
      ? EMBROIDERY_SIZES.find((size) => size.id === embroiderySize) ?? null
      : null;
  const totalPrice = (currentProduct?.basePrice ?? 0) + (selectedEmbroidery?.extraPrice ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            {step === 1 ? "რომელ ტანსაცმელზე გინდა ნაქარგი?" : "შექმენი შენი დიზაინი"}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            {step === 1 
              ? "აირჩიე პროდუქტი კოლექციიდან და მოარგე შენი იდეები." 
              : `თქვენ აარჩიეთ: ${currentProduct?.label}. ახლა კი დაამატეთ დიზაინი.`}
          </p>
        </div>

        {/* Unified Step Content */}
        <div className="min-h-[500px]">
          {step === 1 && (
            <Step1ProductSelector
              selected={selectedProduct}
              onSelect={handleProductSelect}
            />
          )}

          {step === 3 && currentProduct && selectedProduct && (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Panel: Tools & Layers */}
              <div className="w-full lg:w-72 space-y-6 lg:sticky lg:top-8">
                <Step3DesignUpload
                  product={currentProduct}
                  designs={activeDesigns}
                  activeSide={activeSide}
                  onDesignAdd={addDesign}
                  onDesignRemove={removeDesign}
                  onDesignReplace={replaceDesignUrl}
                  onDesignTransformChange={updateDesignTransform}
                  onSideChange={setActiveSide}
                  isSidebarMode
                />
              </div>

              {/* Center Panel: Preview */}
              <div className="flex-1 w-full flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border border-black/5 p-4 sm:p-10 min-h-[600px] relative shadow-inner">
                <Step3DesignUpload
                  product={currentProduct}
                  designs={activeDesigns}
                  activeSide={activeSide}
                  onDesignAdd={addDesign}
                  onDesignRemove={removeDesign}
                  onDesignReplace={replaceDesignUrl}
                  onDesignTransformChange={updateDesignTransform}
                  onSideChange={setActiveSide}
                  isCanvasOnly
                />
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="absolute top-6 left-6 text-gray-400 hover:text-black font-medium"
                >
                  ← შეცვლა
                </Button>
              </div>

              {/* Right Panel: Options & Purchase */}
              <div className="w-full lg:w-80 space-y-8 lg:sticky lg:top-8">
                <Step2SizeAndColor
                  selectedProduct={selectedProduct}
                  skipSize={currentProduct.skipClothingSize}
                  selectedSize={clothingSize}
                  onSizeSelect={setClothingSize}
                  availableColors={PRODUCT_COLORS[selectedProduct] ?? []}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
                
                <Step4Parameters
                  product={currentProduct}
                  embroiderySize={embroiderySize}
                  onEmbroiderySizeChange={setEmbroiderySize}
                  isCompact
                />

                <div className="pt-8 border-t border-black/8">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                    <div className="text-right">
                      <p className="text-3xl font-black text-gray-900 leading-none">
                        GEL {totalPrice.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-green-600 font-bold uppercase mt-1">უფასო მიწოდება</p>
                    </div>
                  </div>
                  
                  <Button
                    className="h-14 w-full bg-accent text-white text-lg font-bold hover:bg-accent-hover shadow-2xl rounded-2xl hover:scale-[1.02] transition-all"
                    disabled={!isStepComplete()}
                    onClick={handleNext}
                  >
                    შეჯამება & შეკვეთა
                  </Button>
                  
                  <p className="mt-4 text-[11px] text-center text-gray-400 leading-relaxed">
                    გაგრძელებით ეთანხმები მომსახურების პირობებს.<br />
                    მიწოდების ვადა: 1-3 სამუშაო დღე.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && selectedProduct !== null && embroiderySize !== null && (
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
      </div>
    </div>
  );
}
