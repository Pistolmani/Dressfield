"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomOrderStore } from "@/stores/custom-order-store";

type FabricModule = typeof import("fabric");

export function CanvasEditorStep() {
  const selectedProduct = useCustomOrderStore((state) => state.selectedProduct);
  const design = useCustomOrderStore((state) => state.design);
  const setDesign = useCustomOrderStore((state) => state.setDesign);
  const setStep = useCustomOrderStore((state) => state.setStep);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<import("fabric").fabric.Canvas | null>(null);
  const designObjectRef = useRef<import("fabric").fabric.Object | null>(null);
  const [fabricModule, setFabricModule] = useState<FabricModule | null>(null);

  useEffect(() => {
    import("fabric").then(setFabricModule);
  }, []);

  useEffect(() => {
    if (!fabricModule || !canvasRef.current || !design) {
      return;
    }

    const fabricCanvas = new fabricModule.fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
    });
    fabricCanvasRef.current = fabricCanvas;
    fabricCanvas.backgroundColor = "#f3f4f6";
    fabricCanvas.renderAll();

    const loadDesign = () => {
      fabricModule.fabric.Image.fromURL(
        design.previewDataUrl,
        (image) => {
          const initialWidth = image.width || 200;
          const initialHeight = image.height || 200;
          image.set({
            left:
              design.positionX !== null
                ? (design.positionX / 100) * fabricCanvas.width!
                : 150,
            top:
              design.positionY !== null
                ? (design.positionY / 100) * fabricCanvas.height!
                : 150,
            scaleX:
              design.width !== null
                ? ((design.width / 100) * fabricCanvas.width!) / initialWidth
                : 200 / initialWidth,
            scaleY:
              design.height !== null
                ? ((design.height / 100) * fabricCanvas.height!) / initialHeight
                : 200 / initialHeight,
          });
          fabricCanvas.add(image);
          fabricCanvas.setActiveObject(image);
          designObjectRef.current = image;
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
          const scaleX = fabricCanvas.width! / (image.width || fabricCanvas.width!);
          const scaleY = fabricCanvas.height! / (image.height || fabricCanvas.height!);
          image.scaleX = scaleX;
          image.scaleY = scaleY;
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
      fabricCanvasRef.current = null;
      designObjectRef.current = null;
    };
  }, [design, fabricModule, selectedProduct]);

  function rotateBy(angle: number) {
    const object = designObjectRef.current;
    const fabricCanvas = fabricCanvasRef.current;

    if (!object || !fabricCanvas) return;

    object.rotate((object.angle || 0) + angle);
    fabricCanvas.renderAll();
  }

  function handleContinue() {
    const object = designObjectRef.current;
    const fabricCanvas = fabricCanvasRef.current;

    if (!object || !fabricCanvas || !design) {
      setStep(4);
      return;
    }

    setDesign({
      ...design,
      positionX: Math.round(((object.left || 0) / fabricCanvas.width!) * 100),
      positionY: Math.round(((object.top || 0) / fabricCanvas.height!) * 100),
      width: Math.round((object.getScaledWidth() / fabricCanvas.width!) * 100),
      height: Math.round((object.getScaledHeight() / fabricCanvas.height!) * 100),
    });
    setStep(4);
  }

  if (!design) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">ჯერ დიზაინი უნდა ატვირთოთ.</p>
        <Button variant="outline" onClick={() => setStep(2)}>
          დაბრუნება ატვირთვაზე
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setStep(2)}>
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight">
          დაარედაქტირეთ დიზაინი
        </h1>
        <p className="text-muted-foreground">
          გადაადგილება/ზომა: გამოიყენეთ სახელურები
        </p>
      </div>

      <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-[500px] justify-center">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => rotateBy(-15)}>
          <RotateCcw className="h-4 w-4" />
          ბრუნვა -15°
        </Button>
        <Button variant="outline" onClick={() => rotateBy(15)}>
          <RotateCw className="h-4 w-4" />
          ბრუნვა +15°
        </Button>
      </div>

      <div className="flex justify-end">
        <Button className="bg-accent text-white hover:bg-accent-hover" onClick={handleContinue}>
          გაგრძელება
        </Button>
      </div>
    </div>
  );
}
