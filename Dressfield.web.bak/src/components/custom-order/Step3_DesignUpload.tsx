/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Plus, Upload, X } from "lucide-react";
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
  isSidebarMode?: boolean;
  isCanvasOnly?: boolean;
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
  isSidebarMode,
  isCanvasOnly,
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

  const renderTools = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          ინსტრუმენტები
        </p>

        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all",
            isDragActive
              ? "border-accent bg-accent/5"
              : "border-gray-200 bg-white hover:border-accent hover:shadow-md",
            isRemovingBg && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
            <Upload className="h-5 w-5" />
          </div>
          <p className="mt-1 text-center text-xs font-bold leading-tight text-gray-900">
            {isDragActive ? "გაუშვი..." : "ატვირთე დიზაინი"}
          </p>
          <p className="text-[10px] font-medium text-gray-400">PNG · JPG · SVG</p>
        </div>

        {designs.length > 0 ? (
          <div className="mt-4">
            <ImageToolbar
              canvasRef={canvasRef}
              designImageUrl={designs[designs.length - 1]?.url ?? ""}
              onBgRemoved={handleBgRemoved}
              onRemovingChange={setIsRemovingBg}
            />
          </div>
        ) : null}
      </div>

      <div className="border-t border-black/5 pt-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          შენი შრეები ({designs.length})
        </p>

        {designs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
            <Plus className="mx-auto mb-2 h-5 w-5 text-gray-300" />
            <p className="text-[11px] leading-relaxed text-gray-400">
              ატვირთეთ ფოტო შრეების სამართავად
            </p>
          </div>
        ) : (
          <div className="custom-scrollbar grid max-h-[300px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {designs.map((design, index) => (
              <div
                key={design.id}
                className="group relative flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:border-accent/40 hover:shadow-md"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img src={design.url} alt={`layer-${index + 1}`} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-gray-900">შრე {index + 1}</p>
                  <p className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">
                    {activeSide === "front" ? "FRONT" : "BACK"}
                  </p>
                </div>
                <button
                  onClick={() => onDesignRemove(design.id)}
                  className="rounded-full p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="წაშლა"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCanvas = () => (
    <div className="flex w-full max-w-[500px] flex-col items-center gap-8">
      {product.hasBack ? (
        <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-black/5 p-1.5 shadow-sm">
          <button
            onClick={() => handleSideChangeRequest("front")}
            className={cn(
              "flex items-center justify-center rounded-full px-6 py-2 text-xs font-bold transition-all duration-300",
              activeSide === "front"
                ? "scale-105 bg-white text-black shadow-md"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "cursor-not-allowed opacity-50"
            )}
          >
            წინა
          </button>
          <button
            onClick={() => handleSideChangeRequest("back")}
            className={cn(
              "flex items-center justify-center rounded-full px-6 py-2 text-xs font-bold transition-all duration-300",
              activeSide === "back"
                ? "scale-105 bg-white text-black shadow-md"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "cursor-not-allowed opacity-50"
            )}
          >
            უკანა
          </button>
        </div>
      ) : null}

      <div className="group/canvas relative aspect-square w-full max-w-[450px]">
        <ProductCanvas
          ref={canvasRef}
          product={product}
          designs={designs}
          activeSide={activeSide}
          onDesignTransformChange={onDesignTransformChange}
        />

        {isRemovingBg ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[2rem] border border-black/5 bg-white/90 shadow-xl backdrop-blur-sm">
            <div className="space-y-4 rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: "0s" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: "0.1s" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: "0.2s" }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900">ფონს ვშლით...</p>
            </div>
          </div>
        ) : null}
      </div>

      {designs.length === 0 && !isRemovingBg ? (
        <div className="flex animate-pulse flex-col items-center gap-3">
          <Upload className="h-6 w-6 text-gray-300" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            ატვირთე დიზაინი პრევიუსთვის
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {isSidebarMode ? renderTools() : null}
      {isCanvasOnly ? renderCanvas() : null}
      {!isSidebarMode && !isCanvasOnly ? (
        <div className="rounded-3xl border border-dashed p-10 text-center text-gray-400">
          Unsupported render mode.
        </div>
      ) : null}
    </>
  );
}
