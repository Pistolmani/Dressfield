"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Shirt, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Step1ProductSelector } from "@/components/custom-order/Step1_ProductSelector";
import { Step2SizeAndColor } from "@/components/custom-order/Step2_SizeAndColor";
import { Step3DesignUpload } from "@/components/custom-order/Step3_DesignUpload";
import { Step4Parameters } from "@/components/custom-order/Step4_Parameters";
import { Step5Summary } from "@/components/custom-order/Step5_Summary";
import type { ProductCanvasHandle } from "@/components/custom-order/ProductCanvas";
import { cn } from "@/lib/utils";
import { useDesignHistory } from "@/hooks/useDesignHistory";
import {
  CAP_EMBROIDERY_PREVIEW,
  PRODUCT_TYPES,
  PRODUCT_COLORS,
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

const BUY_PRODUCT_HIDDEN_PRODUCT_IDS = new Set<ProductTypeId>(["jeans"]);

function getVisibleProducts(intent: OrderIntent | null) {
  return PRODUCT_TYPES.filter(
    (product) => intent === "own-product" || !BUY_PRODUCT_HIDDEN_PRODUCT_IDS.has(product.id)
  );
}

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
  // Once the user explicitly picks an embroidery size, that choice drives the price
  // and the canvas auto-detector must not override it (otherwise a manual resize can
  // silently downgrade the tier and charge less than the option the user selected).
  const embroiderySizeLockedRef = useRef(false);
  // Summary note
  const [orderNote, setOrderNote] = useState("");

  // Undo/redo history
  const history = useDesignHistory();
  const [historyTick, setHistoryTick] = useState(0);

  const pushHistory = useCallback(() => {
    // Use a microtask so state has settled
    queueMicrotask(() => {
      setHistoryTick((t) => t + 1);
    });
  }, []);

  // Snapshot after historyTick changes (design state has settled)
  const frontDesignsRef = useRef(frontDesigns);
  const backDesignsRef = useRef(backDesigns);

  useEffect(() => {
    frontDesignsRef.current = frontDesigns;
    backDesignsRef.current = backDesigns;
  }, [frontDesigns, backDesigns]);

  useEffect(() => {
    if (historyTick === 0) return;
    history.pushState(frontDesignsRef.current, backDesignsRef.current);
  }, [historyTick, history]);

  const handleUndo = useCallback(() => {
    const snapshot = history.undo();
    if (!snapshot) return;
    setFrontDesigns(snapshot.front);
    setBackDesigns(snapshot.back);
  }, [history]);

  const handleRedo = useCallback(() => {
    const snapshot = history.redo();
    if (!snapshot) return;
    setFrontDesigns(snapshot.front);
    setBackDesigns(snapshot.back);
  }, [history]);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const visibleProducts = useMemo(
    () => getVisibleProducts(orderIntent),
    [orderIntent],
  );

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
    pushHistory();
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
    pushHistory();
  }

  function replaceDesignUrl(id: string, newUrl: string) {
    const replaceIn = (prev: DesignItem[]) => prev.map((design) => {
      if (design.id !== id) return design;
      if (design.url !== newUrl) revokeIfBlobUrl(design.url);
      return { ...design, url: newUrl };
    });

    setFrontDesigns((prev) => replaceIn(prev));
    setBackDesigns((prev) => replaceIn(prev));
    pushHistory();
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

  function duplicateDesign(id: string) {
    setActiveDesigns((prev) => {
      const source = prev.find((d) => d.id === id);
      if (!source) return prev;
      const newId = `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const offsetTransform: DesignTransform | undefined = source.transform
        ? { ...source.transform, left: source.transform.left + 10, top: source.transform.top + 10 }
        : undefined;
      return [...prev, { id: newId, url: source.url, transform: offsetTransform }];
    });
    pushHistory();
  }

  function moveDesign(id: string, direction: "up" | "down") {
    setActiveDesigns((prev) => {
      const idx = prev.findIndex((d) => d.id === id);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
    pushHistory();
  }

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
    embroiderySizeLockedRef.current = false;
    // Auto-set embroidery size for fixed-zone products (e.g. cap).
    // Cap uses fixed 6x30cm placement and maps to L pricing.
    setEmbroiderySize(
      id === "cap"
        ? "L"
        : product?.skipEmbroiderySizePicker
          ? "S"
          : null
    );
    setOrderNote("");
    setStep(3); // Auto-advance to unified editor
  };

  function handleOrderIntentSelect(intent: OrderIntent) {
    const selectedProductStillVisible =
      !selectedProduct ||
      getVisibleProducts(intent).some((product) => product.id === selectedProduct);

    if (!selectedProductStillVisible) {
      allDesigns.forEach((design) => revokeIfBlobUrl(design.url));
      setSelectedProduct(null);
      setClothingSize(null);
      setSelectedColor(null);
      setFrontDesigns([]);
      setBackDesigns([]);
      setActiveSide("front");
      setEmbroiderySize(null);
      embroiderySizeLockedRef.current = false;
      setOrderNote("");
      setStep(1);
    }

    setOrderIntent(intent);
  }

  const handleSizeButtonClick = useCallback((fraction: number) => {
    setResizeRequest((prev) => ({ fraction, seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  // Manual size selection (from the size buttons): authoritative for pricing.
  const handleEmbroiderySizeManualChange = useCallback((sizeId: EmbroiderySizeId) => {
    embroiderySizeLockedRef.current = true;
    setEmbroiderySize(sizeId);
  }, []);

  const handleEmbroiderySizeDetected = useCallback((sizeId: EmbroiderySizeId) => {
    // The user's explicit pick wins — ignore canvas-derived sizes once locked.
    if (embroiderySizeLockedRef.current) return;
    if (selectedProduct === "cap") {
      if (sizeId === "S" || sizeId === "M" || sizeId === "L") {
        setEmbroiderySize(sizeId);
        return;
      }
      setEmbroiderySize("L");
      return;
    }
    setEmbroiderySize(sizeId);
  }, [selectedProduct]);

  const currentProduct =
    selectedProduct !== null
      ? PRODUCT_TYPES.find((p) => p.id === selectedProduct) ?? null
      : null;
  const selectedEmbroidery =
    embroiderySize !== null
      ? EMBROIDERY_SIZES.find((size) => size.id === embroiderySize) ?? null
      : null;
  const capScaleLimitFraction =
    currentProduct?.id === "cap"
      ? embroiderySize === "S" || embroiderySize === "M" || embroiderySize === "L"
        ? CAP_EMBROIDERY_PREVIEW[embroiderySize].fraction
        : CAP_EMBROIDERY_PREVIEW.L.fraction
      : null;
  const isOwnProductMode = orderIntent === "own-product";
  const embroideryExtra = selectedEmbroidery?.extraPrice ?? 0;
  const basePrice = isOwnProductMode ? 0 : (currentProduct?.basePrice ?? 0);
  const designCount = Math.max(allDesigns.length, 1);
  const totalPrice = basePrice + embroideryExtra * designCount;

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("max-w-7xl mx-auto px-4", step === 5 ? "py-4 lg:py-8" : "py-4 lg:py-12")}>
        {/* Page header — compact on mobile when in editor */}
        <div className={cn(step === 3 ? "mb-4" : "mb-8", step === 5 && "mb-6")}>
          <h1 className={cn("font-extrabold tracking-tight text-gray-900 mb-1", step === 5 ? "text-2xl sm:text-4xl" : step === 3 ? "text-xl sm:text-5xl" : "text-3xl sm:text-5xl")}>
            {step === 1 ? "რომელ ტანსაცმელზე გინდა ნაქარგი?" : "შექმენი შენი დიზაინი"}
          </h1>
          <p className={cn("text-gray-500 max-w-2xl", step === 5 ? "text-sm" : step === 3 ? "text-xs sm:text-lg" : "text-base sm:text-lg")}>
            {step === 1 
              ? "აირჩიე პროდუქტი კოლექციიდან და მოარგე შენი იდეები." 
              : `${currentProduct?.label} · დაამატე დიზაინი`}
          </p>
        </div>

        {/* Unified Step Content */}
        <div className={step === 3 ? "" : "min-h-[500px]" }>

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
              <div className="hidden lg:flex flex-row gap-5 items-start">
                {/* Left Panel: Tools & Layers */}
                <div className="w-44 space-y-5 sticky top-8 flex-shrink-0">
                  <Step3DesignUpload
                    product={currentProduct}
                    designs={activeDesigns}
                    activeSide={activeSide}
                    selectedColor={selectedColor}
                    onDesignAdd={addDesign}
                    onDesignRemove={removeDesign}
                    onDesignReplace={replaceDesignUrl}
                    onDesignTransformChange={updateDesignTransform}
                    onDesignDuplicate={duplicateDesign}
                    onDesignMove={moveDesign}
                    onSideChange={setActiveSide}
                    isSidebarMode
                    maxScaleFraction={capScaleLimitFraction}
                    sharedCanvasRef={desktopCanvasRef}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={history.canUndo()}
                    canRedo={history.canRedo()}
                  />
                </div>

                {/* Center Panel: Preview */}
                <div className="flex-1 w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/80 to-slate-200/40 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 min-h-[500px] relative shadow-[inset_0_5px_30px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.02]">
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
                    maxScaleFraction={capScaleLimitFraction}
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
                <div className="w-64 space-y-6 sticky top-8 flex-shrink-0">
                  <Step2SizeAndColor
                    selectedProduct={selectedProduct}
                    skipSize={currentProduct.skipClothingSize}
                    selectedSize={clothingSize}
                    onSizeSelect={setClothingSize}
                    availableColors={isOwnProductMode || !selectedProduct ? [] : (PRODUCT_COLORS[selectedProduct] ?? [])}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                  />
                  <Step4Parameters
                    product={currentProduct}
                    embroiderySize={embroiderySize}
                    onEmbroiderySizeChange={handleEmbroiderySizeManualChange}
                    designCount={allDesigns.length}
                    isCompact
                    onSizeButtonClick={handleSizeButtonClick}
                  />
                  <div className="pt-8 border-t border-black/8">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                      <div className="text-right">
                        <p className="text-3xl font-black text-gray-900 leading-none">GEL {totalPrice.toFixed(2)}</p>
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
              {/* NOTE: pb-36 ensures content is not hidden behind the sticky footer */}
              <div className="flex flex-col lg:hidden gap-3 pb-36">

                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-black/5 p-3 relative shadow-inner">
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
                    maxScaleFraction={capScaleLimitFraction}
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
                    onDesignDuplicate={duplicateDesign}
                    onDesignMove={moveDesign}
                    onSideChange={setActiveSide}
                    isSidebarMode
                    maxScaleFraction={capScaleLimitFraction}
                    sharedCanvasRef={mobileCanvasRef}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={history.canUndo()}
                    canRedo={history.canRedo()}
                  />

                  <Step2SizeAndColor
                    selectedProduct={selectedProduct}
                    skipSize={currentProduct.skipClothingSize}
                    selectedSize={clothingSize}
                    onSizeSelect={setClothingSize}
                    availableColors={isOwnProductMode || !selectedProduct ? [] : (PRODUCT_COLORS[selectedProduct] ?? [])}
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                  />
                  <Step4Parameters
                    product={currentProduct}
                    embroiderySize={embroiderySize}
                    onEmbroiderySizeChange={handleEmbroiderySizeManualChange}
                    designCount={allDesigns.length}
                    isCompact
                    onSizeButtonClick={handleSizeButtonClick}
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-3xl bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-black/8 shadow-2xl px-4 py-3 flex items-center gap-3">
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">სულ</span>
                    <p className="text-xl font-black text-gray-900">GEL {totalPrice.toFixed(2)}</p>
                  </div>
                  <Button
                    className="flex-1 h-12 bg-accent text-white text-base font-bold hover:bg-accent-hover shadow-lg rounded-xl transition-all"
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

            <div className="mt-6 grid gap-4">
              <button
                type="button"
                onClick={() => handleOrderIntentSelect("own-product")}
                className="group flex w-full items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 text-left transition-all hover:border-accent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
                  <Shirt className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">ჩემს პროდუქტზე დიზაინი</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    გამოგვიგზავნე შენი ტანსაცმელი და ჩვენ მოვქარგავთ (მაგ. ჯინსი).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleOrderIntentSelect("buy-product")}
                className="group flex w-full items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 text-left transition-all hover:border-accent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">პროდუქტის ყიდვა + დიზაინი</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    შეარჩიე ჩვენი კატალოგიდან და შექმენი უნიკალური დიზაინი.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
