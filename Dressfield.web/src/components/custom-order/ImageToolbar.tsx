"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FlipHorizontal, FlipVertical, Sun, Eraser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCanvasHandle } from "./ProductCanvas";

interface ImageToolbarProps {
  canvasRef: React.RefObject<ProductCanvasHandle | null>;
  designImageUrl: string;
  onBgRemoved: (newUrl: string, replacedUrl: string, designId: string | null) => void;
  onRemovingChange?: (isRemoving: boolean) => void;
}

const MAX_BG_REMOVE_DIMENSION = 900;
const BG_REMOVE_PUBLIC_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const BG_REMOVE_CONFIG = {
  // Smaller model for much faster inference and fewer UI stalls.
  model: "isnet_quint8" as const,
  // Keep CPU path for compatibility with Next.js 16 + Turbopack runtime.
  device: "cpu" as const,
  proxyToWorker: false,
  rescale: true,
  publicPath: BG_REMOVE_PUBLIC_PATH,
  output: { format: "image/png" as const, quality: 0.9 },
};

let bgRemovalMutex: Promise<void> = Promise.resolve();

async function runBgRemovalExclusive<T>(job: () => Promise<T>): Promise<T> {
  const previous = bgRemovalMutex;
  let release!: () => void;
  bgRemovalMutex = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await job();
  } finally {
    release();
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function fetchImageBlob(src: string): Promise<Blob> {
  if (src.startsWith("blob:")) {
    const blobResponse = await fetch(src);
    return await blobResponse.blob();
  }

  const response = await fetch(src, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Image fetch failed: ${response.status}`);
  }

  return await response.blob();
}

async function downscaleBlobIfNeeded(blob: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return blob;

  const bitmap = await createImageBitmap(blob);
  try {
    const longestSide = Math.max(bitmap.width, bitmap.height);
    if (longestSide <= MAX_BG_REMOVE_DIMENSION) return blob;

    const ratio = MAX_BG_REMOVE_DIMENSION / longestSide;
    const targetWidth = Math.max(1, Math.round(bitmap.width * ratio));
    const targetHeight = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.9)
    );

    return resized ?? blob;
  } finally {
    bitmap.close();
  }
}

export function ImageToolbar({
  canvasRef,
  designImageUrl,
  onBgRemoved,
  onRemovingChange,
}: ImageToolbarProps) {
  const [removingBg, setRemovingBg] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const blobUrlRef = useRef<string | null>(null);
  const operationIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationIdRef.current += 1;
      onRemovingChange?.(false);
      // Do not revoke here: the URL can still be actively used by parent state/canvas.
      // URL lifecycle is handled when replacing/removing designs in parent state.
    };
  }, [onRemovingChange]);

  useEffect(() => {
    let cancelled = false;

    const warmUp = async () => {
      try {
        const { preload } = await import("@imgly/background-removal");
        if (!cancelled) {
          await preload(BG_REMOVE_CONFIG);
        }
      } catch {
        // Warm-up is best-effort only.
      }
    };

    void warmUp();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemoveBg() {
    if (removingBg) return;

    const operationId = operationIdRef.current + 1;
    operationIdRef.current = operationId;
    const targetDesignId = canvasRef.current?.getActiveDesignId() ?? null;

    const activeUrl = canvasRef.current?.getActiveDesignUrl() ?? designImageUrl;
    if (!activeUrl) return;

    setRemovingBg(true);
    onRemovingChange?.(true);
    try {
      // Let spinner/toast paint before heavy compute starts.
      await nextFrame();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      const { removeBackground } = await import("@imgly/background-removal");

      let preparedSource: string | Blob = activeUrl;
      try {
        const sourceBlob = await fetchImageBlob(activeUrl);
        preparedSource = await downscaleBlobIfNeeded(sourceBlob);
      } catch (preparationError) {
        console.warn("Background removal pre-processing failed, using original source.", preparationError);
      }

      let result: Blob;
      try {
        result = await runBgRemovalExclusive(() =>
          removeBackground(preparedSource, BG_REMOVE_CONFIG)
        );
      } catch (optimizedPathError) {
        console.error("Optimized background removal failed.", optimizedPathError);
        throw optimizedPathError;
      }

      if (!mountedRef.current || operationIdRef.current !== operationId) return;

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(result);
      blobUrlRef.current = url;
      onBgRemoved(url, activeUrl, targetDesignId);
    } catch (err) {
      console.error("Background removal failed:", err);
      toast.error("ფონის წაშლა ვერ მოხერხდა");
    } finally {
      if (mountedRef.current && operationIdRef.current === operationId) {
        setRemovingBg(false);
        onRemovingChange?.(false);
      }
    }
  }

  function handleBrightnessChange(values: number[]) {
    const val = values[0] / 100; // slider 0-200 -> -1..+1
    setBrightness(values[0]);
    canvasRef.current?.setBrightness(val - 1);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-px bg-black/8" />

      {/* Compact vertical tool buttons */}
      <button
        onClick={handleRemoveBg}
        disabled={removingBg}
        className="flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-[11px] font-medium text-left border border-black/10 bg-white hover:bg-black/3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {removingBg ? (
          <Loader2 className="h-3.5 w-3.5 text-accent animate-spin flex-shrink-0" />
        ) : (
          <Eraser className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
        )}
        {removingBg ? "მუშავდება..." : "ფონის წაშლა"}
      </button>

      <button
        onClick={() => canvasRef.current?.flipH()}
        className="flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-[11px] font-medium text-left border border-black/10 bg-white hover:bg-black/3 transition-colors"
      >
        <FlipHorizontal className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
        ჰორიზ. პარ.
      </button>

      <button
        onClick={() => canvasRef.current?.flipV()}
        className="flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-[11px] font-medium text-left border border-black/10 bg-white hover:bg-black/3 transition-colors"
      >
        <FlipVertical className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
        ვერტიკ. პარ.
      </button>

      {/* Brightness */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-foreground">
            <Sun className="h-3.5 w-3.5 text-gray-500" />
            <span>სინათლე</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {brightness > 100 ? `+${brightness - 100}` : brightness < 100 ? `${brightness - 100}` : "0"}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={1}
          value={brightness}
          onChange={(e) => handleBrightnessChange([Number(e.target.value)])}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
