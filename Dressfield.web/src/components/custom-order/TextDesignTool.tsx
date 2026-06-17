"use client";

import { useState } from "react";
import { Type, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rasterizeTextToPng } from "@/lib/text-design";

interface TextDesignToolProps {
  /** Receives the rasterized text image URL; reuses the normal design pipeline. */
  onAdd: (url: string) => void;
  /** Garment color hex, used so the live preview shows realistic thread contrast. */
  garmentColorHex?: string | null;
  disabled?: boolean;
}

interface FontChoice {
  id: string;
  label: string;
  /** Concrete CSS font-family that is already loaded by the app. */
  family: string;
  weight: number;
}

// All three render Latin; the first two also cover Georgian (mkhedruli).
const FONT_CHOICES: FontChoice[] = [
  { id: "grotesk", label: "გროტესკი", family: "Grotesk Georgian", weight: 700 },
  { id: "twsborg", label: "დეკორ.", family: "Twsborg", weight: 400 },
  { id: "serif", label: "სერიფი", family: "Georgia, 'Times New Roman', serif", weight: 700 },
];

const THREAD_COLORS = [
  { label: "შავი", hex: "#111111" },
  { label: "თეთრი", hex: "#FFFFFF" },
  { label: "ოქრო", hex: "#C9A227" },
  { label: "ვერცხლი", hex: "#C0C0C0" },
  { label: "წითელი", hex: "#D32F2F" },
  { label: "ლურჯი", hex: "#1F3A5F" },
  { label: "მწვანე", hex: "#2E7D32" },
  { label: "ვარდისფერი", hex: "#E91E8C" },
];

const MAX_TEXT_LENGTH = 24;

export function TextDesignTool({ onAdd, garmentColorHex, disabled }: TextDesignToolProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fontId, setFontId] = useState(FONT_CHOICES[0].id);
  const [color, setColor] = useState(THREAD_COLORS[0].hex);
  const [isAdding, setIsAdding] = useState(false);

  const font = FONT_CHOICES.find((f) => f.id === fontId) ?? FONT_CHOICES[0];
  const previewBg = garmentColorHex && garmentColorHex.trim() ? garmentColorHex : "#f1f5f9";
  const trimmed = text.trim();

  async function handleAdd() {
    if (!trimmed || isAdding) return;
    setIsAdding(true);
    try {
      const url = await rasterizeTextToPng({
        text: trimmed,
        fontFamily: font.family,
        fontWeight: font.weight,
        color,
      });
      onAdd(url);
      toast.success("ტექსტი დაემატა");
      setText("");
      setOpen(false);
    } catch {
      toast.error("ტექსტის დამატება ვერ მოხერხდა");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2.5 h-11 w-full px-3 rounded-xl border-2 border-dashed transition-all",
          open ? "border-accent bg-accent/5" : "border-gray-200 bg-white hover:border-accent hover:shadow-sm",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-white flex-shrink-0">
          <Type className="h-3.5 w-3.5" />
        </div>
        <span className="text-[11px] font-bold text-gray-900 truncate">ტექსტი / მონოგრამა</span>
      </button>

      {open && (
        <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          {/* Live preview */}
          <div
            className="flex h-16 items-center justify-center overflow-hidden rounded-lg border border-black/10 px-2"
            style={{ background: previewBg }}
          >
            <span
              className="truncate text-2xl leading-none"
              style={{ fontFamily: font.family, fontWeight: font.weight, color }}
            >
              {trimmed || "შენი ტექსტი"}
            </span>
          </div>

          {/* Text input */}
          <input
            type="text"
            value={text}
            maxLength={MAX_TEXT_LENGTH}
            onChange={(e) => setText(e.target.value)}
            placeholder="დაწერე სახელი ან სიტყვა"
            className="h-9 w-full rounded-lg border border-gray-200 px-2.5 text-[12px] outline-none focus:border-accent"
          />

          {/* Font choices */}
          <div className="flex gap-1.5">
            {FONT_CHOICES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontId(f.id)}
                style={{ fontFamily: f.family }}
                className={cn(
                  "flex-1 rounded-lg border px-1 py-1.5 text-[12px] transition-all",
                  fontId === f.id
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-gray-200 text-gray-600 hover:border-accent/40"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Thread colors */}
          <div className="flex flex-wrap gap-1.5">
            {THREAD_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => setColor(c.hex)}
                className={cn(
                  "h-6 w-6 rounded-full border transition-all",
                  color === c.hex ? "ring-2 ring-accent ring-offset-1 scale-110" : "hover:scale-110",
                  c.hex.toUpperCase() === "#FFFFFF" ? "border-gray-300" : "border-black/10"
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>

          {/* Add */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!trimmed || isAdding}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-accent text-[12px] font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {isAdding ? "ემატება..." : "დაამატე ტექსტი"}
          </button>
        </div>
      )}
    </div>
  );
}
