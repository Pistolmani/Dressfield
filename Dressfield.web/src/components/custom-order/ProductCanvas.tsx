"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DesignItem, ProductType } from "@/config/custom-order";

const CANVAS_SIZE = 520;

export interface ProductCanvasHandle {
  flipH: () => void;
  flipV: () => void;
  setBrightness: (value: number) => void;
  getActiveDesignUrl: () => string | null;
}

interface ProductCanvasProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
}

type FabricModule = typeof import("fabric");
type FabricCanvas = import("fabric").fabric.Canvas;
type FabricImage  = import("fabric").fabric.Image;

export const ProductCanvas = forwardRef<ProductCanvasHandle, ProductCanvasProps>(
  function ProductCanvas({ product, designs, activeSide }, ref) {
    const canvasElRef    = useRef<HTMLCanvasElement>(null);
    const fabricRef      = useRef<FabricCanvas | null>(null);
    const designObjsRef  = useRef<Map<string, FabricImage>>(new Map());
    const urlMapRef      = useRef<Map<string, string>>(new Map());
    const [fabricModule, setFabricModule] = useState<FabricModule | null>(null);
    const [isLoading, setIsLoading]       = useState(true);

    // ── Imperative handle ───────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      flipH() {
        const fc  = fabricRef.current;
        const obj = fc?.getActiveObject() as FabricImage | undefined;
        if (!obj || !fc) return;
        obj.set({ flipX: !obj.flipX });
        fc.renderAll();
      },
      flipV() {
        const fc  = fabricRef.current;
        const obj = fc?.getActiveObject() as FabricImage | undefined;
        if (!obj || !fc) return;
        obj.set({ flipY: !obj.flipY });
        fc.renderAll();
      },
      setBrightness(value: number) {
        const fc     = fabricRef.current;
        const fabric = fabricModule;
        const obj    = fc?.getActiveObject() as FabricImage | undefined;
        if (!obj || !fc || !fabric) return;
        const filter = new fabric.fabric.Image.filters.Brightness({ brightness: value });
        obj.filters  = [filter];
        obj.applyFilters();
        fc.renderAll();
      },
      getActiveDesignUrl() {
        const fc = fabricRef.current;
        const obj = fc?.getActiveObject() as (FabricImage & { _designId?: string }) | undefined;
        if (!obj?._designId) return null;
        return urlMapRef.current.get(obj._designId) ?? null;
      },
    }), [fabricModule]);

    // ── Load fabric once ────────────────────────────────────────────────────
    useEffect(() => {
      import("fabric").then((mod) => setFabricModule(mod));
    }, []);

    // ── Helper: add one design to canvas ───────────────────────────────────
    const addDesignObj = useCallback((fabric: FabricModule, fc: FabricCanvas, item: DesignItem, zone: { x: number; y: number; width: number; height: number }) => {
      urlMapRef.current.set(item.id, item.url);
      fabric.fabric.Image.fromURL(
        item.url,
        (img) => {
          const imgW = img.width  || 100;
          const imgH = img.height || 100;
          const scale = Math.min((zone.width * 0.8) / imgW, (zone.height * 0.8) / imgH);

          (img as FabricImage & { _designId: string })._designId = item.id;

          img.set({
            left: zone.x + zone.width  / 2,
            top:  zone.y + zone.height / 2,
            scaleX: scale, scaleY: scale,
            originX: "center", originY: "center",
            selectable: true, evented: true,
            hasControls: true, hasBorders: true,
            cornerColor: "#7C3AED", cornerStrokeColor: "#7C3AED",
            borderColor: "#7C3AED", transparentCorners: false, cornerSize: 8,
          });
          img.setControlsVisibility({ mtr: true });

          fc.add(img);
          fc.setActiveObject(img);
          fc.renderAll();
          designObjsRef.current.set(item.id, img as FabricImage);
        },
        { crossOrigin: "anonymous" }
      );
    }, []);

    // ── Helper: load background SVG ─────────────────────────────────────────
    const loadBackground = useCallback((fabric: FabricModule, fc: FabricCanvas, svgUrl: string, onDone: () => void) => {
      fabric.fabric.loadSVGFromURL(svgUrl, (objects, options) => {
        // Remove any existing background
        const existing = fc.getObjects().filter((o) => !(o as any)._designId);
        existing.forEach((o) => fc.remove(o));

        const svg = fabric.fabric.util.groupSVGElements(objects, options);
        const scale = Math.min(CANVAS_SIZE / (svg.width || CANVAS_SIZE), CANVAS_SIZE / (svg.height || CANVAS_SIZE));
        svg.scale(scale);
        svg.set({
          left: (CANVAS_SIZE - (svg.width || CANVAS_SIZE) * scale) / 2,
          top:  (CANVAS_SIZE - (svg.height || CANVAS_SIZE) * scale) / 2,
          selectable: false, evented: false,
          originX: "left", originY: "top",
        });
        fc.add(svg);
        fc.sendToBack(svg);
        fc.renderAll();
        onDone();
      });
    }, []);

    // ── Init canvas & reload when side or product changes ───────────────────
    useEffect(() => {
      if (!fabricModule || !canvasElRef.current) return;

      // Dispose old
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        designObjsRef.current.clear();
      }

      setIsLoading(true);

      const fc = new fabricModule.fabric.Canvas(canvasElRef.current, {
        width: CANVAS_SIZE, height: CANVAS_SIZE,
        selection: false, backgroundColor: "#F9FAFB",
      });
      fabricRef.current = fc;

      const svgUrl = activeSide === "back" ? product.svgTemplateBack : product.svgTemplate;
      const zone   = activeSide === "back" ? product.designZoneBack   : product.designZone;

      loadBackground(fabricModule, fc, svgUrl, () => {
        // Re-add all current designs
        designs.forEach((d) => addDesignObj(fabricModule, fc, d, zone));
        setIsLoading(false);
      });

      // Uniform scale
      fc.on("object:scaling", (e) => {
        const obj = e.target;
        if (obj) obj.scaleY = obj.scaleX;
      });

      // Mouse wheel zoom
      fc.on("mouse:wheel", (opt) => {
        const delta = (opt.e as WheelEvent).deltaY;
        let zoom = fc.getZoom();
        zoom = Math.min(Math.max(zoom * 0.999 ** delta, 0.3), 5);
        fc.zoomToPoint(
          new fabricModule.fabric.Point((opt.e as WheelEvent).offsetX, (opt.e as WheelEvent).offsetY),
          zoom
        );
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      return () => {
        fc.dispose();
        fabricRef.current = null;
        designObjsRef.current.clear();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fabricModule, product.svgTemplate, product.svgTemplateBack, activeSide]);

    // ── Sync designs array: add new, remove deleted ─────────────────────────
    useEffect(() => {
      const fc     = fabricRef.current;
      const fabric = fabricModule;
      if (!fc || !fabric || isLoading) return;

      const zone = activeSide === "back" ? product.designZoneBack : product.designZone;

      const canvasIds  = new Set(designObjsRef.current.keys());
      const designIds  = new Set(designs.map((d) => d.id));

      // Remove deleted
      canvasIds.forEach((id) => {
        if (!designIds.has(id)) {
          const obj = designObjsRef.current.get(id);
          if (obj) fc.remove(obj);
          designObjsRef.current.delete(id);
          urlMapRef.current.delete(id);
        }
      });

      // Add new
      designs.forEach((d) => {
        if (!canvasIds.has(d.id)) {
          addDesignObj(fabric, fc, d, zone);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designs, isLoading]);

    function handleZoom(dir: "in" | "out") {
      const fc = fabricRef.current;
      if (!fc || !fabricModule) return;
      let zoom = fc.getZoom();
      zoom = dir === "in" ? zoom * 1.2 : zoom / 1.2;
      zoom = Math.min(Math.max(zoom, 0.3), 5);
      fc.zoomToPoint(new fabricModule.fabric.Point(CANVAS_SIZE / 2, CANVAS_SIZE / 2), zoom);
    }

    return (
      <div className="relative flex flex-col items-center gap-2">
        {isLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
        <div
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        >
          <canvas ref={canvasElRef} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => handleZoom("out")} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground select-none">სქროლი / ზუმი</span>
          <Button variant="outline" size="icon-sm" onClick={() => handleZoom("in")} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {designs.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            გადაათრიე სურათი · Ctrl+Z გასაუქმებლად
          </p>
        )}
      </div>
    );
  }
);
