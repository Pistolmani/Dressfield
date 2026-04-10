/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveHeroGalleryProps {
  images: string[];
  className?: string;
  count?: number;
  interactive?: boolean;
  compact?: boolean;
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

interface ScatterOptions {
  cols?: number;
  clampLeftMin?: number;
  clampLeftMax?: number;
  clampTopMin?: number;
  clampTopMax?: number;
  jitterScale?: number;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function createSeededRandom(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createScatteredCards(images: string[], count: number, options: ScatterOptions = {}): CardItem[] {
  if (images.length === 0) return [];

  const safeCount = Math.max(1, count);
  const random = createSeededRandom(hashString(`${images.join("|")}::${safeCount}`));

  const pool = [...images];
  while (pool.length < safeCount) pool.push(...images);
  const selected = pool.slice(0, safeCount);

  const cols = Math.max(1, options.cols ?? 4);
  const rows = Math.ceil(safeCount / cols);

  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push([c, r]);
    }
  }

  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const picked = cells.slice(0, safeCount);
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const clampLeftMin = options.clampLeftMin ?? 10;
  const clampLeftMax = options.clampLeftMax ?? 90;
  const clampTopMin = options.clampTopMin ?? 10;
  const clampTopMax = options.clampTopMax ?? 90;
  const jitterScale = options.jitterScale ?? 0.5;

  return selected.map((url, i) => {
    const [c, r] = picked[i];
    const jitterX = (random() - 0.5) * cellW * jitterScale;
    const jitterY = (random() - 0.5) * cellH * jitterScale;
    const left = `${Math.max(clampLeftMin, Math.min(clampLeftMax, c * cellW + cellW / 2 + jitterX))}%`;
    const top = `${Math.max(clampTopMin, Math.min(clampTopMax, r * cellH + cellH / 2 + jitterY))}%`;

    return {
      id: `card-${i}`,
      url,
      left,
      top,
      rotate: (random() - 0.5) * 50,
      zIndex: i,
      floatDelay: random() * 3,
      floatDuration: 5 + random() * 4,
    };
  });
}

export function InteractiveHeroGallery({
  images,
  className,
  count = 8,
  interactive = true,
  compact = false,
}: InteractiveHeroGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zMap, setZMap] = useState<Record<string, number>>({});
  const cards = useMemo(
    () =>
      createScatteredCards(images, count, compact
        ? {
            cols: 2,
            clampLeftMin: 18,
            clampLeftMax: 82,
            clampTopMin: 14,
            clampTopMax: 86,
            jitterScale: 0.3,
          }
        : {
            cols: 3,
            clampLeftMin: 8,
            clampLeftMax: 92,
            clampTopMin: 8,
            clampTopMax: 92,
            jitterScale: 0.45,
          }),
    [images, count, compact]
  );

  const bringToFront = (id: string) => {
    setZMap((prev) => {
      const maxZ = Math.max(...Object.values(prev), ...cards.map((card) => card.zIndex), 0);
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  if (cards.length === 0) {
    return <div className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
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
            pointerEvents: interactive ? "auto" : "none",
          }}
        >
          <motion.div
            className={cn(
              compact
                ? "w-28 sm:w-36 aspect-[4/5] p-1.5 rounded-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]"
                : "w-52 sm:w-72 aspect-[4/5] p-2 rounded-2xl shadow-[0_12px_48px_-12px_rgba(0,0,0,0.5)]",
              "bg-white origin-center",
              interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            )}
            style={{
              touchAction: interactive ? "none" : "auto",
              userSelect: "none",
              willChange: "transform",
            }}
            initial={{
              opacity: 0,
              scale: compact ? 0.7 : 0.4,
              rotate: card.rotate + (index % 2 === 0 ? (compact ? 14 : 30) : (compact ? -14 : -30)),
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: card.rotate,
            }}
            transition={{
              type: "spring",
              damping: compact ? 24 : 20,
              stiffness: compact ? 95 : 60,
              mass: compact ? 0.8 : 1,
              delay: index * (compact ? 0.04 : 0.1),
            }}
            drag={interactive}
            dragConstraints={containerRef}
            dragSnapToOrigin={false}
            dragElastic={compact ? 0.14 : 0.15}
            dragMomentum
            dragTransition={{
              bounceStiffness: 120,
              bounceDamping: 18,
              power: 0.3,
              timeConstant: 180,
            }}
            whileHover={interactive ? { scale: 1.06, transition: { duration: 0.2 } } : undefined}
            whileTap={interactive ? { scale: compact ? 1.04 : 1.06 } : undefined}
            whileDrag={interactive ? { scale: compact ? 1.03 : 1.1, boxShadow: "0px 20px 50px rgba(0,0,0,0.4)" } : undefined}
            onPointerDown={interactive ? (event) => {
              event.stopPropagation();
              bringToFront(card.id);
            } : undefined}
            onHoverStart={interactive ? () => bringToFront(card.id) : undefined}
            onDragStart={interactive ? () => bringToFront(card.id) : undefined}
          >
            <motion.div
              className="w-full h-full"
              animate={compact ? undefined : {
                y: [0, -5, 0, 3, 0],
                rotate: [0, 1, 0, -0.8, 0],
              }}
              transition={compact ? undefined : {
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
                  loading={index < 4 ? "eager" : "lazy"}
                  fetchPriority={index < 2 ? "high" : "auto"}
                  decoding="async"
                  draggable={false}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (image.dataset.fallbackApplied === "1") return;
                    image.dataset.fallbackApplied = "1";
                    image.src = "/dressfield-fallback.jpg";
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
