/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Trash2, Plus, Copy, ChevronUp, ChevronDown, Undo2, Redo2, FlipHorizontal, FlipVertical, Eraser } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductCanvas } from "@/components/custom-order/ProductCanvas";
import { ImageToolbar } from "@/components/custom-order/ImageToolbar";
import type { ProductCanvasHandle } from "@/components/custom-order/ProductCanvas";
import type {
  DesignItem,
  DesignTransform,
  EmbroiderySizeId,
  ProductColor,
  ProductType,
} from "@/config/custom-order";

interface Step3DesignUploadProps {
  product: ProductType;
  designs: DesignItem[];
  activeSide: "front" | "back";
  selectedColor?: ProductColor | null;
  onDesignAdd: (url: string) => void;
  onDesignRemove: (id: string) => void;
  onDesignReplace: (id: string, newUrl: string) => void;
  onDesignTransformChange: (id: string, transform: DesignTransform) => void;
  onDesignDuplicate?: (id: string) => void;
  onDesignMove?: (id: string, direction: "up" | "down") => void;
  onSideChange: (side: "front" | "back") => void;
  isSidebarMode?: boolean;
  isCanvasOnly?: boolean;
  resizeRequest?: { fraction: number; seq: number } | null;
  onEmbroiderySizeDetected?: (sizeId: EmbroiderySizeId) => void;
  sharedCanvasRef?: RefObject<ProductCanvasHandle | null>;
  onDesignAdded?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Step3DesignUpload({
  product,
  designs,
  activeSide,
  selectedColor: _selectedColor = null,
  onDesignAdd,
  onDesignRemove,
  onDesignReplace,
  onDesignTransformChange,
  onDesignDuplicate,
  onDesignMove,
  onSideChange,
  isSidebarMode,
  isCanvasOnly,
  resizeRequest,
  onEmbroiderySizeDetected,
  sharedCanvasRef,
  onDesignAdded,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Step3DesignUploadProps) {
  const localCanvasRef = useRef<ProductCanvasHandle | null>(null);
  const canvasRef = sharedCanvasRef ?? localCanvasRef;
  const waitToastAtRef = useRef(0);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (designs.length === 1) {
      setShowDragHint(true);
      hintTimerRef.current = setTimeout(() => setShowDragHint(false), 4000);
    }
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [designs.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        onDesignAdd(url);
      });
      if (acceptedFiles.length > 0) {
        onDesignAdded?.();
      }
    },
    [onDesignAdd, onDesignAdded]
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
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          ინსტრუმენტები
        </p>

        {/* ImageToolbar — shown above upload once a design exists */}
        {designs.length > 0 && (
          <div className="mb-4">
            <ImageToolbar
              canvasRef={canvasRef}
              designImageUrl={designs[designs.length - 1]?.url ?? ""}
              onBgRemoved={handleBgRemoved}
              onRemovingChange={setIsRemovingBg}
            />
          </div>
        )}

        {/* Upload button */}
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center gap-2.5 h-11 w-full px-3 rounded-xl border-2 border-dashed cursor-pointer transition-all",
            isDragActive
              ? "border-accent bg-accent/5"
              : "border-gray-200 bg-white hover:border-accent hover:shadow-sm",
            isRemovingBg && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-white flex-shrink-0">
            <Upload className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-gray-900 truncate">
            {isDragActive ? "გაუშვი..." : "ატვირთე დიზაინი"}
          </span>
          <span className="ml-auto text-[9px] text-gray-400 font-medium flex-shrink-0">PNG JPG SVG</span>
        </div>
      </div>

      {designs.length > 0 && (
      <div className="border-t border-black/5 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            შრეები ({designs.length})
          </p>
          {/* Undo / Redo */}
          {(onUndo || onRedo) && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="გაუქმება (Ctrl+Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="თავიდან (Ctrl+Shift+Z)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {designs.map((d, index) => (
              <div
                key={d.id}
                className="group relative flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 hover:border-accent/40 transition-all shadow-sm hover:shadow-md min-h-[44px]"
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
                    შრე {index + 1}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {activeSide === "front" ? "წინა" : "უკანა"}
                  </p>
                </div>

                {/* Layer controls */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Reorder arrows */}
                  {onDesignMove && designs.length > 1 && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => onDesignMove(d.id, "up")}
                        disabled={index === designs.length - 1}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="ზემოთ"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDesignMove(d.id, "down")}
                        disabled={index === 0}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="ქვემოთ"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Duplicate */}
                  {onDesignDuplicate && (
                    <button
                      onClick={() => onDesignDuplicate(d.id)}
                      className="p-1.5 rounded-full text-gray-300 hover:text-accent hover:bg-accent/5 transition-all"
                      title="დუბლირება"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => onDesignRemove(d.id)}
                    className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="წაშლა"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      )}
    </div>
  );

  const renderCanvas = () => (
    <div className="flex flex-col items-center gap-4 w-full max-w-[600px]">
      {/* Front / Back toggle */}
      {product.hasBack && (
        <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white p-1.5 shadow-md">
          <button
            onClick={() => handleSideChangeRequest("front")}
            className={cn(
              "flex items-center justify-center rounded-full px-7 py-2.5 text-sm font-bold transition-all duration-300",
              activeSide === "front"
                ? "bg-accent text-white shadow-md scale-105"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "opacity-50 cursor-not-allowed"
            )}
          >
            წინა
          </button>
          <button
            onClick={() => handleSideChangeRequest("back")}
            className={cn(
              "flex items-center justify-center rounded-full px-7 py-2.5 text-sm font-bold transition-all duration-300",
              activeSide === "back"
                ? "bg-accent text-white shadow-md scale-105"
                : "text-gray-500 hover:text-black",
              isRemovingBg && "opacity-50 cursor-not-allowed"
            )}
          >
            უკანა
          </button>
        </div>
      )}

      <div className="relative group/canvas w-full aspect-square max-w-[600px]">
        <ProductCanvas
          ref={canvasRef}
          product={product}
          designs={designs}
          activeSide={activeSide}
          onDesignTransformChange={onDesignTransformChange}
          onEmbroiderySizeDetected={onEmbroiderySizeDetected}
          resizeRequest={resizeRequest}
          onSelectionChange={setHasSelection}
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

        {/* First-upload drag hint */}
        {showDragHint && !isRemovingBg && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide animate-fade-in">
            გადაათრიე · შეცვალე ზომა · დაატრიალე
          </div>
        )}

        {/* Floating contextual toolbar */}
        {hasSelection && !isRemovingBg && designs.length > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-black/8">
            <button
              onClick={() => canvasRef.current?.flipH()}
              className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              title="ჰორიზონტალური"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => canvasRef.current?.flipV()}
              className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
              title="ვერტიკალური"
            >
              <FlipVertical className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-200" />
            {onDesignDuplicate && (
              <button
                onClick={() => {
                  const id = canvasRef.current?.getActiveDesignId();
                  if (id) onDesignDuplicate(id);
                }}
                className="p-2 rounded-full text-gray-500 hover:text-accent hover:bg-accent/5 transition-colors"
                title="დუბლირება"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => {
                const id = canvasRef.current?.getActiveDesignId();
                if (id) onDesignRemove(id);
              }}
              className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="წაშლა"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* empty placeholder removed */}
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
