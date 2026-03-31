/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Images, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCanvas } from "@/components/custom-order/ProductCanvas";
import { ImageToolbar } from "@/components/custom-order/ImageToolbar";
import type { ProductCanvasHandle } from "@/components/custom-order/ProductCanvas";
import type { DesignItem, ProductType } from "@/config/custom-order";

interface Step3DesignUploadProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
  onDesignAdd: (url: string) => void;
  onDesignRemove: (id: string) => void;
  onDesignReplace: (id: string, newUrl: string) => void;
  onSideChange: (side: "front" | "back") => void;
}

export function Step3DesignUpload({
  product,
  designs,
  activeSide,
  onDesignAdd,
  onDesignRemove,
  onDesignReplace,
  onSideChange,
}: Step3DesignUploadProps) {
  const canvasRef = useRef<ProductCanvasHandle | null>(null);

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
  });

  // Background removal should replace the active design, not append a new one.
  function handleBgRemoved(newUrl: string, replacedUrl: string) {
    const activeDesignId = canvasRef.current?.getActiveDesignId();
    if (activeDesignId) {
      onDesignReplace(activeDesignId, newUrl);
      return;
    }

    const fallbackMatch = [...designs].reverse().find((design) => design.url === replacedUrl)
      ?? designs[designs.length - 1];

    if (fallbackMatch) {
      onDesignReplace(fallbackMatch.id, newUrl);
      return;
    }

    onDesignAdd(newUrl);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-semibold text-gray-600">
          ატვირთე შენი დიზაინი
        </h2>
        <p className="mt-1 text-base text-gray-400">
          ატვირთე სურათები და დაარეგულირე პოზიცია · შეგიძლია რამდენიმე დიზაინი
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ——— LEFT: dropzone + design panel + toolbar ——— */}
        <div className="flex flex-col gap-4 lg:w-[38%]">

          {/* Dropzone — always visible */}
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 transition-colors",
              isDragActive
                ? "border-accent bg-violet-50"
                : "border-gray-300 bg-gray-50 hover:border-accent hover:bg-violet-50/50",
              designs.length > 0 && "min-h-[100px]",
              designs.length === 0 && "min-h-[180px]"
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isDragActive ? "bg-accent/10" : "bg-gray-100"
            )}>
              <Upload className={cn("h-5 w-5", isDragActive ? "text-accent" : "text-gray-400")} />
            </div>
            <p className={cn("text-sm font-medium text-center", isDragActive ? "text-accent" : "text-gray-600")}>
              {isDragActive ? "გაუშვი სურათი..." : designs.length > 0 ? "+ კიდევ დაამატე" : "ატვირთე შენი დიზაინი"}
            </p>
            <p className="text-xs text-gray-400">JPG · PNG · SVG · WEBP</p>
          </div>

          {/* Uploaded designs panel */}
          {designs.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Images className="h-4 w-4 text-accent" />
                <span>ატვირთული დიზაინები ({designs.length})</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {designs.map((d) => (
                  <div key={d.id} className="relative group">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={d.url}
                        alt="design"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <button
                      onClick={() => onDesignRemove(d.id)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="წაშლა"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image editing toolbar */}
          {designs.length > 0 && (
            <ImageToolbar
              canvasRef={canvasRef}
              designImageUrl={designs[designs.length - 1]?.url ?? ""}
              onBgRemoved={handleBgRemoved}
            />
          )}
        </div>

        {/* ——— RIGHT: side toggle + canvas ——— */}
        <div className="flex-1 flex flex-col items-center gap-3">

          {/* Front / Back toggle */}
          {product.hasBack && (
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => onSideChange("front")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                  activeSide === "front"
                    ? "bg-black text-white shadow"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                წინა
              </button>
              <button
                onClick={() => onSideChange("back")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                  activeSide === "back"
                    ? "bg-black text-white shadow"
                    : "text-gray-500 hover:text-gray-700"
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
          />
        </div>
      </div>
    </div>
  );
}
