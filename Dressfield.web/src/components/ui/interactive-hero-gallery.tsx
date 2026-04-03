/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveHeroGalleryProps {
  images: string[];
  className?: string;
  count?: number;
}

interface CardItem {
  id: string;
  url: string;
  left: string;
  top: string;
  rotate: number;
  zIndex: number;
  floatDelay: number;
  floatDuration: number;
}

/**
 * Distribute N cards across the viewport using a shuffled grid.
 * Each card gets its own cell — no overlap possible.
 */
function createScatteredCards(images: string[], count: number): CardItem[] {
  if (images.length === 0) return [];

  const pool = [...images];
  while (pool.length < count) pool.push(...images);
  const selected = pool.slice(0, count);

  // Landscape-friendly grid: more columns than rows
  const cols = 6;
  const rows = Math.ceil(count / cols);

  // Build all cells, shuffle, pick N
  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push([c, r]);
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const picked = cells.slice(0, count);

  const cellW = 100 / cols;
  const cellH = 100 / rows;

  return selected.map((url, i) => {
    const [c, r] = picked[i];
    const jitterX = (Math.random() - 0.5) * cellW * 0.4;
    const jitterY = (Math.random() - 0.5) * cellH * 0.4;
    const left = `${Math.max(2, Math.min(98, c * cellW + cellW / 2 + jitterX))}%`;
    const top = `${Math.max(2, Math.min(98, r * cellH + cellH / 2 + jitterY))}%`;

    return {
      id: `card-${i}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      left,
      top,
      rotate: (Math.random() - 0.5) * 50,
      zIndex: i,
      floatDelay: Math.random() * 3,
      floatDuration: 5 + Math.random() * 4,
    };
  });
}

export function InteractiveHeroGallery({ images, className, count = 18 }: InteractiveHeroGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zMap, setZMap] = useState<Record<string, number>>({});

  // Compute cards once per images/count change — stable across re-renders
  const cards = useMemo(() => createScatteredCards(images, count), [images, count]);

  const bringToFront = (id: string) => {
    setZMap((prev) => {
      const maxZ = Math.max(...Object.values(prev), ...cards.map((c) => c.zIndex), 0);
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  if (cards.length === 0) {
    return <div className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-auto", className)}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="absolute"
          style={{
            left: card.left,
            top: card.top,
            zIndex: zMap[card.id] ?? card.zIndex,
            translate: "-50% -50%",
          }}
        >
          <motion.div
            className="w-28 sm:w-40 aspect-[4/5] p-1.5 bg-white rounded-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing origin-center"
            initial={{
              opacity: 0,
              scale: 0.4,
              rotate: card.rotate + (index % 2 === 0 ? 30 : -30),
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: card.rotate,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 60,
              mass: 1,
              delay: index * 0.1,
            }}
            drag
            dragConstraints={containerRef}
            dragElastic={0.35}
            dragMomentum={true}
            whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
            whileDrag={{ scale: 1.1, boxShadow: "0px 20px 50px rgba(0,0,0,0.4)" }}
            onHoverStart={() => bringToFront(card.id)}
            onDragStart={() => bringToFront(card.id)}
          >
            <motion.div
              className="w-full h-full"
              animate={{
                y: [0, -5, 0, 3, 0],
                rotate: [0, 1, 0, -0.8, 0],
              }}
              transition={{
                duration: card.floatDuration,
                delay: card.floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-100/50 bg-gray-50 pointer-events-none">
                <img
                  src={card.url}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.dataset.fallbackApplied === "1") return;
                    img.dataset.fallbackApplied = "1";
                    img.src = "/hero-embroidery.jpg";
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
