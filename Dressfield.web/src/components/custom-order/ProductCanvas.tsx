"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMBROIDERY_SIZES } from "@/config/custom-order";
import type {
  DesignItem,
  DesignTransform,
  EmbroiderySizeId,
  ProductType,
} from "@/config/custom-order";

const CANVAS_SIZE = 500;
const MIN_ZOOM_FACTOR = 0.6;
const MAX_ZOOM_FACTOR = 4;
const ZOOM_STEP = 1.15;

export type ClipShape = "none" | "circle" | "oval" | "triangle" | "diamond";

export interface ProductCanvasHandle {
  flipH: () => void;
  flipV: () => void;
  setBrightness: (value: number) => void;
  setOpacity: (value: number) => void;
  setClipShape: (shape: ClipShape) => void;
  getActiveDesignUrl: () => string | null;
  getActiveDesignId: () => string | null;
  resizeToFraction: (fraction: number) => void;
}

interface ProductCanvasProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
  onDesignTransformChange?: (id: string, transform: DesignTransform) => void;
  onEmbroiderySizeDetected?: (sizeId: EmbroiderySizeId) => void;
  resizeRequest?: { fraction: number; seq: number } | null;
  maxScaleFraction?: number | null;
  onSelectionChange?: (hasSelection: boolean) => void;
}

type FabricModule = typeof import("fabric");
type FabricCanvas = import("fabric").fabric.Canvas;
type FabricImage  = import("fabric").fabric.Image;
type FabricCanvasObject = import("fabric").fabric.Object & { _designId?: string };
type FabricDesignImage = FabricImage & { _designId?: string };
type DesignZone = { x: number; y: number; width: number; height: number };

function applyInteractiveDesignDefaults(obj: FabricImage) {
  obj.set({
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockMovementX: false,
    lockMovementY: false,
    lockRotation: false,
    lockScalingX: false,
    lockScalingY: false,
    cornerColor: "#7C3AED",
    cornerStrokeColor: "#7C3AED",
    borderColor: "#7C3AED",
    transparentCorners: false,
    cornerSize: 8,
  });
  obj.setControlsVisibility({ mtr: true });
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (max < min) return (min + max) / 2;
  return Math.min(Math.max(value, min), max);
}

export const ProductCanvas = forwardRef<ProductCanvasHandle, ProductCanvasProps>(
  function ProductCanvas({
    product,
    designs,
    activeSide,
    onDesignTransformChange,
    onEmbroiderySizeDetected,
    resizeRequest,
    maxScaleFraction,
    onSelectionChange,
  }, ref) {
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
    const zoneRef       = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const maxScaleFractionRef = useRef<number | null>(maxScaleFraction ?? null);
    const lastDetectedSizeRef = useRef<EmbroiderySizeId | null>(null);
    const onEmbroiderySizeDetectedRef = useRef(onEmbroiderySizeDetected);
    onEmbroiderySizeDetectedRef.current = onEmbroiderySizeDetected;
    const onDesignTransformChangeRef = useRef(onDesignTransformChange);
    onDesignTransformChangeRef.current = onDesignTransformChange;
    useEffect(() => {
      maxScaleFractionRef.current = maxScaleFraction ?? null;
    }, [maxScaleFraction]);
    const computeDesignPlacement = useCallback(
      (
        imgW: number,
        imgH: number,
        zone: DesignZone,
        transform?: Partial<DesignTransform> | null
      ) => {
        const safeImgW = imgW || 100;
        const safeImgH = imgH || 100;
        const defaultScale = Math.min((zone.width * 0.8) / safeImgW, (zone.height * 0.8) / safeImgH);
        const centerLeft = zone.x + zone.width / 2;
        const centerTop = zone.y + zone.height / 2;

        const rawScaleX =
          transform && Number.isFinite(transform.scaleX)
            ? Math.max(0.01, Number(transform.scaleX))
            : defaultScale;
        const rawScaleY =
          transform && Number.isFinite(transform.scaleY)
            ? Math.max(0.01, Number(transform.scaleY))
            : defaultScale;

        const rawLeft =
          transform && Number.isFinite(transform.left) ? Number(transform.left) : centerLeft;
        const rawTop =
          transform && Number.isFinite(transform.top) ? Number(transform.top) : centerTop;
        const angle =
          transform && Number.isFinite(transform.angle) ? Number(transform.angle) : 0;

        // When restoring a saved transform, trust the exact position to prevent drift.
        // Only clamp new designs (no transform) to center them within the zone.
        // Reject transforms with invalid positions (0 or negative) to prevent top-left placement.
        if (transform && Number.isFinite(transform.left) && Number.isFinite(transform.top)) {
          const tl = Number(transform.left);
          const tt = Number(transform.top);
          if (tl <= 0 || tt <= 0) {
            // Invalid position saved (likely uninitialized) - fall through to zone center
          } else {
            return { left: rawLeft, top: rawTop, scaleX: rawScaleX, scaleY: rawScaleY, angle };
          }
        }

        const halfW = (safeImgW * rawScaleX) / 2;
        const halfH = (safeImgH * rawScaleY) / 2;
        const minLeft = zone.x + Math.min(halfW, zone.width / 2);
        const maxLeft = zone.x + Math.max(zone.width - halfW, zone.width / 2);
        const minTop = zone.y + Math.min(halfH, zone.height / 2);
        const maxTop = zone.y + Math.max(zone.height - halfH, zone.height / 2);

        return {
          left: clampNumber(rawLeft, minLeft, maxLeft),
          top: clampNumber(rawTop, minTop, maxTop),
          scaleX: rawScaleX,
          scaleY: rawScaleY,
          angle,
        };
      },
      []
    );

    const resizeActiveDesignToFraction = useCallback((fraction: number) => {
      const fc = fabricRef.current;
      const zone = zoneRef.current;
      if (!fc || !zone) return;

      const allDesignObjs = fc.getObjects().filter((o) => (o as FabricCanvasObject)._designId);
      const activeObj = fc.getActiveObject() as FabricCanvasObject | undefined;
      // Resize the selected design. If nothing is selected, only fall back to the
      // sole design when there is exactly one — never guess with multiple designs.
      // This also stops the hidden (desktop/mobile) twin canvas, which has no active
      // selection, from resizing the wrong design and writing it into shared state.
      let obj: FabricCanvasObject | undefined;
      if (activeObj?._designId) {
        obj = activeObj;
      } else if (allDesignObjs.length === 1) {
        obj = allDesignObjs[0] as FabricCanvasObject;
      } else {
        return;
      }

      const objW = obj.width || 1;
      const objH = obj.height || 1;
      const zoneMinDim = Math.min(zone.width, zone.height);
      const targetDim = fraction * zoneMinDim;
      const rawScale = targetDim / Math.max(objW, objH);
      const maxScale = Math.min(zone.width / objW, zone.height / objH);
      const newScale = Math.min(rawScale, maxScale);

      obj.set({ scaleX: newScale, scaleY: newScale });
      obj.setCoords();
      fc.requestRenderAll();

      if (obj._designId && onDesignTransformChangeRef.current) {
        onDesignTransformChangeRef.current(obj._designId, {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          scaleX: newScale,
          scaleY: newScale,
          angle: obj.angle ?? 0,
        });
      }
    }, []);

    const getPreferredDesignObject = useCallback((): FabricDesignImage | null => {
      const fc = fabricRef.current;
      if (!fc) return null;

      const activeObj = fc.getActiveObject() as FabricDesignImage | undefined;
      if (activeObj?._designId) return activeObj;

      const designObjects = fc
        .getObjects()
        .filter((obj) => Boolean((obj as FabricDesignImage)._designId)) as FabricDesignImage[];

      return designObjects.at(-1) ?? null;
    }, []);

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
        const fc = fabricRef.current;
        const obj = getPreferredDesignObject();
        if (!obj || !fc) return;
        fc.setActiveObject(obj);
        obj.set({ flipX: !obj.flipX });
        fc.renderAll();
      },
      flipV() {
        const fc = fabricRef.current;
        const obj = getPreferredDesignObject();
        if (!obj || !fc) return;
        fc.setActiveObject(obj);
        obj.set({ flipY: !obj.flipY });
        fc.renderAll();
      },
      setBrightness(value: number) {
        const fc     = fabricRef.current;
        const fabric = fabricModule;
        const obj = getPreferredDesignObject() as FabricImage | null;
        if (!obj || !fc || !fabric) return;
        fc.setActiveObject(obj);
        const filter = new fabric.fabric.Image.filters.Brightness({ brightness: value });
        obj.filters  = [filter];
        obj.applyFilters();
        fc.renderAll();
      },
      setOpacity(value: number) {
        const fc = fabricRef.current;
        const obj = getPreferredDesignObject();
        if (!obj || !fc) return;
        fc.setActiveObject(obj);
        obj.set({ opacity: clampNumber(value, 0, 1) });
        fc.renderAll();
      },
      setClipShape(shape: ClipShape) {
        const fc = fabricRef.current;
        const fabric = fabricModule;
        const obj = getPreferredDesignObject() as FabricImage | null;
        if (!obj || !fc || !fabric) return;
        fc.setActiveObject(obj);

        const w = (obj.width ?? 100);
        const h = (obj.height ?? 100);

        if (shape === "none") {
          obj.clipPath = undefined;
        } else if (shape === "circle") {
          const r = Math.min(w, h) / 2;
          obj.clipPath = new fabric.fabric.Circle({
            radius: r,
            originX: "center",
            originY: "center",
          });
        } else if (shape === "oval") {
          obj.clipPath = new fabric.fabric.Ellipse({
            rx: w / 2,
            ry: h / 2,
            originX: "center",
            originY: "center",
          });
        } else if (shape === "triangle") {
          obj.clipPath = new fabric.fabric.Triangle({
            width: w,
            height: h,
            originX: "center",
            originY: "center",
          });
        } else if (shape === "diamond") {
          // Diamond = rotated square
          const side = Math.min(w, h) * 0.72;
          obj.clipPath = new fabric.fabric.Rect({
            width: side,
            height: side,
            angle: 45,
            originX: "center",
            originY: "center",
          });
        }

        obj.dirty = true;
        fc.renderAll();
      },
      getActiveDesignUrl() {
        const obj = getPreferredDesignObject();
        if (!obj?._designId) return null;
        return urlMapRef.current.get(obj._designId) ?? null;
      },
      getActiveDesignId() {
        const obj = getPreferredDesignObject();
        return obj?._designId ?? null;
      },
      resizeToFraction(fraction: number) {
        resizeActiveDesignToFraction(fraction);
      },
    }), [fabricModule, getPreferredDesignObject, resizeActiveDesignToFraction]);
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
          const placement = computeDesignPlacement(imgW, imgH, zone, item.transform);

          (img as FabricImage & { _designId: string })._designId = item.id;

          img.set({
            left: placement.left,
            top: placement.top,
            scaleX: placement.scaleX,
            scaleY: placement.scaleY,
            angle: placement.angle,
            originX: "center", originY: "center",
          });
          applyInteractiveDesignDefaults(img);

          fc.add(img);
          fc.setActiveObject(img);
          fc.renderAll();
          designObjsRef.current.set(item.id, img as FabricImage);

          // Persist initial centered placement for brand-new uploads (no prior transform).
          if (!item.transform && onDesignTransformChangeRef.current) {
            onDesignTransformChangeRef.current(item.id, {
              left: placement.left,
              top: placement.top,
              scaleX: placement.scaleX,
              scaleY: placement.scaleY,
              angle: placement.angle,
            });
          }
        },
        { crossOrigin: "anonymous" }
      );
    }, [computeDesignPlacement]);
    // Helper: load background SVG
    const loadBackground = useCallback((fabric: FabricModule, fc: FabricCanvas, svgUrl: string): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          fabric.fabric.loadSVGFromURL(svgUrl, (objects, options) => {
            try {
              if (!objects || objects.length === 0) {
                resolve(false);
                return;
              }

              // Remove any existing background
              const existing = fc.getObjects().filter((o) => !(o as FabricCanvasObject)._designId);
              existing.forEach((o) => fc.remove(o));

              const svg = fabric.fabric.util.groupSVGElements(objects, options);
              const scale = Math.min(
                CANVAS_SIZE / (svg.width || CANVAS_SIZE),
                CANVAS_SIZE / (svg.height || CANVAS_SIZE)
              );
              svg.scale(scale);
              svg.set({
                left: (CANVAS_SIZE - (svg.width || CANVAS_SIZE) * scale) / 2,
                top: (CANVAS_SIZE - (svg.height || CANVAS_SIZE) * scale) / 2,
                selectable: false,
                evented: false,
                originX: "left",
                originY: "top",
              });
              fc.add(svg);
              fc.sendToBack(svg);
              fc.renderAll();
              resolve(true);
            } catch {
              resolve(false);
            }
          });
        } catch {
          resolve(false);
        }
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
        selection: false, backgroundColor: "#f1f5f9",
      });
      fc.setZoom(initialScale);
      fc.defaultCursor = "default";
      fabricRef.current = fc;

      const baseSvgUrl = activeSide === "back" ? product.svgTemplateBack : product.svgTemplate;
      const zone   = activeSide === "back" ? product.designZoneBack   : product.designZone;
      zoneRef.current = zone;
      lastDetectedSizeRef.current = null;

      void (async () => {
        await loadBackground(fabricModule, fc, baseSvgUrl);
        if (canvasSessionRef.current !== sessionId || fabricRef.current !== fc) return;

        // Designs are added by the sync useEffect below once isLoading becomes false.
        // Do NOT add them here - setIsLoading(false) fires before fromURL callbacks
        // complete, causing the sync effect to double-add every design.
        setIsLoading(false);
      })();

      // Uniform scale + zone boundary clamping
      fc.on("object:scaling", (e) => {
        const obj = e.target;
        if (!obj) return;
        // Enforce uniform scale
        obj.scaleY = obj.scaleX;
        // Clamp so the design cannot exceed the embroidery zone dimensions
        const maxScaleX = zone.width / (obj.width || 1);
        const maxScaleY = zone.height / (obj.height || 1);
        const zoneMaxScale = Math.min(maxScaleX, maxScaleY);
        const zoneMinDim = Math.min(zone.width, zone.height);
        const selectedFraction = maxScaleFractionRef.current;
        const selectedSizeMaxScale = selectedFraction != null
          ? (selectedFraction * zoneMinDim) / Math.max(obj.width || 1, obj.height || 1)
          : Number.POSITIVE_INFINITY;
        const maxScale = Math.min(zoneMaxScale, selectedSizeMaxScale);
        const currentScaleX = obj.scaleX ?? 1;
        if (currentScaleX > maxScale) {
          obj.scaleX = maxScale;
          obj.scaleY = maxScale;
        }
      });

      // Clamp position during drag - prevents design from flying off canvas
      // on mobile where touch->canvas coordinate mapping can be slightly off.
      fc.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj) return;
        const halfW = ((obj.width  || 0) * (obj.scaleX ?? 1)) / 2;
        const halfH = ((obj.height || 0) * (obj.scaleY ?? 1)) / 2;
        obj.left = Math.max(halfW,              Math.min(CANVAS_SIZE - halfW, obj.left ?? 0));
        obj.top  = Math.max(halfH,              Math.min(CANVAS_SIZE - halfH, obj.top  ?? 0));
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

      // Persist once interaction finishes + auto-detect embroidery size.
      fc.on("object:modified", (e) => {
        const target = e.target as FabricCanvasObject | undefined;

        // Safety snap-back: if design landed at an invalid position (NaN, 0,0,
        // or fully outside canvas) snap it to the zone center.
        if (target && (target as FabricCanvasObject)._designId) {
          const selectedFraction = maxScaleFractionRef.current;
          if (selectedFraction != null) {
            const zoneMinDim = Math.min(zone.width, zone.height);
            const tW = target.width || 1;
            const tH = target.height || 1;
            const selectedSizeMaxScale = (selectedFraction * zoneMinDim) / Math.max(tW, tH);
            const currentScale = target.scaleX ?? 1;
            if (currentScale > selectedSizeMaxScale) {
              target.set({
                scaleX: selectedSizeMaxScale,
                scaleY: selectedSizeMaxScale,
              });
            }
          }

          const l = target.left ?? 0;
          const t = target.top  ?? 0;
          const badPosition =
            !Number.isFinite(l) || !Number.isFinite(t) ||
            l <= 0 || t <= 0 ||
            l >= CANVAS_SIZE || t >= CANVAS_SIZE;
          if (badPosition) {
            target.set({
              left: zone.x + zone.width  / 2,
              top:  zone.y + zone.height / 2,
            });
            target.setCoords();
            fc.requestRenderAll();
          }
        }

        persistTransform(target);

        if (!target || !zoneRef.current || !onEmbroiderySizeDetectedRef.current) return;
        const detZone = zoneRef.current;
        const tW = target.width || 1;
        const tH = target.height || 1;
        const zoneMinDim = Math.min(detZone.width, detZone.height);
        if (zoneMinDim <= 0) return;
        const currentDim = Math.max(tW * (target.scaleX ?? 1), tH * (target.scaleY ?? 1));
        const fraction = currentDim / zoneMinDim;

        let closest: (typeof EMBROIDERY_SIZES)[number] = EMBROIDERY_SIZES[0];
        let minDist = Math.abs(EMBROIDERY_SIZES[0].zoneScaleFraction - fraction);
        for (const s of EMBROIDERY_SIZES) {
          const d = Math.abs(s.zoneScaleFraction - fraction);
          if (d < minDist) { minDist = d; closest = s; }
        }

        if (closest.id !== lastDetectedSizeRef.current) {
          lastDetectedSizeRef.current = closest.id as EmbroiderySizeId;
          onEmbroiderySizeDetectedRef.current(closest.id as EmbroiderySizeId);
        }
      });

      // Mouse wheel zoom
      fc.on("mouse:wheel", (opt) => {
        const wheelEvent = opt.e as WheelEvent;
        const deltaScale = wheelEvent.deltaY > 0 ? 1 / 1.08 : 1.08;
        const nextFactor = zoomFactorRef.current * deltaScale;
        applyZoomFactor(nextFactor, { x: wheelEvent.offsetX, y: wheelEvent.offsetY });
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      // Pan viewport: only via Alt+drag (desktop). Disabled for single-touch to
      // prevent the "running away" issue on phones.
      fc.on("mouse:down", (opt) => {
        const event = opt.e as MouseEvent;
        // Only pan if Alt key is held (desktop only gesture)
        if (!event.altKey) return;

        // Enter pan mode and temporarily disable target hit-testing so canvas drag
        // cannot leave an object in a weird partial-interaction state.
        fc.discardActiveObject();
        fc.selection = false;
        (fc as FabricCanvas & { skipTargetFind?: boolean }).skipTargetFind = true;
        isPanningRef.current = true;
        lastPanRef.current = { x: event.clientX, y: event.clientY };
        fc.defaultCursor = "grabbing";
        fc.requestRenderAll();
      });

      fc.on("mouse:move", (opt) => {
        if (!isPanningRef.current) return;

        const event = opt.e as MouseEvent;
        if (!event.altKey || event.buttons === 0) {
          isPanningRef.current = false;
          lastPanRef.current = null;
          fc.defaultCursor = "default";
          fc.selection = true;
          (fc as FabricCanvas & { skipTargetFind?: boolean }).skipTargetFind = false;
          return;
        }

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
        fc.defaultCursor = "default";
        fc.selection = true;
        (fc as FabricCanvas & { skipTargetFind?: boolean }).skipTargetFind = false;
      };

      fc.on("mouse:up", stopPanning);
      fc.on("mouse:out", stopPanning);

      // Safety net: ensure pan mode can't get "stuck" if key/mouse events are
      // released outside the canvas or the browser window loses focus.
      const onWindowMouseUp = () => stopPanning();
      const onWindowBlur = () => stopPanning();
      const onWindowKeyUp = (event: KeyboardEvent) => {
        if (event.key === "Alt") stopPanning();
      };

      window.addEventListener("mouseup", onWindowMouseUp);
      window.addEventListener("blur", onWindowBlur);
      window.addEventListener("keyup", onWindowKeyUp);

      // Selection tracking for floating toolbar
      fc.on("selection:created", () => onSelectionChange?.(true));
      fc.on("selection:updated", () => onSelectionChange?.(true));
      fc.on("selection:cleared", () => onSelectionChange?.(false));

      // Responsive resizing
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          // Ignore collapsed widths when parent tab is hidden on mobile.
          if (width < 40) continue;
          const baseScale = width / CANVAS_SIZE;
          baseScaleRef.current = baseScale;
          const targetZoom = baseScale * zoomFactorRef.current;
          if (fabricRef.current) {
            fabricRef.current.setDimensions({ width, height: width });
            // Reset viewport transform cleanly instead of zoomToPoint
            // which accumulates offset drift causing the "running away" bug.
            const vpt = fabricRef.current.viewportTransform;
            if (vpt) {
              vpt[0] = targetZoom;
              vpt[3] = targetZoom;
              vpt[4] = 0;
              vpt[5] = 0;
            }
            fabricRef.current.setZoom(targetZoom);
            fabricRef.current.requestRenderAll();
          }
        }
      });
      
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener("mouseup", onWindowMouseUp);
        window.removeEventListener("blur", onWindowBlur);
        window.removeEventListener("keyup", onWindowKeyUp);
        observer.disconnect();
        isPanningRef.current = false;
        lastPanRef.current = null;
        canvasSessionRef.current += 1;
        // Persist all design transforms before disposing so positions survive side switches
        const changeFn = onDesignTransformChangeRef.current;
        if (changeFn) {
          designObjs.forEach((obj, id) => {
            const l = obj.left ?? 0;
            const t = obj.top ?? 0;
            // Only save if position looks valid (not at origin, not NaN)
            // Skip positions where both coords are <= 0, as these are likely uninitialized
            if (!Number.isFinite(l) || !Number.isFinite(t) || (l <= 0 && t <= 0)) {
              return;
            }
            changeFn(id, {
              left: l,
              top: t,
              scaleX: obj.scaleX ?? 1,
              scaleY: obj.scaleY ?? 1,
              angle: obj.angle ?? 0,
            });
          });
        }
        fc.dispose();
        fabricRef.current = null;
        designObjs.clear();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      fabricModule,
      product.svgTemplate,
      product.svgTemplateBack,
      activeSide,
      onDesignTransformChange,
      loadBackground,
    ]);
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
          const oldProps = obj
            ? { left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle }
            : null;

          urlMapRef.current.set(id, matchingDesign.url);

          if (obj) {
            try {
              obj.setSrc(
                matchingDesign.url,
                () => {
                  if (canvasSessionRef.current !== sessionId || fabricRef.current !== fc) return;

                  const placement = computeDesignPlacement(
                    obj.width || 100,
                    obj.height || 100,
                    zone,
                    oldProps
                  );

                  obj.set({
                    left: placement.left,
                    top: placement.top,
                    scaleX: placement.scaleX,
                    scaleY: placement.scaleY,
                    angle: placement.angle,
                    originX: "center",
                    originY: "center",
                  });
                  applyInteractiveDesignDefaults(obj);
                  obj.setCoords();
                  fc.setActiveObject(obj);
                  fc.requestRenderAll();
                },
                { crossOrigin: "anonymous" }
              );
              return;
            } catch {
              fc.remove(obj);
              designObjsRef.current.delete(id);
            }
          }

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
              const placement = computeDesignPlacement(
                img.width || 100,
                img.height || 100,
                zone,
                oldProps
              );

              img.set({
                left: placement.left,
                top: placement.top,
                scaleX: placement.scaleX,
                scaleY: placement.scaleY,
                angle: placement.angle,
                originX: "center",
                originY: "center",
              });
              applyInteractiveDesignDefaults(img);
              fc.add(img);
              fc.setActiveObject(img);
              fc.requestRenderAll();
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

      // Sync transforms: both desktop and mobile ProductCanvas instances are always
      // mounted (one is hidden via CSS). When the user moves a design on the visible
      // canvas, object:modified saves the new transform to state, but the hidden
      // canvas object stays at its old position. Without this sync, the hidden
      // canvas's cleanup would overwrite the correct transform with stale data when
      // switching sides. Keep both canvases in lock-step with the saved transforms.
      designs.forEach((d) => {
        if (!d.transform) return;
        const obj = designObjsRef.current.get(d.id);
        if (!obj) return;
        if (urlMapRef.current.get(d.id) !== d.url) return; // mid-reload, skip

        const t = d.transform;
        const same =
          Math.abs((obj.left  ?? 0) - t.left)   < 0.5 &&
          Math.abs((obj.top   ?? 0) - t.top)    < 0.5 &&
          Math.abs((obj.scaleX ?? 1) - t.scaleX) < 0.001 &&
          Math.abs((obj.scaleY ?? 1) - t.scaleY) < 0.001 &&
          Math.abs((obj.angle  ?? 0) - t.angle)  < 0.001;
        if (same) return;

        obj.set({ left: t.left, top: t.top, scaleX: t.scaleX, scaleY: t.scaleY, angle: t.angle });
        obj.setCoords();
        fc.requestRenderAll();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designs, isLoading, computeDesignPlacement]);

    // Resize designs when a size button is pressed from outside
    useEffect(() => {
      if (resizeRequest == null || isLoading) return;
      resizeActiveDesignToFraction(resizeRequest.fraction);
    }, [resizeRequest, isLoading, resizeActiveDesignToFraction]);

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
      <div className="relative flex flex-col items-center gap-2 w-full max-w-[600px] mx-auto">
        {isLoading && <Skeleton className="absolute inset-0 rounded-xl" />}
        <div
          ref={containerRef}
          className="w-full aspect-square overflow-hidden rounded-2xl border border-gray-200 shadow-md"
          style={{ background: "#f1f5f9" }}
        >
          <canvas ref={canvasElRef} />
        </div>

        {/* Zoom bar */}
        <div className="w-full flex items-center gap-2 px-1">
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl border border-gray-200 px-1.5 py-1">
            <button
              onClick={() => handleZoom("out")}
              className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min={Math.round(MIN_ZOOM_FACTOR * 100)}
              max={Math.round(MAX_ZOOM_FACTOR * 100)}
              step={1}
              value={zoomPercent}
              onChange={(event) => handleZoomSlider(Number(event.target.value))}
              className="w-20 accent-accent"
              aria-label="Canvas zoom"
            />
            <button
              onClick={() => handleZoom("in")}
              className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-bold text-gray-400 tabular-nums min-w-[36px] text-center select-none">
              {zoomPercent}%
            </span>
          </div>

          <button
            onClick={handleFit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 border border-gray-200 transition-colors"
            title="მორგება"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

        </div>

        {designs.length > 0 && (
          <p className="text-center text-[10px] text-gray-400">
            გადაათრიე სურათი · Alt+Drag პანორამა · Scroll ზუმი
          </p>
        )}
      </div>
    );
  }
);
