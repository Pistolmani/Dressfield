"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import {
  PLACEMENT_OPTIONS,
  SIZE_OPTIONS,
  THREAD_COLOR_OPTIONS,
} from "@/lib/custom-orders";
import { useCustomOrderStore } from "@/stores/custom-order-store";

type FabricModule = typeof import("fabric");

function getLabel(options: ReadonlyArray<{ value: string; label: string }>, value: string | null) {
  return options.find((option) => option.value === value)?.label || "არ არის არჩეული";
}

export function MockupPreviewStep() {
  const selectedProduct = useCustomOrderStore((state) => state.selectedProduct);
  const design = useCustomOrderStore((state) => state.design);
  const totalPrice = useCustomOrderStore((state) => state.totalPrice);
  const setStep = useCustomOrderStore((state) => state.setStep);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricModule, setFabricModule] = useState<FabricModule | null>(null);

  useEffect(() => {
    import("fabric").then(setFabricModule);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !fabricModule || !design) {
      return;
    }

    const fabricCanvas = new fabricModule.fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      selection: false,
    });
    fabricCanvas.backgroundColor = "#f3f4f6";
    fabricCanvas.renderAll();

    const loadDesign = () => {
      fabricModule.fabric.Image.fromURL(
        design.previewDataUrl,
        (image) => {
          const baseWidth = image.width || 200;
          const baseHeight = image.height || 200;
          image.set({
            selectable: false,
            evented: false,
            left: ((design.positionX ?? 30) / 100) * fabricCanvas.width!,
            top: ((design.positionY ?? 30) / 100) * fabricCanvas.height!,
            scaleX: (((design.width ?? 40) / 100) * fabricCanvas.width!) / baseWidth,
            scaleY: (((design.height ?? 40) / 100) * fabricCanvas.height!) / baseHeight,
          });
          fabricCanvas.add(image);
          fabricCanvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    };

    if (selectedProduct?.primaryImageUrl) {
      fabricModule.fabric.Image.fromURL(
        selectedProduct.primaryImageUrl,
        (image) => {
          image.set({ selectable: false, evented: false, left: 0, top: 0 });
          image.scaleToWidth(fabricCanvas.width!);
          image.scaleToHeight(fabricCanvas.height!);
          fabricCanvas.add(image);
          image.sendToBack();
          loadDesign();
        },
        { crossOrigin: "anonymous" }
      );
    } else {
      loadDesign();
    }

    return () => {
      fabricCanvas.dispose();
    };
  }, [design, fabricModule, selectedProduct]);

  if (!design) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">ჯერ პარამეტრების არჩევა არის საჭირო.</p>
        <Button variant="outline" onClick={() => setStep(4)}>
          დაბრუნება პარამეტრებზე
        </Button>
      </div>
    );
  }

  const threadColorLabel =
    THREAD_COLOR_OPTIONS.find((option) => option.value === design.threadColor)?.label ||
    design.threadColor;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setStep(4)}>
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <div className="mx-auto flex w-full max-w-[500px] justify-center">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
            შეკვეთის შეჯამება
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">პროდუქტი</span>
              <span>{selectedProduct?.name || "ცარიელი ტილო"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">განთავსება</span>
              <span>{getLabel(PLACEMENT_OPTIONS, design.placement)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">ზომა</span>
              <span>{getLabel(SIZE_OPTIONS, design.size)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">ძაფის ფერი</span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-black/8"
                  style={{ backgroundColor: design.threadColor }}
                />
                {threadColorLabel}
              </span>
            </div>
          </div>
          <div className="border-t border-black/8 pt-4">
            <p className="text-sm text-muted-foreground">სულ</p>
            <p className="font-[family-name:var(--font-inter)] text-3xl font-semibold text-accent">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <Button className="w-full bg-accent text-white hover:bg-accent-hover" onClick={() => setStep(6)}>
            შეკვეთის გაფორმება
          </Button>
        </div>
      </div>
    </div>
  );
}
