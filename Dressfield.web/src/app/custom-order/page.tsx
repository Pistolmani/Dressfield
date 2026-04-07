"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2SizeAndColor } from "@/components/custom-order/Step2_SizeAndColor";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import type { ProductCanvasHandle } from "@/components/custom-order/ProductCanvas";
import { cn } from "@/lib/utils";
import {
  PRODUCT_TYPES,
  EMBROIDERY_SIZES,
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

type OrderIntent = "own-product" | "buy-product";

export default function CustomOrderPage() {
  const [step, setStep] = useState(1);
  const [orderIntent, setOrderIntent] = useState<OrderIntent | null>(null);
  const [resizeRequest, setResizeRequest] = useState<{ fraction: number; seq: number } | null>(null);
  const desktopCanvasRef = useRef<ProductCanvasHandle | null>(null);
  const mobileCanvasRef = useRef<ProductCanvasHandle | null>(null);

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
  // Summary note
  const [orderNote, setOrderNote] = useState("");

  const visibleProducts = useMemo(
    () => PRODUCT_TYPES.filter((product) => orderIntent === "own-product" || product.id !== "jeans"),
    [orderIntent],
  );

  // Skipped steps based on selected product
  const skippedSteps = useMemo(
    () => (selectedProduct ? getSkippedSteps(selectedProduct) : []),
    [selectedProduct],
  );

  useEffect(() => {
    if (!selectedProduct) return;
    const stillVisible = visibleProducts.some((product) => product.id === selectedProduct);
    if (stillVisible) return;

    setSelectedProduct(null);
    setClothingSize(null);
    setSelectedColor(null);
    setFrontDesigns([]);
    setBackDesigns([]);
    setActiveSide("front");
    setEmbroiderySize(null);
    setOrderNote("");
    setStep(1);
  }, [selectedProduct, visibleProducts]);

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
      const hasDesign = allDesigns.length > 0;
      const hasEmbSize = currentProduct.skipEmbroiderySizePicker || embroiderySize !== null;
      return hasSize && hasDesign && hasEmbSize;
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
    if (step === 3) {
      setStep(5); // Go directly to summary
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
    if (step === 5) {
      setStep(3); // Back to editor
      return;
    }
    const prev = getPrevStep(step);
    if (prev >= 1) setStep(prev);
  };

  const handleProductSelect = (id: ProductTypeId) => {
    allDesigns.forEach((design) => revokeIfBlobUrl(design.url));
    const product = PRODUCT_TYPES.find((p) => p.id === id);
    setSelectedProduct(id);
    setClothingSize(null);
    setSelectedColor(null);
    setFrontDesigns([]);
    setBackDesigns([]);
    setActiveSide("front");
    // Auto-set embroidery size for products with a fixed zone (e.g. cap)
    setEmbroiderySize(product?.skipEmbroiderySizePicker ? "S" : null);
    setOrderNote("");
    setStep(3); // Auto-advance to unified editor
  };

  const handleSizeButtonClick = useCallback((fraction: number) => {
    setResizeRequest((prev) => ({ fraction, seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  const handleEmbroiderySizeDetected = useCallback((sizeId: EmbroiderySizeId) => {
    setEmbroiderySize(sizeId);
  }, []);

  const currentProduct =
    selectedProduct !== null
      ? PRODUCT_TYPES.find((p) => p.id === selectedProduct) ?? null
      : null;
  const selectedEmbroidery =
    embroiderySize !== null
      ? EMBROIDERY_SIZES.find((size) => size.id === embroiderySize) ?? null
      : null;
  const isOwnProductMode = orderIntent === "own-product";
  const embroideryExtra =
    currentProduct?.skipEmbroiderySizePicker
      ? 0
      : (selectedEmbroidery?.extraPrice ?? 0);
  const basePrice = isOwnProductMode ? 0 : (currentProduct?.basePrice ?? 0);
  const totalPrice = basePrice + embroideryExtra;

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("max-w-7xl mx-auto px-4", step === 5 ? "py-6 lg:py-8" : "py-8 lg:py-12")}>
        {/* Page header */}
        <div className={cn("mb-10", step === 5 && "mb-6")}>
          <h1 className={cn("font-extrabold tracking-tight text-gray-900 mb-3", step === 5 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl")}>
            {step === 1 ? "რომელ ტანსაცმელზე გინდა ნაქარგი?" : "შექმენი შენი დიზაინი"}
          </h1>
          <p className={cn("text-gray-500 max-w-2xl", step === 5 ? "text-base" : "text-lg")}>
            {step === 1 
              ? "აირჩიე პროდუქტი კოლექციიდან და მოარგე შენი იდეები." 
              : `თქვენ აარჩიეთ: ${currentProduct?.label}. ახლა კი დაამატეთ დიზაინი.`}
          </p>
        </div>

        {/* Unified Step Content */}
        <div className="min-h-[500px]">
          {step === 1 && (
            <Step1ProductSelector
              products={visibleProducts}
              ownProductMode={isOwnProductMode}
              selected={selectedProduct}
              onSelect={handleProductSelect}
            />
          )}

          {step === 3 && currentProduct && selectedProduct && (
            <>
              {/* ── Desktop: 3-column layout ────────────────────────────── */}
              <div className="hidden lg:flex flex-row gap-8 items-start">
                {/* Left Panel: Tools & Layers */}
                <div className="w-52 space-y-6 sticky top-8">
                  <Step3DesignUpload
                    product={currentProduct}
                    designs={activeDesigns}
                    activeSide={activeSide}
                    selectedColor={selectedColor}
                    onDesignAdd={addDesign}
                    onDesignRemove={removeDesign}
                    onDesignReplace={replaceDesignUrl}
                    onDesignTransformChange={updateDesignTransform}
                    onSideChange={setActiveSide}
                    isSidebarMode
                    sharedCanvasRef={desktopCanvasRef}
                  />
                </div>

                {/* Center Panel: Preview */}
                <div className="flex-1 w-full flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border border-black/5 p-8 min-h-[500px] relative shadow-inner">
                  <Step3DesignUpload
                    product={currentProduct}
                    designs={activeDesigns}
                    activeSide={activeSide}
                    selectedColor={selectedColor}
                    onDesignAdd={addDesign}
                    onDesignRemove={removeDesign}
                    onDesignReplace={replaceDesignUrl}
                    onDesignTransformChange={updateDesignTransform}
                    onSideChange={setActiveSide}
                    isCanvasOnly
                    resizeRequest={resizeRequest}
                    onEmbroiderySizeDetected={handleEmbroiderySizeDetected}
                    sharedCanvasRef={desktopCanvasRef}
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
                <div className="w-80 space-y-8 sticky top-8">
                  <Step2SizeAndColor
                    selectedProduct={selectedProduct}
                    skipSize={currentProduct.skipClothingSize}
                    selectedSize={clothingSize}
                    onSizeSelect={setClothingSize}
                    availableColors={[]}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                  />
                  <Step4Parameters
                    product={currentProduct}
                    embroiderySize={embroiderySize}
                    onEmbroiderySizeChange={setEmbroiderySize}
                    isCompact
                    onSizeButtonClick={handleSizeButtonClick}
                  />
                  <div className="pt-8 border-t border-black/8">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                      <div className="text-right [&>p:nth-child(2)]:hidden">
                        <p className="text-3xl font-black text-gray-900 leading-none">GEL {totalPrice.toFixed(2)}</p>
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

              {/* Mobile: one scrollable layout */}
              <div className="flex flex-col lg:hidden gap-4">
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-black/5 px-4 py-2 text-[11px] font-semibold text-gray-600">
                  <span>გადაახვიე ქვემოთ ინსტრუმენტებისა და ზომისთვის</span>
                  <span className="inline-block animate-bounce">↓</span>
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border border-black/5 p-4 min-h-[420px] relative shadow-inner">
                  <Step3DesignUpload
                    product={currentProduct}
                    designs={activeDesigns}
                    activeSide={activeSide}
                    selectedColor={selectedColor}
                    onDesignAdd={addDesign}
                    onDesignRemove={removeDesign}
                    onDesignReplace={replaceDesignUrl}
                    onDesignTransformChange={updateDesignTransform}
                    onSideChange={setActiveSide}
                    isCanvasOnly
                    resizeRequest={resizeRequest}
                    onEmbroiderySizeDetected={handleEmbroiderySizeDetected}
                    sharedCanvasRef={mobileCanvasRef}
                  />
                </div>

                <div className="relative space-y-6 rounded-3xl border border-black/8 bg-white p-4 shadow-sm">
                  <Step3DesignUpload
                    product={currentProduct}
                    designs={activeDesigns}
                    activeSide={activeSide}
                    selectedColor={selectedColor}
                    onDesignAdd={addDesign}
                    onDesignRemove={removeDesign}
                    onDesignReplace={replaceDesignUrl}
                    onDesignTransformChange={updateDesignTransform}
                    onSideChange={setActiveSide}
                    isSidebarMode
                    sharedCanvasRef={mobileCanvasRef}
                  />

                  <Step2SizeAndColor
                    selectedProduct={selectedProduct}
                    skipSize={currentProduct.skipClothingSize}
                    selectedSize={clothingSize}
                    onSizeSelect={setClothingSize}
                    availableColors={[]}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                  />
                  <Step4Parameters
                    product={currentProduct}
                    embroiderySize={embroiderySize}
                    onEmbroiderySizeChange={setEmbroiderySize}
                    isCompact
                    onSizeButtonClick={handleSizeButtonClick}
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-3xl bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="sticky bottom-4 bg-white rounded-2xl border border-black/8 shadow-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">სულ</span>
                    <p className="text-2xl font-black text-gray-900">GEL {totalPrice.toFixed(2)}</p>
                  </div>
                  <Button
                    className="h-12 w-full bg-accent text-white text-base font-bold hover:bg-accent-hover shadow-lg rounded-xl transition-all"
                    disabled={!isStepComplete()}
                    onClick={handleNext}
                  >
                    შეჯამება & შეკვეთა
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 5 && selectedProduct !== null && embroiderySize !== null && (
            <Step5Summary
              selectedProduct={selectedProduct}
              orderIntent={orderIntent ?? undefined}
              clothingSize={clothingSize}
              selectedColor={selectedColor}
              frontDesigns={frontDesigns}
              backDesigns={backDesigns}
              embroiderySize={embroiderySize}
              orderNote={orderNote}
              onOrderNoteChange={setOrderNote}
            />
          )}
        </div>
      </div>

      {orderIntent === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              დიზაინის დაწყებამდე
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              გთხოვთ, დიზაინის რედაქტორის გახსნამდე აირჩიოთ ერთი ვარიანტი.
            </p>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => setOrderIntent("own-product")}
                className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-left transition hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <p className="text-base font-semibold text-gray-900">ჩემს პროდუქტზე დიზაინი</p>
                <p className="mt-1 text-xs text-gray-500">
                  პროდუქტების სიაში გამოჩნდება ჯინსი.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOrderIntent("buy-product")}
                className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-left transition hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <p className="text-base font-semibold text-gray-900">პროდუქტის ყიდვა + დიზაინი</p>
                <p className="mt-1 text-xs text-gray-500">
                  პროდუქტების სიაში ჯინსი არ გამოჩნდება.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
