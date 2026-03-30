"use client";

import { useRef, useState } from "react";
import { FlipHorizontal, FlipVertical, Sun, Eraser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductCanvasHandle } from "./ProductCanvas";

interface ImageToolbarProps {
  canvasRef: React.RefObject<ProductCanvasHandle | null>;
  designImageUrl: string;
  onBgRemoved: (newUrl: string) => void;
}

export function ImageToolbar({ canvasRef, designImageUrl, onBgRemoved }: ImageToolbarProps) {
  const [removingBg, setRemovingBg] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const blobUrlRef = useRef<string | null>(null);

  async function handleRemoveBg() {
    const activeUrl = canvasRef.current?.getActiveDesignUrl() ?? designImageUrl;
    if (!activeUrl) return;
    setRemovingBg(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const result = await removeBackground(activeUrl);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(result);
      blobUrlRef.current = url;
      onBgRemoved(url);
    } catch (err) {
      console.error("Background removal failed:", err);
    } finally {
      setRemovingBg(false);
    }
  }

  function handleBrightnessChange(values: number[]) {
    const val = values[0] / 100; // slider 0-200 → -1..+1
    setBrightness(values[0]);
    canvasRef.current?.setBrightness(val - 1);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        სურათის რედაქტირება
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveBg}
          disabled={removingBg}
          className="flex-1 min-w-[140px]"
        >
          {removingBg ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              მუშავდება…
            </>
          ) : (
            <>
              <Eraser className="mr-2 h-4 w-4" />
              ფონის წაშლა
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => canvasRef.current?.flipH()}
          className="flex-1"
          title="Flip Horizontal"
        >
          <FlipHorizontal className="mr-2 h-4 w-4" />
          მარჯვ/მარც
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => canvasRef.current?.flipV()}
          className="flex-1"
          title="Flip Vertical"
        >
          <FlipVertical className="mr-2 h-4 w-4" />
          ზემო/ქვემო
        </Button>
      </div>

      {/* Brightness */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <span>სინათლე</span>
          </div>
          <span className="text-xs text-muted-foreground">
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
