"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveHeroGalleryProps {
  images: string[];
  className?: string;
  count?: number;
}

export function InteractiveHeroGallery({ images, className, count = 12 }: InteractiveHeroGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<{ id: string; url: string; x: number; y: number; rotate: number; zIndex: number }[]>([]);

  useEffect(() => {
    if (images.length === 0) {
      setItems([]);
      setMounted(true);
      return;
    }

    // Duplicate images if we don't have enough to fill the requested count
    const pool = [...images];
    while (pool.length < count) {
      pool.push(...images);
    }
    const selected = pool.slice(0, count);

    // Calculate grid dimensions to spread them evenly
    const columns = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / columns);

    // Generate smart-scattered positions and rotations only on mount
    const newItems = selected.map((url, i) => {
      // Find what grid cell this image belongs in
      const row = Math.floor(i / columns);
      const col = i % columns;
      
      // Calculate base percentages for the cell center
      const baseX = (col / columns) * 90 + 5; // Keep away from extremely sharp edges (5% - 95%)
      const baseY = (row / rows) * 80 + 10;   // Higher vertical boundary (10% - 90%)
      
      // Inject organic randomness (jitter) so it doesn't look like a mathematically perfect grid
      const jitterX = (Math.random() - 0.5) * (90 / columns); 
      const jitterY = (Math.random() - 0.5) * (80 / rows);
      
      const safeX = Math.max(2, Math.min(98, baseX + jitterX));
      const safeY = Math.max(2, Math.min(98, baseY + jitterY));
      const rotate = Math.floor(Math.random() * 70) - 35; // slightly wider rotation variations

      return {
        id: `img-${i}-${Math.random().toString(36).substring(7)}`,
        url,
        x: safeX,
        y: safeY,
        rotate,
        zIndex: i,
      };
    });
    setItems(newItems);
    setMounted(true);
  }, [images, count]);

  if (!mounted) {
    return <div className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  const bringToFront = (id: string) => {
    setItems((prev) => {
      const maxZ = Math.max(...prev.map((i) => i.zIndex), 0);
      return prev.map((item) =>
        item.id === id ? { ...item, zIndex: maxZ + 1 } : item
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-auto", className)}
      style={{ perspective: "1000px" }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="absolute w-36 sm:w-48 aspect-[4/5] p-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing will-change-transform"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            zIndex: item.zIndex,
            // Offset origin slightly so rotate looks organic
            transformOrigin: "center center",
            // Keep them somewhat within bound on load via translates
            x: "-50%",
            y: "-50%"
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: item.rotate - 20 }}
          animate={{ opacity: 1, scale: 1, rotate: item.rotate }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
            delay: index * 0.05, // Staggered entrance
          }}
          drag
          dragConstraints={containerRef}
          dragElastic={0.4}
          dragMomentum={true}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileDrag={{ scale: 1.1, boxShadow: "0px 20px 50px rgba(0,0,0,0.4)" }}
          onHoverStart={() => bringToFront(item.id)}
          onDragStart={() => bringToFront(item.id)}
        >
          {/* Use standard img for static export safety */}
          <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-100/50 bg-gray-50">
            <img
              src={item.url}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
