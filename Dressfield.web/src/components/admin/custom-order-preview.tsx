/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo } from "react";
import { PRODUCT_TYPES } from "@/config/custom-order";
import type { CustomOrderDesignDto } from "@/types/custom-order";

interface CustomOrderPreviewProps {
  productTypeId: string | null;
  colorHex: string | null;
  canvasWidth: number | null;
  canvasHeight: number | null;
  designs: CustomOrderDesignDto[];
  /** Rendered viewport width in CSS px. Height matches the canvas aspect ratio. */
  viewportSize?: number;
}

/**
 * Read-only re-render of the customer's design canvas, intended for the admin
 * detail page. Picks the silhouette template for the saved productTypeId, then
 * stacks each design as an absolutely-positioned <img> using the persisted
 * Fabric.js geometry (PositionX/Y are center coords, Width/Height are final
 * rendered px on the saved canvas).
 *
 * Returns null when the order predates the geometry capture work — the caller
 * should fall back to displaying the raw coords block instead.
 */
export function CustomOrderPreview({
  productTypeId,
  colorHex,
  canvasWidth,
  canvasHeight,
  designs,
  viewportSize = 480,
}: CustomOrderPreviewProps) {
  const product = useMemo(
    () => PRODUCT_TYPES.find((p) => p.id === productTypeId),
    [productTypeId]
  );

  // Without canvas dimensions we can't safely map saved coords into the viewport.
  // Without a product template we have no silhouette to draw behind the design.
  // Either case ⇒ render nothing; the parent shows the legacy coords block.
  if (!product || !canvasWidth || !canvasHeight) return null;

  const designsWithGeometry = designs.filter(
    (d) =>
      d.positionX != null &&
      d.positionY != null &&
      d.width != null &&
      d.height != null
  );

  if (designsWithGeometry.length === 0) return null;

  // Split per-side so we can show "front" and "back" composites side-by-side
  // when the order has designs on both. Default to "front" for orders that
  // never recorded a side (e.g. early data after the migration).
  const frontDesigns = designsWithGeometry.filter((d) => (d.side ?? "front") === "front");
  const backDesigns = designsWithGeometry.filter((d) => d.side === "back");

  // Scale saved canvas coords (e.g. 500px) into the viewport (e.g. 480px). The
  // canvas was square in practice, but we honor non-square just in case.
  const scale = viewportSize / canvasWidth;
  const viewportHeight = canvasHeight * scale;

  return (
    <div className="space-y-6">
      {frontDesigns.length > 0 && (
        <SidePreview
          label="ფრონტი"
          templateUrl={product.svgTemplate}
          colorHex={colorHex}
          designs={frontDesigns}
          scale={scale}
          viewportWidth={viewportSize}
          viewportHeight={viewportHeight}
        />
      )}
      {backDesigns.length > 0 && (
        <SidePreview
          label="ზურგი"
          templateUrl={product.svgTemplateBack}
          colorHex={colorHex}
          designs={backDesigns}
          scale={scale}
          viewportWidth={viewportSize}
          viewportHeight={viewportHeight}
        />
      )}
    </div>
  );
}

interface SidePreviewProps {
  label: string;
  templateUrl: string;
  colorHex: string | null;
  designs: CustomOrderDesignDto[];
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
}

function SidePreview({
  label,
  templateUrl,
  colorHex,
  designs,
  scale,
  viewportWidth,
  viewportHeight,
}: SidePreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {colorHex && (
          <span
            className="inline-block h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: colorHex }}
            title={colorHex}
          />
        )}
      </div>
      <div
        className="relative overflow-hidden rounded-2xl border border-black/8 bg-slate-50"
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        {/* Silhouette template — sits behind every design overlay. */}
        <img
          src={templateUrl}
          alt={label}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        {designs.map((d) => {
          // Fabric stores center coords; CSS expects top-left. Translate via
          // half-width/half-height offsets, scaled into viewport space.
          const width = (d.width ?? 0) * scale;
          const height = (d.height ?? 0) * scale;
          const centerX = (d.positionX ?? 0) * scale;
          const centerY = (d.positionY ?? 0) * scale;
          const left = centerX - width / 2;
          const top = centerY - height / 2;
          const angle = d.angle ?? 0;
          return (
            <img
              key={d.id}
              src={d.designImageUrl}
              alt={`Design ${d.id}`}
              className="pointer-events-none absolute"
              style={{
                left,
                top,
                width,
                height,
                transform: `rotate(${angle}deg)`,
                transformOrigin: "center center",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
