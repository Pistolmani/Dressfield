import type { SyntheticEvent } from "react";

export const FALLBACK_IMAGE = "/dressfield-fallback.jpg";

// Substring used to recognise the placeholder regardless of whether the browser
// reports it as a relative ("/dressfield-fallback.jpg") or absolute
// ("https://host/dressfield-fallback.jpg") URL.
const FALLBACK_MARKER = "dressfield-fallback";

/**
 * First non-empty image URL from the candidates, or the placeholder.
 *
 * Plain `a ?? b ?? FALLBACK` is unsafe here: `??` only catches null/undefined,
 * so an empty-string URL (a real possibility from the API) slips through and
 * renders a broken `<img src="">`. We treat blank/whitespace as "missing".
 */
export function imageSrc(
  ...candidates: (string | null | undefined)[]
): string {
  for (const candidate of candidates) {
    if (candidate && candidate.trim()) return candidate;
  }
  return FALLBACK_IMAGE;
}

/**
 * Hardened <img> onError handler. A customer should never see a broken-image
 * icon, so on failure we:
 *   1. Retry the real image ONCE with a cache-busting query param. This
 *      self-heals transient failures (Azure blob / App Service cold start, a
 *      network blip) and — crucially — browser-cached failed loads, which
 *      otherwise persist as a broken icon on every later visit until a hard
 *      refresh, without ever re-firing onError on the original URL.
 *   2. Only after the retry also fails do we settle on the placeholder.
 */
function applyFallbackFlow(img: HTMLImageElement) {
  const stage = img.dataset.fallbackStage;

  if (stage === "done") return;

  if (stage !== "retried") {
    const original = img.dataset.originalSrc || img.src;
    const isRetryable =
      original &&
      !original.includes(FALLBACK_MARKER) &&
      !original.startsWith("data:");

    if (isRetryable) {
      img.dataset.originalSrc = original;
      img.dataset.fallbackStage = "retried";
      const separator = original.includes("?") ? "&" : "?";
      img.src = `${original}${separator}_retry=${Date.now()}`;
      return;
    }
  }

  img.dataset.fallbackStage = "done";
  if (!img.src.includes(FALLBACK_MARKER)) {
    img.src = FALLBACK_IMAGE;
  }
}

export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  applyFallbackFlow(event.currentTarget);
}

/**
 * Recover images that failed BEFORE React hydration attached their onError
 * handler. This is the SSR/SSG case: a statically rendered <img> whose URL 404s
 * fails during initial HTML parse, and the browser will NOT re-fire the error
 * event once a handler is later attached — so onError alone silently misses it.
 * Call this once on mount; it scans for already-broken images and runs the same
 * retry/fallback flow on them. Re-running is safe (the fallbackStage guards it).
 */
export function healBrokenImages(root: ParentNode | null = typeof document !== "undefined" ? document : null) {
  if (!root) return;
  for (const img of Array.from(root.querySelectorAll("img"))) {
    if (
      img.complete &&
      img.naturalWidth === 0 &&
      img.dataset.fallbackStage !== "done"
    ) {
      applyFallbackFlow(img);
    }
  }
}
