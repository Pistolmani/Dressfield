"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FlipHorizontal, FlipVertical, Sun, Eraser, Loader2, CircleDot } from "lucide-react";
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
  const [opacity, setOpacity] = useState(100);
  const blobUrlRef = useRef<string | null>(null);
  const operationIdRef = useRef(0);
  const mountedRef = useRef(true);
  const loadingToastRef = useRef<string | number | null>(null);

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
    loadingToastRef.current = toast.loading("გთხოვ დაიცადე...", {
      description: "ფონის წაშლა მიმდინარეობს",
    });
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
      if (loadingToastRef.current !== null) {
        toast.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }
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

  function handleOpacityChange(values: number[]) {
    const val = values[0];
    setOpacity(val);
    canvasRef.current?.setOpacity(val / 100);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-px bg-black/8" />

      {/* Tool buttons with icon badges */}
      <button
        onClick={handleRemoveBg}
        disabled={removingBg}
        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[11px] font-semibold text-left border border-black/8 bg-white hover:bg-gray-50 hover:border-accent/30 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 flex-shrink-0">
          {removingBg ? (
            <Loader2 className="h-3.5 w-3.5 text-violet-500 animate-spin" />
          ) : (
            <Eraser className="h-3.5 w-3.5 text-violet-500" />
          )}
        </span>
        {removingBg ? "მუშავდება..." : "ფონის წაშლა"}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => canvasRef.current?.flipH()}
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold text-left border border-black/8 bg-white hover:bg-gray-50 hover:border-accent/30 hover:shadow-sm transition-all"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 flex-shrink-0">
            <FlipHorizontal className="h-3.5 w-3.5 text-blue-500" />
          </span>
          ჰორიზ.
        </button>

        <button
          onClick={() => canvasRef.current?.flipV()}
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold text-left border border-black/8 bg-white hover:bg-gray-50 hover:border-accent/30 hover:shadow-sm transition-all"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 flex-shrink-0">
            <FlipVertical className="h-3.5 w-3.5 text-blue-500" />
          </span>
          ვერტიკ.
        </button>
      </div>

      {/* Brightness */}
      <div className="space-y-1.5 pt-1 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 flex-shrink-0">
              <Sun className="h-3 w-3 text-amber-500" />
            </span>
            სინათლე
          </div>
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
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

      {/* Opacity */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
              <CircleDot className="h-3 w-3 text-gray-500" />
            </span>
            გამჭვირვალობა
          </div>
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
            {opacity}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={opacity}
          onChange={(e) => handleOpacityChange([Number(e.target.value)])}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
