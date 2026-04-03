"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2SizeAndColor } from "@/components/custom-order/Step2_SizeAndColor";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import { getProductDisplayLabel } from "@/lib/custom-order-labels";
import {
  EMBROIDERY_SIZES,
  PRODUCT_COLORS,
  PRODUCT_TYPES,
  type ClothingSize,
  type DesignItem,
  type DesignTransform,
  type EmbroiderySizeId,
  type ProductColor,
  type ProductTypeId,
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

  const [selectedProduct, setSelectedProduct] = useState<ProductTypeId | null>(null);
  const [clothingSize, setClothingSize] = useState<ClothingSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);

  const [frontDesigns, setFrontDesigns] = useState<DesignItem[]>([]);
  const [backDesigns, setBackDesigns] = useState<DesignItem[]>([]);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  const [embroiderySize, setEmbroiderySize] = useState<EmbroiderySizeId | null>(null);

  const activeDesigns = activeSide === "front" ? frontDesigns : backDesigns;
  const setActiveDesigns = activeSide === "front" ? setFrontDesigns : setBackDesigns;
  const allDesigns = [...frontDesigns, ...backDesigns];

  function revokeIfBlobUrl(url: string) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  function addDesign(url: string) {
    const id = `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    // Auto-center calculation based on product design zone
    let initialTransform: DesignTransform | undefined;
    if (currentProduct) {
      const zone = activeSide === "front" ? currentProduct.designZone : currentProduct.designZoneBack;
      initialTransform = {
        left: zone.x + zone.width / 2,
        top: zone.y + zone.height / 2,
        scaleX: 0.2, // Good starting scale
        scaleY: 0.2,
        angle: 0,
      };
    }

    setActiveDesigns((prev) => [...prev, { id, url, transform: initialTransform }]);
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
    const replaceIn = (prev: DesignItem[]) =>
      prev.map((design) => {
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

  const currentProduct =
    selectedProduct !== null
      ? PRODUCT_TYPES.find((p) => p.id === selectedProduct) ?? null
      : null;

  const selectedEmbroidery =
    embroiderySize !== null
      ? EMBROIDERY_SIZES.find((size) => size.id === embroiderySize) ?? null
      : null;

  const totalPrice = (currentProduct?.basePrice ?? 0) + (selectedEmbroidery?.extraPrice ?? 0);
  const selectedProductLabel = currentProduct
    ? getProductDisplayLabel(currentProduct.id, currentProduct.label)
    : "";

  const isStepComplete = (): boolean => {
    if (step === 1) return selectedProduct !== null;

    if (step === 3) {
      if (!currentProduct) return false;
      const hasSize = currentProduct.skipClothingSize || clothingSize !== null;
      const colors = selectedProduct ? (PRODUCT_COLORS[selectedProduct] ?? []) : [];
      const hasColor = colors.length === 0 || selectedColor !== null;
      const hasDesign = allDesigns.length > 0;
      const hasEmbroiderySize = embroiderySize !== null;
      return hasSize && hasColor && hasDesign && hasEmbroiderySize;
    }

    if (step === 5) return true;
    return false;
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    if (step === 1) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(1);
      return;
    }
    if (step === 5) {
      setStep(3);
    }
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
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:py-12">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {step === 1 ? "რომელ ტანსაცმელზე გინდა ნაქარგი?" : "შექმენი შენი დიზაინი"}
          </h1>
          <p className="max-w-2xl text-lg text-gray-500">
            {step === 1
              ? "აირჩიე პროდუქტი კოლექციიდან და მოარგე შენი იდეები."
              : `არჩეული გაქვს: ${selectedProductLabel}. ახლა დაამატე დიზაინი და დაასრულე შეკვეთა.`}
          </p>
        </div>

        <div className="min-h-[500px]">
          {step === 1 ? (
            <Step1ProductSelector selected={selectedProduct} onSelect={handleProductSelect} />
          ) : null}

          {step === 3 && currentProduct && selectedProduct ? (
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              <div className="w-full space-y-6 lg:sticky lg:top-8 lg:w-80">
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

              <div className="relative flex min-h-[800px] w-full flex-1 flex-col items-center justify-center rounded-[3rem] border border-black/5 bg-gray-50 p-4 shadow-inner sm:p-10">
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
                  className="absolute left-6 top-6 font-medium text-gray-400 hover:text-black"
                >
                  ← შეცვლა
                </Button>
              </div>

              <div className="w-full space-y-8 lg:sticky lg:top-8 lg:w-96">
                <Step2SizeAndColor
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

                <div className="border-t border-black/8 pt-8">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                      ფასი
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-black leading-none text-gray-900">
                        GEL {totalPrice.toFixed(2)}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase text-green-600">
                        უფასო მიწოდება
                      </p>
                    </div>
                  </div>

                  <Button
                    className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-accent-hover"
                    disabled={!isStepComplete()}
                    onClick={handleNext}
                  >
                    შეჯამება და შეკვეთა
                  </Button>

                  <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
                    გაგრძელებით ეთანხმები მომსახურების პირობებს.
                    <br />
                    მიწოდების ვადა: 1-3 სამუშაო დღე.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 && selectedProduct !== null && embroiderySize !== null ? (
            <Step5Summary
              selectedProduct={selectedProduct}
              clothingSize={clothingSize}
              selectedColor={selectedColor}
              frontDesigns={frontDesigns}
              backDesigns={backDesigns}
              embroiderySize={embroiderySize}
              onBack={handleBack}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
