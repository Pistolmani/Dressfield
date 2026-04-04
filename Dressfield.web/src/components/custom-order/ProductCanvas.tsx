"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DesignItem, DesignTransform, ProductType } from "@/config/custom-order";

const CANVAS_SIZE = 520;
const MIN_ZOOM_FACTOR = 0.6;
const MAX_ZOOM_FACTOR = 4;
const ZOOM_STEP = 1.15;

export interface ProductCanvasHandle {
  flipH: () => void;
  flipV: () => void;
  setBrightness: (value: number) => void;
  getActiveDesignUrl: () => string | null;
  getActiveDesignId: () => string | null;
}

interface ProductCanvasProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
  onDesignTransformChange?: (id: string, transform: DesignTransform) => void;
}

type FabricModule = typeof import("fabric");
type FabricCanvas = import("fabric").fabric.Canvas;
type FabricImage  = import("fabric").fabric.Image;
type FabricCanvasObject = import("fabric").fabric.Object & { _designId?: string };
type FabricDesignImage = FabricImage & { _designId?: string };

export const ProductCanvas = forwardRef<ProductCanvasHandle, ProductCanvasProps>(
  function ProductCanvas({ product, designs, activeSide, onDesignTransformChange }, ref) {
    const canvasElRef    = useRef<HTMLCanvasElement>(null);
    const fabricRef      = useRef<FabricCanvas | null>(null);
    const designObjsRef  = useRef<Map<string, FabricImage>>(new Map());
    const urlMapRef      = useRef<Map<string, string>>(new Map());
    const canvasSessionRef = useRef(0);
    const containerRef   = useRef<HTMLDivElement>(null);
    const [fabricModule, setFabricModule] = useState<FabricModule | null>(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [zoomPercent, setZoomPercent]   = useState(100);
    const baseScaleRef  = useRef(1);
    const zoomFactorRef = useRef(1);
    const isPanningRef  = useRef(false);
    const lastPanRef    = useRef<{ x: number; y: number } | null>(null);

    const clampZoomFactor = useCallback((value: number) => (
      Math.min(Math.max(value, MIN_ZOOM_FACTOR), MAX_ZOOM_FACTOR)
    ), []);

    const applyZoomFactor = useCallback((nextFactor: number, point?: { x: number; y: number }) => {
      const fc = fabricRef.current;
      const fabric = fabricModule;
      if (!fc || !fabric) return;

      const clamped = clampZoomFactor(nextFactor);
      zoomFactorRef.current = clamped;
      const targetZoom = baseScaleRef.current * clamped;

      const zoomPoint = point
        ? new fabric.fabric.Point(point.x, point.y)
        : new fabric.fabric.Point(fc.getWidth() / 2, fc.getHeight() / 2);

      fc.zoomToPoint(zoomPoint, targetZoom);
      setZoomPercent(Math.round(clamped * 100));
      fc.requestRenderAll();
    }, [clampZoomFactor, fabricModule]);
    // Imperative handle
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
      getActiveDesignId() {
        const fc = fabricRef.current;
        const obj = fc?.getActiveObject() as (FabricImage & { _designId?: string }) | undefined;
        return obj?._designId ?? null;
      },
    }), [fabricModule]);
    // Load fabric once
    useEffect(() => {
      import("fabric").then((mod) => setFabricModule(mod));
    }, []);
    // Helper: add one design to canvas
    const addDesignObj = useCallback((fabric: FabricModule, fc: FabricCanvas, item: DesignItem, zone: { x: number; y: number; width: number; height: number }, sessionId: number) => {
      urlMapRef.current.set(item.id, item.url);
      fabric.fabric.Image.fromURL(
        item.url,
        (img) => {
          if (canvasSessionRef.current !== sessionId || fabricRef.current !== fc) return;

          // Never allow duplicate canvas objects for the same design id.
          fc.getObjects().forEach((obj) => {
            if ((obj as FabricCanvasObject)._designId === item.id) {
              fc.remove(obj);
            }
          });

          const imgW = img.width  || 100;
          const imgH = img.height || 100;
          const defaultScale = Math.min((zone.width * 0.8) / imgW, (zone.height * 0.8) / imgH);
          const transform = item.transform;
          const left = transform?.left ?? zone.x + zone.width / 2;
          const top = transform?.top ?? zone.y + zone.height / 2;
          const scaleX = transform?.scaleX ?? defaultScale;
          const scaleY = transform?.scaleY ?? defaultScale;
          const angle = transform?.angle ?? 0;

          (img as FabricImage & { _designId: string })._designId = item.id;

          img.set({
            left,
            top,
            scaleX,
            scaleY,
            angle,
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
    // Helper: load background SVG
    const loadBackground = useCallback((fabric: FabricModule, fc: FabricCanvas, svgUrl: string, onDone: () => void) => {
      fabric.fabric.loadSVGFromURL(svgUrl, (objects, options) => {
        // Remove any existing background
        const existing = fc.getObjects().filter((o) => !(o as FabricCanvasObject)._designId);
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
    // Init canvas and reload when side or product changes
    useEffect(() => {
      if (!fabricModule || !canvasElRef.current) return;
      const designObjs = designObjsRef.current;

      // Dispose old
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        designObjs.clear();
      }

      setIsLoading(true);
      const sessionId = canvasSessionRef.current + 1;
      canvasSessionRef.current = sessionId;

      const initialWidth = containerRef.current?.clientWidth || CANVAS_SIZE;
      const initialScale = initialWidth / CANVAS_SIZE;
      baseScaleRef.current = initialScale;
      zoomFactorRef.current = 1;
      setZoomPercent(100);
      isPanningRef.current = false;
      lastPanRef.current = null;

      const fc = new fabricModule.fabric.Canvas(canvasElRef.current, {
        width: initialWidth, height: initialWidth,
        selection: false, backgroundColor: "#F9FAFB",
      });
      fc.setZoom(initialScale);
      fc.defaultCursor = "grab";
      fabricRef.current = fc;

      const svgUrl = activeSide === "back" ? product.svgTemplateBack : product.svgTemplate;
      const zone   = activeSide === "back" ? product.designZoneBack   : product.designZone;

      loadBackground(fabricModule, fc, svgUrl, () => {
        // Re-add all current designs
        designs.forEach((d) => addDesignObj(fabricModule, fc, d, zone, sessionId));
        setIsLoading(false);
      });

      // Uniform scale
      fc.on("object:scaling", (e) => {
        const obj = e.target;
        if (obj) obj.scaleY = obj.scaleX;
      });

      const persistTransform = (obj?: FabricCanvasObject) => {
        if (!obj?._designId || !onDesignTransformChange) return;
        onDesignTransformChange(obj._designId, {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
        });
      };

      // Persist once interaction finishes (not on every move frame) to keep dragging smooth.
      fc.on("object:modified", (e) => persistTransform(e.target as FabricCanvasObject | undefined));

      // Mouse wheel zoom
      fc.on("mouse:wheel", (opt) => {
        const wheelEvent = opt.e as WheelEvent;
        const deltaScale = wheelEvent.deltaY > 0 ? 1 / 1.08 : 1.08;
        const nextFactor = zoomFactorRef.current * deltaScale;
        applyZoomFactor(nextFactor, { x: wheelEvent.offsetX, y: wheelEvent.offsetY });
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      // Pan viewport by dragging empty area (or Alt + drag).
      fc.on("mouse:down", (opt) => {
        const event = opt.e as MouseEvent;
        const shouldPan = !opt.target || event.altKey;
        if (!shouldPan) return;

        isPanningRef.current = true;
        lastPanRef.current = { x: event.clientX, y: event.clientY };
        fc.defaultCursor = "grabbing";
      });

      fc.on("mouse:move", (opt) => {
        if (!isPanningRef.current) return;

        const event = opt.e as MouseEvent;
        const prev = lastPanRef.current;
        const vpt = fc.viewportTransform;
        if (!prev || !vpt) return;

        const dx = event.clientX - prev.x;
        const dy = event.clientY - prev.y;
        vpt[4] += dx;
        vpt[5] += dy;
        lastPanRef.current = { x: event.clientX, y: event.clientY };
        fc.requestRenderAll();
      });

      const stopPanning = () => {
        isPanningRef.current = false;
        lastPanRef.current = null;
        fc.defaultCursor = "grab";
      };

      fc.on("mouse:up", stopPanning);
      fc.on("mouse:out", stopPanning);

      // Responsive resizing
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          const baseScale = width / CANVAS_SIZE;
          baseScaleRef.current = baseScale;
          const targetZoom = baseScale * zoomFactorRef.current;
          if (fabricRef.current) {
            fabricRef.current.setDimensions({ width, height: width });
            fabricRef.current.zoomToPoint(
              new fabricModule.fabric.Point(width / 2, width / 2),
              targetZoom
            );
            fabricRef.current.requestRenderAll();
          }
        }
      });
      
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        observer.disconnect();
        isPanningRef.current = false;
        lastPanRef.current = null;
        canvasSessionRef.current += 1;
        fc.dispose();
        fabricRef.current = null;
        designObjs.clear();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fabricModule, product.svgTemplate, product.svgTemplateBack, activeSide, onDesignTransformChange]);
    // Sync designs array: add new, remove deleted
    useEffect(() => {
      const fc     = fabricRef.current;
      const fabric = fabricModule;
      if (!fc || !fabric || isLoading) return;
      const sessionId = canvasSessionRef.current;

      const zone = activeSide === "back" ? product.designZoneBack : product.designZone;

      const canvasIds  = new Set(designObjsRef.current.keys());
      const designIds  = new Set(designs.map((d) => d.id));

      // Remove deleted or updated
      canvasIds.forEach((id) => {
        const matchingDesign = designs.find((d) => d.id === id);
        const isUrlChanged = matchingDesign && urlMapRef.current.get(id) !== matchingDesign.url;
        
        if (!designIds.has(id)) {
          // Deleted
          const obj = designObjsRef.current.get(id);
          if (obj) fc.remove(obj);
          designObjsRef.current.delete(id);
          urlMapRef.current.delete(id);
        } else if (isUrlChanged) {
          // Updated URL
          const obj = designObjsRef.current.get(id);
          const oldProps = obj ? { left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle } : null;
          
          if (obj) fc.remove(obj);
          designObjsRef.current.delete(id);
          urlMapRef.current.delete(id);
          
          urlMapRef.current.set(id, matchingDesign.url);
          fabric.fabric.Image.fromURL(
            matchingDesign.url,
            (img) => {
              if (canvasSessionRef.current !== sessionId || fabricRef.current !== fc) return;

              fc.getObjects().forEach((canvasObj) => {
                if ((canvasObj as FabricCanvasObject)._designId === id) {
                  fc.remove(canvasObj);
                }
              });

              (img as FabricDesignImage)._designId = id;
              img.set({
                ...(oldProps ? oldProps : {
                  left: zone.x + zone.width / 2,
                  top: zone.y + zone.height / 2,
                  scaleX: Math.min((zone.width * 0.8) / (img.width || 100), (zone.height * 0.8) / (img.height || 100)),
                  scaleY: Math.min((zone.width * 0.8) / (img.width || 100), (zone.height * 0.8) / (img.height || 100)),
                }),
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
              designObjsRef.current.set(id, img as FabricImage);
            },
            { crossOrigin: "anonymous" }
          );
        }
      });

      // Add new
      designs.forEach((d) => {
        if (!canvasIds.has(d.id)) {
          addDesignObj(fabric, fc, d, zone, sessionId);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designs, isLoading]);

    function handleZoom(dir: "in" | "out") {
      const multiplier = dir === "in" ? ZOOM_STEP : 1 / ZOOM_STEP;
      applyZoomFactor(zoomFactorRef.current * multiplier);
    }

    function handleZoomSlider(nextPercent: number) {
      applyZoomFactor(nextPercent / 100);
    }

    function handleFit() {
      applyZoomFactor(1);
    }

    return (
      <div className="relative flex flex-col items-center gap-2 w-full max-w-[520px] mx-auto">
        {isLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
        <div
          ref={containerRef}
          className="w-full aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        >
          <canvas ref={canvasElRef} />
        </div>

        <div className="w-full max-w-[460px] flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => handleZoom("out")} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <input
            type="range"
            min={Math.round(MIN_ZOOM_FACTOR * 100)}
            max={Math.round(MAX_ZOOM_FACTOR * 100)}
            step={1}
            value={zoomPercent}
            onChange={(event) => handleZoomSlider(Number(event.target.value))}
            className="flex-1 accent-accent"
            aria-label="Canvas zoom"
          />
          <span className="min-w-12 text-xs text-muted-foreground select-none text-right">
            {zoomPercent}%
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => handleZoom("in")} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFit} title="Fit canvas">
            Fit
          </Button>
        </div>

        {designs.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            გადაათრიე სურათი / ცარიელ ადგილას გადაათრიე პროდუქტი
          </p>
        )}
      </div>
    );
  }
);
