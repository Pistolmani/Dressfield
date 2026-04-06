"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const InteractiveHeroGallery = dynamic(
  () =>
    import("@/components/ui/interactive-hero-gallery").then(
      (module) => module.InteractiveHeroGallery
    ),
  { ssr: false }
);

interface HeroGalleryClientProps {
  images: string[];
  count?: number;
  mobileCount?: number;
  className?: string;
}

const PHONE_MEDIA_QUERY = "(max-width: 639px)";

export function HeroGalleryClient({
  images,
  count = 8,
  mobileCount = 6,
  className,
}: HeroGalleryClientProps) {
  const [isPhone, setIsPhone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(PHONE_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(PHONE_MEDIA_QUERY);
    const apply = (matches: boolean) => setIsPhone(matches);
    apply(media.matches);

    const onChange = (event: MediaQueryListEvent) => apply(event.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const resolvedCount = isPhone ? mobileCount : count;

  return <InteractiveHeroGallery images={images} count={resolvedCount} className={className} />;
}
