"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const MAX_PREVIEW_ITEMS = 4;
const CLOSE_DELAY_MS = 120;
const FALLBACK_IMAGE = "/dressfield-fallback.jpg";

export function CartHoverPreview() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const removeItem = useCartStore((state) => state.removeItem);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  function openPreview() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setOpen(true);
  }

  function closePreview() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, CLOSE_DELAY_MS);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextFocused = event.relatedTarget;
    if (nextFocused && event.currentTarget.contains(nextFocused)) return;
    closePreview();
  }

  const previewItems = items.slice(0, MAX_PREVIEW_ITEMS);
  const hasMore = items.length > MAX_PREVIEW_ITEMS;

  function renderCartContent(isMobile: boolean) {
    const listItems = isMobile ? items : previewItems;
    const showMoreText = !isMobile && hasMore;

    return (
      <div className={`flex flex-col h-full w-full ${isMobile ? "bg-black/90 text-white" : ""}`}>
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold tracking-wide">შენი კალათა</p>
          <span className="text-xs text-white/70">{totalItems} პროდუქტი</span>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center flex-1">
            <p className="text-sm text-white/70">კალათა ცარიელია</p>
          </div>
        ) : (
          <>
            <div className={`overflow-y-auto p-2 space-y-1 ${isMobile ? 'flex-1' : 'max-h-80'}`}>
              {listItems.map((item) => {
                const isCustom = Boolean(item.customOrderData);
                const itemHref = isCustom ? "/custom-order" : "/products";
                const designUrl = item.customOrderData?.designs?.[0]?.url;
                const canvasUrl = item.customOrderData?.canvasPreviewUrl;
                const resolvedImage = canvasUrl || designUrl || item.imageUrl;

                return (
                  <div
                    key={`${item.productId}-${item.variantId ?? 0}`}
                    className="group relative rounded-xl hover:bg-white/[0.08] transition-all duration-300"
                  >
                    <Link
                      href={itemHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 p-2"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {resolvedImage ? (
                          <img
                            src={resolvedImage}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              const image = event.currentTarget;
                              if (image.dataset.fallbackApplied === "1") return;
                              image.dataset.fallbackApplied = "1";
                              image.src = FALLBACK_IMAGE;
                            }}
                          />
                        ) : (
                          <img
                            src={FALLBACK_IMAGE}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-1">
                        <p className="text-xs font-semibold truncate group-hover:text-white transition-colors">
                          {item.name}
                        </p>
                        {item.variantLabel ? (
                          <p className="text-[11px] text-white/60 truncate">
                            {item.variantLabel}
                          </p>
                        ) : null}
                        <p className="text-[11px] text-white/75">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="text-xs font-semibold tabular-nums shrink-0 group-hover:text-white transition-colors duration-300">
                        {formatPrice(item.quantity * item.price)}
                      </div>
                    </Link>

                    <div className="flex justify-end px-2 pb-1">
                      <button
                        type="button"
                        aria-label="ამოღება"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          removeItem(item.productId, item.variantId);
                        }}
                        className="rounded-md p-1 text-white/55 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {showMoreText ? (
              <p className="px-4 pb-2 text-[11px] text-white/60 shrink-0">
                კიდევ {items.length - MAX_PREVIEW_ITEMS} პროდუქტი
              </p>
            ) : null}

            <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between shrink-0 mt-auto">
              <span className="text-xs text-white/70">ჯამი</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 px-4 pb-4 shrink-0">
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="text-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                კალათა
              </Link>
              <Link
                href="/checkout"
                onClick={() => setMobileOpen(false)}
                className="text-center rounded-lg bg-white text-black px-3 py-2 text-xs font-semibold hover:bg-white/90 transition-colors"
              >
                გადახდა
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className="relative hidden md:block"
        onMouseEnter={openPreview}
        onMouseLeave={closePreview}
        onFocusCapture={openPreview}
        onBlurCapture={handleBlur}
      >
        <Link
          href="/cart"
          aria-label="კალათის გახსნა"
          className="relative p-2 hover:bg-white/10 rounded-lg transition-colors block"
        >
          <ShoppingCart className="h-5 w-5" />
          {mounted && totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Link>

        {open && mounted && (
          <div className="absolute right-0 top-full pt-2 w-80 z-[70]">
            <div className="rounded-2xl border border-white/15 bg-black/90 text-white shadow-2xl backdrop-blur-md overflow-hidden">
              {renderCartContent(false)}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="relative p-2 hover:bg-white/10 rounded-lg transition-colors block text-inherit bg-transparent border-none">
            <ShoppingCart className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] max-w-sm bg-black border-white/10 p-0 flex flex-col text-white">
            <SheetHeader className="sr-only">
              <SheetTitle>შენი კალათა</SheetTitle>
            </SheetHeader>
            {renderCartContent(true)}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
