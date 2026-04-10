"use client";

import { useCallback, useRef } from "react";
import type { DesignItem } from "@/config/custom-order";

const MAX_HISTORY = 30;

interface DesignSnapshot {
  front: DesignItem[];
  back: DesignItem[];
}

export function useDesignHistory() {
  const historyRef = useRef<DesignSnapshot[]>([]);
  const pointerRef = useRef(-1);

  const pushState = useCallback((front: DesignItem[], back: DesignItem[]) => {
    const snapshot: DesignSnapshot = {
      front: front.map((d) => ({ ...d, transform: d.transform ? { ...d.transform } : undefined })),
      back: back.map((d) => ({ ...d, transform: d.transform ? { ...d.transform } : undefined })),
    };

    // Truncate any forward history
    historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    historyRef.current.push(snapshot);

    // Cap history length
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(historyRef.current.length - MAX_HISTORY);
    }

    pointerRef.current = historyRef.current.length - 1;
  }, []);

  const canUndo = useCallback(() => pointerRef.current > 0, []);
  const canRedo = useCallback(() => pointerRef.current < historyRef.current.length - 1, []);

  const undo = useCallback((): DesignSnapshot | null => {
    if (pointerRef.current <= 0) return null;
    pointerRef.current -= 1;
    return historyRef.current[pointerRef.current];
  }, []);

  const redo = useCallback((): DesignSnapshot | null => {
    if (pointerRef.current >= historyRef.current.length - 1) return null;
    pointerRef.current += 1;
    return historyRef.current[pointerRef.current];
  }, []);

  return { pushState, undo, redo, canUndo, canRedo };
}
