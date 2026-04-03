/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductCanvas } from "@/components/custom-order/ProductCanvas";
import { ImageToolbar } from "@/components/custom-order/ImageToolbar";
import type { ProductCanvasHandle } from "@/components/custom-order/ProductCanvas";
import type { DesignItem, DesignTransform, ProductType } from "@/config/custom-order";

interface Step3DesignUploadProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
  onDesignAdd: (url: string) => void;
  onDesignRemove: (id: string) => void;
  onDesignReplace: (id: string, newUrl: string) => void;
  onDesignTransformChange: (id: string, transform: DesignTransform) => void;
  onSideChange: (side: "front" | "back") => void;
}

export function Step3DesignUpload({
  product,
  designs,
  activeSide,
  onDesignAdd,
  onDesignRemove,
  onDesignReplace,
  onDesignTransformChange,
  onSideChange,
}: Step3DesignUploadProps) {
  const canvasRef = useRef<ProductCanvasHandle | null>(null);
  const waitToastAtRef = useRef(0);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        onDesignAdd(url);
      });
    },
    [onDesignAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled: isRemovingBg,
  });

  function handleBgRemoved(newUrl: string, replacedUrl: string, designId: string | null) {
    if (designId) {
      onDesignReplace(designId, newUrl);
      return;
    }

    const fallbackMatch = [...designs].reverse().find((design) => design.url === replacedUrl);
    if (fallbackMatch) {
      onDesignReplace(fallbackMatch.id, newUrl);
      return;
    }

    if (newUrl.startsWith("blob:")) {
      URL.revokeObjectURL(newUrl);
    }
  }

  function handleSideChangeRequest(side: "front" | "back") {
    if (isRemovingBg) {
      const now = Date.now();
      if (now - waitToastAtRef.current > 1200) {
        waitToastAtRef.current = now;
        toast.error("გთხოვ დაელოდე ფონის წაშლის დასრულებას");
      }
      return;
    }

    onSideChange(side);
  }

  return (
    <div className="relative">
      {/* 3-Panel Layout */}
      <div className="flex gap-0 rounded-2xl border border-black/8 bg-white shadow-sm overflow-hidden min-h-[560px]">

        {/* ── LEFT PANEL: Tools ──────────────────────────────── */}
        <aside className="w-48 flex-shrink-0 border-r border-black/8 bg-gray-50 p-3 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
            ინსტრუმენტები
          </p>

          {/* Upload button */}
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              isDragActive
                ? "border-accent bg-accent/5"
                : "border-black/15 hover:border-accent hover:bg-accent/5",
              isRemovingBg && "opacity-50 pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Upload className="h-4 w-4 text-accent" />
            </div>
            <p className="text-[11px] font-medium text-center text-gray-600 leading-tight">
              {isDragActive ? "გაუშვი..." : "ატვირთე დიზაინი"}
            </p>
            <p className="text-[10px] text-gray-400">PNG · JPG · SVG</p>
          </div>

          {/* ImageToolbar renders here in vertical mode */}
          {designs.length > 0 && (
            <ImageToolbar
              canvasRef={canvasRef}
              designImageUrl={designs[designs.length - 1]?.url ?? ""}
              onBgRemoved={handleBgRemoved}
              onRemovingChange={setIsRemovingBg}
            />
          )}

          {designs.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-2">
                ატვირთე დიზაინი ინსტრუმენტების გამოყენებისთვის
              </p>
            </div>
          )}
        </aside>

        {/* ── CENTER PANEL: Canvas ───────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-4 gap-4">
          {/* Front / Back toggle */}
          {product.hasBack && (
            <div className="flex items-center gap-1 rounded-lg border border-black/8 bg-white p-1 shadow-sm">
              <button
                onClick={() => handleSideChangeRequest("front")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  activeSide === "front"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800",
                  isRemovingBg && "opacity-50 cursor-not-allowed"
                )}
              >
                წინა
              </button>
              <button
                onClick={() => handleSideChangeRequest("back")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  activeSide === "back"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800",
                  isRemovingBg && "opacity-50 cursor-not-allowed"
                )}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                უკანა
              </button>
            </div>
          )}

          <ProductCanvas
            ref={canvasRef}
            product={product}
            designs={designs}
            activeSide={activeSide}
            onDesignTransformChange={onDesignTransformChange}
          />

          {designs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              ატვირთე სურათი მარცხნიდან, რომ პრევიუ ნახო
            </p>
          )}
        </div>

        {/* ── RIGHT PANEL: Design layers ─────────────────────── */}
        <aside className="w-52 flex-shrink-0 border-l border-black/8 bg-white p-3 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
            დიზაინები
          </p>

          {designs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed px-2">
                ატვირთული დიზაინები აქ გამოჩნდება
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              {designs.map((d, index) => (
                <div
                  key={d.id}
                  className="group relative flex items-center gap-2 rounded-lg border border-black/8 bg-gray-50 p-2 hover:border-black/15 transition-colors"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-black/8 bg-white">
                    <img
                      src={d.url}
                      alt={`design-${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      დიზაინი {index + 1}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {activeSide === "front" ? "წინა მხარე" : "უკანა მხარე"}
                    </p>
                  </div>
                  <button
                    onClick={() => onDesignRemove(d.id)}
                    className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20 transition-all flex-shrink-0"
                    title="წაშლა"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {designs.length > 0 && (
            <div className="border-t border-black/8 pt-3 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                შეჯამება
              </p>
              <p className="text-xs text-foreground">
                {designs.length} დიზაინი
              </p>
              <p className="text-[10px] text-muted-foreground">
                {activeSide === "front" ? "წინა" : "უკანა"} მხარე
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Background removal loading overlay */}
      {isRemovingBg && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-lg">
            <p className="text-sm font-semibold text-foreground">ფონის წაშლა მიმდინარეობს</p>
            <p className="mt-1 text-xs text-muted-foreground">
              გთხოვ დაელოდე დასრულებას
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="loading-dot h-2.5 w-2.5 rounded-full bg-accent" style={{ animationDelay: "0ms" }} />
              <span className="loading-dot h-2.5 w-2.5 rounded-full bg-accent" style={{ animationDelay: "140ms" }} />
              <span className="loading-dot h-2.5 w-2.5 rounded-full bg-accent" style={{ animationDelay: "280ms" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
