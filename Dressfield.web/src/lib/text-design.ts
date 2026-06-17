// Rasterizes typed text into a transparent PNG and returns an object URL.
//
// The custom-order canvas works entirely with image URLs (DesignItem.url), so the
// cleanest way to support "text embroidery" is to render the text to an image and
// feed it through the exact same pipeline as an uploaded design — no canvas,
// order-DTO, or backend changes required.

export interface TextRasterOptions {
  text: string;
  /** A concrete, already-loaded CSS font-family value (e.g. `"Grotesk Georgian"`). */
  fontFamily: string;
  fontWeight?: number | string;
  /** Fill color, any CSS color string. */
  color: string;
}

// Render large for crisp embroidery output, but keep the bitmap bounded so a long
// name doesn't produce a multi-thousand-pixel canvas.
const BASE_FONT_SIZE = 256;
const MAX_TEXT_WIDTH = 1800;

function buildFontString(weight: number | string, size: number, family: string) {
  // Quote the family unless it is already quoted or a CSS keyword list.
  const needsQuotes = !/['",]/.test(family) && /\s/.test(family);
  const fam = needsQuotes ? `"${family}"` : family;
  return `${weight} ${size}px ${fam}`;
}

async function ensureFontLoaded(fontString: string, sampleText: string) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.load(fontString, sampleText);
    await document.fonts.ready;
  } catch {
    // Best-effort: fall back to whatever the browser has.
  }
}

/**
 * Draws `text` and returns a blob: URL for a tightly-cropped transparent PNG.
 * Throws if the text is empty or canvas encoding fails.
 */
export async function rasterizeTextToPng(options: TextRasterOptions): Promise<string> {
  const text = options.text.replace(/\s+/g, " ").trim();
  if (!text) throw new Error("Cannot rasterize empty text");

  const weight = options.fontWeight ?? 700;
  const family = options.fontFamily;

  let fontSize = BASE_FONT_SIZE;
  await ensureFontLoaded(buildFontString(weight, fontSize, family), text);

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("Canvas 2D context unavailable");

  const measure = (size: number) => {
    measureCtx.font = buildFontString(weight, size, family);
    const m = measureCtx.measureText(text);
    const ascent = m.actualBoundingBoxAscent || size * 0.8;
    const descent = m.actualBoundingBoxDescent || size * 0.2;
    return { width: Math.ceil(m.width), ascent: Math.ceil(ascent), descent: Math.ceil(descent) };
  };

  let metrics = measure(fontSize);
  // Scale down once if a long string would exceed the width cap.
  if (metrics.width > MAX_TEXT_WIDTH) {
    fontSize = Math.max(48, Math.floor((fontSize * MAX_TEXT_WIDTH) / metrics.width));
    metrics = measure(fontSize);
  }

  const pad = Math.ceil(fontSize * 0.18);
  const canvas = document.createElement("canvas");
  canvas.width = metrics.width + pad * 2;
  canvas.height = metrics.ascent + metrics.descent + pad * 2;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.font = buildFontString(weight, fontSize, family);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = options.color;
  ctx.fillText(text, pad, pad + metrics.ascent);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Failed to encode text image");

  return URL.createObjectURL(blob);
}
