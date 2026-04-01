"use client";

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
  className?: string;
}

export function HeroGalleryClient({ images, count = 18, className }: HeroGalleryClientProps) {
  return <InteractiveHeroGallery images={images} count={count} className={className} />;
}
