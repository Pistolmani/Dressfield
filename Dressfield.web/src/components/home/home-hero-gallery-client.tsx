"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/catalog";
import { HeroGalleryClient } from "@/components/ui/hero-gallery-client";

const FALLBACK_HERO_IMAGES = ["/dressfield-fallback.jpg"];

interface HomeHeroGalleryClientProps {
  count?: number;
  mobileCount?: number;
  className?: string;
  maxImages?: number;
}

export function HomeHeroGalleryClient({
  count = 8,
  mobileCount = 6,
  className,
  maxImages = 18,
}: HomeHeroGalleryClientProps) {
  const productsQuery = useQuery({
    queryKey: ["home-hero-products"],
    queryFn: () => getProducts(),
    staleTime: 60_000,
  });

  const images = useMemo(() => {
    const productImages = (productsQuery.data ?? [])
      .map((product) => product.primaryImageUrl)
      .filter((image): image is string => Boolean(image));

    const merged = [...productImages, ...FALLBACK_HERO_IMAGES];
    return Array.from(new Set(merged)).slice(0, maxImages);
  }, [productsQuery.data, maxImages]);

  return (
    <HeroGalleryClient
      images={images.length > 0 ? images : FALLBACK_HERO_IMAGES}
      count={count}
      mobileCount={mobileCount}
      className={className}
    />
  );
}
