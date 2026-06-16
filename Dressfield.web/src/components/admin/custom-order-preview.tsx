/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
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
  /** When set, the matching design is outlined so the admin can tell which one they opened. */
  highlightDesignId?: number | null;
}

/**
 * Read-only re-render of the customer's design canvas, intended for the admin
 * detail page. Picks the silhouette template for the saved productTypeId, then
 * stacks each design as an absolutely-positioned <img> using the persisted
 * Fabric.js geometry (PositionX/Y are center coords, Width/Height are final
 * rendered px on the saved canvas).
 *
 * Returns null when the order predates the geometry capture work - the caller
 * should fall back to displaying the raw coords block instead.
 */
export function CustomOrderPreview({
  productTypeId,
  colorHex,
  canvasWidth,
  canvasHeight,
  designs,
  viewportSize = 480,
  highlightDesignId = null,
}: CustomOrderPreviewProps) {
  const product = useMemo(
    () => PRODUCT_TYPES.find((p) => p.id === productTypeId),
    [productTypeId]
  );

  // Without canvas dimensions we can't safely map saved coords into the viewport.
  // Without a product template we have no silhouette to draw behind the design.
  // Either case => render nothing; the parent shows the legacy coords block.
  if (!product || !canvasWidth || !canvasHeight) return null;

  // A design is placeable when it has center coords plus either a saved rendered
  // size or scale factors (size is then measured from the image at render time).
  const designsWithGeometry = designs.filter(
    (d) =>
      d.positionX != null &&
      d.positionY != null &&
      ((d.width != null && d.height != null) ||
        (d.scaleX != null && d.scaleY != null))
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
          highlightDesignId={highlightDesignId}
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
          highlightDesignId={highlightDesignId}
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
  highlightDesignId?: number | null;
}

function SidePreview({
  label,
  templateUrl,
  colorHex,
  designs,
  scale,
  viewportWidth,
  viewportHeight,
  highlightDesignId = null,
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
        {/* Silhouette template - sits behind every design overlay. */}
        <img
          src={templateUrl}
          alt={label}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        {designs.map((d) => (
          <DesignOverlay
            key={d.id}
            design={d}
            scale={scale}
            isHighlighted={highlightDesignId != null && d.id === highlightDesignId}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * One design overlaid on the silhouette. Fabric stores center coords; CSS expects
 * top-left, so we translate via half-width/half-height. When the checkout failed
 * to capture the rendered size (width/height null), we measure the image's natural
 * size on load and multiply by the saved scale - this needs no CORS, so it works
 * for cross-origin design images that the checkout-time measurement could not read.
 */
function DesignOverlay({
  design: d,
  scale,
  isHighlighted,
}: {
  design: CustomOrderDesignDto;
  scale: number;
  isHighlighted: boolean;
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const needsMeasure = d.width == null || d.height == null;

  // Rendered size in canvas px: prefer the saved value, else natural x scale.
  let renderedW = d.width ?? null;
  let renderedH = d.height ?? null;
  if (needsMeasure && natural) {
    renderedW = natural.w * (d.scaleX ?? 1);
    renderedH = natural.h * (d.scaleY ?? 1);
  }

  const ready = renderedW != null && renderedH != null;
  const width = (renderedW ?? 0) * scale;
  const height = (renderedH ?? 0) * scale;
  const left = (d.positionX ?? 0) * scale - width / 2;
  const top = (d.positionY ?? 0) * scale - height / 2;
  const angle = d.angle ?? 0;

  return (
    <img
      src={d.designImageUrl}
      alt={`Design ${d.id}`}
      onLoad={(event) => {
        if (!needsMeasure) return;
        const img = event.currentTarget;
        if (img.naturalWidth > 0) {
          setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        }
      }}
      className={`pointer-events-none absolute${
        isHighlighted ? " outline outline-2 outline-offset-2 outline-accent" : ""
      }`}
      style={{
        left,
        top,
        width,
        height,
        // Hide until we know the size to avoid a flash at the wrong dimensions.
        opacity: ready ? 1 : 0,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
      }}
    />
  );
}
