/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Plus } from "lucide-react";
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          ინსტრუმენტები
        </p>

        {/* Upload button */}
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all",
            isDragActive
              ? "border-accent bg-accent/5"
              : "border-gray-200 bg-white hover:border-accent hover:shadow-md",
            isRemovingBg && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-center text-gray-900 leading-tight mt-1">
            {isDragActive ? "გაუშვი..." : "ატვირთე დიზაინი"}
          </p>
          <p className="text-[10px] text-gray-400 font-medium">PNG · JPG · SVG</p>
        </div>

        {/* ImageToolbar */}
        {designs.length > 0 && (
          <div className="mt-4">
            <ImageToolbar
              canvasRef={canvasRef}
              designImageUrl={designs[designs.length - 1]?.url ?? ""}
              onBgRemoved={handleBgRemoved}
              onRemovingChange={setIsRemovingBg}
            />
          </div>
        )}
      </div>

      <div className="border-t border-black/5 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          შენი შრეები ({designs.length})
        </p>
        
        {designs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
            <Plus className="h-5 w-5 text-gray-300 mx-auto mb-2" />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              ატვირთეთ ფოტო შრეების სამართავად
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {designs.map((d, index) => (
              <div
                key={d.id}
                className="group relative flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                  <img
                    src={d.url}
                    alt={`layer-${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate">
                    შერე {index + 1}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {activeSide === "front" ? "FRONT" : "BACK"}
                  </p>
                </div>
                <button
                  onClick={() => onDesignRemove(d.id)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
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
    <div className="flex flex-col items-center gap-8 w-full max-w-[500px]">
      {/* Front / Back toggle */}
      {product.hasBack && (
        <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-black/5 p-1.5 shadow-sm">
          <button
            onClick={() => handleSideChangeRequest("front")}
            className={cn(
              "flex items-center justify-center rounded-full px-6 py-2 text-xs font-bold transition-all duration-300",
              activeSide === "front"
                ? "bg-white text-black shadow-md scale-105"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "opacity-50 cursor-not-allowed"
            )}
          >
            წინა
          </button>
          <button
            onClick={() => handleSideChangeRequest("back")}
            className={cn(
              "flex items-center justify-center rounded-full px-6 py-2 text-xs font-bold transition-all duration-300",
              activeSide === "back"
                ? "bg-white text-black shadow-md scale-105"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "opacity-50 cursor-not-allowed"
            )}
          >
            უკანა
          </button>
        </div>
      )}

      <div className="relative group/canvas w-full aspect-square max-w-[450px]">
        <ProductCanvas
          ref={canvasRef}
          product={product}
          designs={designs}
          activeSide={activeSide}
          onDesignTransformChange={onDesignTransformChange}
        />
        
        {/* Loading Overlay */}
        {isRemovingBg && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[2rem] bg-white/90 backdrop-blur-sm shadow-xl border border-black/5">
            <div className="text-center p-6 bg-white rounded-3xl shadow-2xl space-y-4">
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">ვშლი ფონს...</p>
            </div>
          </div>
        )}
      </div>

      {designs.length === 0 && !isRemovingBg && (
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Upload className="h-6 w-6 text-gray-300" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ატვირთე დიზაინი პრევიუსთვის</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isSidebarMode && renderTools()}
      {isCanvasOnly && renderCanvas()}
      {!isSidebarMode && !isCanvasOnly && (
        <div className="p-10 text-center text-gray-400 border border-dashed rounded-3xl">
          Unsupported render mode. 
        </div>
      )}
    </>
  );
}
