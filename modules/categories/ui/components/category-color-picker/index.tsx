"use client";

import * as React from "react";
import { Check, Palette, SlidersHorizontal } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORY_COLOR } from "@/modules/categories/models/category.schema";

export const CATEGORY_PRESET_COLORS: string[] = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#F43F5E", // Rose
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#64748B", // Slate
  "#84CC16", // Lime
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#D946EF", // Fuchsia
  "#EF4444", // Red
  "#EAB308", // Yellow
  "#78716C", // Stone
  "#0EA5E9", // Sky
];

const NAMED_COLOR_TO_HEX: Record<string, string> = {
  emerald: "#10B981",
  green: "#10B981",
  blue: "#3B82F6",
  violet: "#8B5CF6",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  pink: "#F43F5E",
  cyan: "#06B6D4",
  orange: "#F97316",
  slate: "#64748B",
  gray: "#64748B",
  zinc: "#78716C",
  lime: "#84CC16",
  teal: "#14B8A6",
  indigo: "#6366F1",
  fuchsia: "#D946EF",
  red: "#EF4444",
  yellow: "#EAB308",
  sky: "#0EA5E9",
};

export function resolveCategoryHexColor(color?: string | null): string {
  if (!color) return DEFAULT_CATEGORY_COLOR;
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) return trimmed.toUpperCase();
  return NAMED_COLOR_TO_HEX[trimmed.toLowerCase()] ?? DEFAULT_CATEGORY_COLOR;
}

/**
 * Converte cor Hex (#RRGGBB) para HSL ({ h: 0..360, s: 0..100, l: 0..100 })
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return { h: 189, s: 94, l: 43 };
  }

  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converte HSL para Hex (#RRGGBB em maiúsculas)
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

export interface CategoryColorPickerProps {
  value?: string | null;
  onChange: (color: string | null) => void;
  variant?: "grid" | "carousel";
  allowDeselect?: boolean;
  className?: string;
}

export function CategoryColorPicker({
  value,
  onChange,
  variant = "grid",
  allowDeselect = true,
  className,
}: CategoryColorPickerProps) {
  const activeColor = (value || DEFAULT_CATEGORY_COLOR).toUpperCase();
  const [mode, setMode] = React.useState<"palette" | "custom">("palette");
  const initialHsl = React.useMemo(() => hexToHsl(activeColor), [activeColor]);

  const [hue, setHue] = React.useState<number>(initialHsl.h);
  const [lightness, setLightness] = React.useState<number>(initialHsl.l);
  const [hexInput, setHexInput] = React.useState<string>(
    activeColor.replace(/^#/, "")
  );

  // Sincroniza estados locais quando `value` muda externamente
  React.useEffect(() => {
    const current = (value || DEFAULT_CATEGORY_COLOR).toUpperCase();
    const hsl = hexToHsl(current);
    setHue(hsl.h);
    setLightness(hsl.l);
    setHexInput(current.replace(/^#/, ""));
  }, [value]);

  const handleSelectPreset = (presetHex: string) => {
    const normalized = presetHex.toUpperCase();
    if (allowDeselect && value && value.toUpperCase() === normalized) {
      onChange(null);
      return;
    }
    onChange(normalized);
  };

  const handleHueChange = (nextHue: number) => {
    setHue(nextHue);
    const nextHex = hslToHex(nextHue, 85, lightness);
    setHexInput(nextHex.replace(/^#/, ""));
    onChange(nextHex);
  };

  const handleLightnessChange = (nextLightness: number) => {
    setLightness(nextLightness);
    const nextHex = hslToHex(hue, 85, nextLightness);
    setHexInput(nextHex.replace(/^#/, ""));
    onChange(nextHex);
  };

  const handleHexInputChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
    setHexInput(cleaned);
    if (cleaned.length === 6) {
      const fullHex = `#${cleaned}`;
      const hsl = hexToHsl(fullHex);
      setHue(hsl.h);
      setLightness(hsl.l);
      onChange(fullHex);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "palette" ? "custom" : "palette"));
  };

  const headerTitle =
    variant === "carousel"
      ? mode === "palette"
        ? "Paleta de cores"
        : "Cor personalizada"
      : "Cor";

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* Cabeçalho da seção de cor */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-medium text-foreground",
              variant === "carousel" ? "text-xs" : "text-sm"
            )}
          >
            {headerTitle}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title={
              mode === "palette"
                ? "Personalizar cor (Matiz / Brilho / Hex)"
                : "Voltar para a paleta de cores"
            }
            aria-label={
              mode === "palette"
                ? "Personalizar cor"
                : "Voltar para a paleta de cores"
            }
          >
            {mode === "palette" ? (
              <SlidersHorizontal className="size-3.5" />
            ) : (
              <Palette className="size-3.5" />
            )}
          </button>
        </div>

        <span className="text-xs font-mono text-muted-foreground uppercase tabular-nums">
          {value ? value.toUpperCase() : activeColor}
        </span>
      </div>

      {/* Conteúdo: Paleta de Cores ou Sliders Customizados */}
      {mode === "palette" ? (
        variant === "grid" ? (
          <div className="grid grid-cols-8 gap-2.5 py-1">
            {CATEGORY_PRESET_COLORS.map((preset) => {
              const isSelected =
                Boolean(value) &&
                value?.toUpperCase() === preset.toUpperCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{ backgroundColor: preset }}
                  className={cn(
                    "flex size-7.5 items-center justify-center rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-popover scale-105"
                      : "hover:scale-105 opacity-90 hover:opacity-100"
                  )}
                  aria-label={`Selecionar cor ${preset}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <Check className="size-3.5 text-white stroke-[2.5] drop-shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            data-vaul-no-drag=""
            data-swipe-ignore=""
            data-base-ui-swipe-ignore=""
            style={{ touchAction: "pan-x" }}
            className="flex items-center gap-3 overflow-x-auto py-1.5 px-1 -mx-1 no-scrollbar select-none"
          >
            {CATEGORY_PRESET_COLORS.map((preset) => {
              const isSelected =
                Boolean(value) &&
                value?.toUpperCase() === preset.toUpperCase();
              return (
                <button
                  key={preset}
                  type="button"
                  data-vaul-no-drag=""
                  data-swipe-ignore=""
                  data-base-ui-swipe-ignore=""
                  onClick={() => handleSelectPreset(preset)}
                  style={{ backgroundColor: preset }}
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer focus-visible:outline-none",
                    isSelected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                      : "opacity-90 hover:opacity-100"
                  )}
                  aria-label={`Selecionar cor ${preset}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <Check className="size-5 text-white stroke-[2.5] drop-shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        )
      ) : (
        <div
          data-vaul-no-drag=""
          data-swipe-ignore=""
          data-base-ui-swipe-ignore=""
          className="flex flex-col gap-3 py-0.5"
        >
          {/* Slider 1: Matiz */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Matiz</span>
              <span className="font-mono tabular-nums">{hue}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              data-vaul-no-drag=""
              data-swipe-ignore=""
              data-base-ui-swipe-ignore=""
              onChange={(e) => handleHueChange(Number(e.target.value))}
              style={{
                background:
                  "linear-gradient(to right, #ef4444 0%, #eab308 17%, #22c55e 33%, #06b6d4 50%, #3b82f6 67%, #d946ef 83%, #ef4444 100%)",
              }}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-1 [&::-webkit-slider-thumb]:ring-black/20"
              aria-label="Matiz da cor"
            />
          </div>

          {/* Slider 2: Brilho */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Brilho</span>
              <span className="font-mono tabular-nums">{lightness}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={80}
              value={lightness}
              data-vaul-no-drag=""
              data-swipe-ignore=""
              data-base-ui-swipe-ignore=""
              onChange={(e) => handleLightnessChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, hsl(${hue}, 85%, 20%) 0%, hsl(${hue}, 85%, 50%) 50%, hsl(${hue}, 85%, 80%) 100%)`,
              }}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-1 [&::-webkit-slider-thumb]:ring-black/20"
              aria-label="Brilho da cor"
            />
          </div>

          {/* Input Hex */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="text-xs text-muted-foreground shrink-0">Hex</span>
            <InputGroup className="h-8 flex-1">
              <InputGroupAddon className="text-xs font-mono text-muted-foreground">
                #
              </InputGroupAddon>
              <InputGroupInput
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="06B6D4"
                maxLength={6}
                className="font-mono text-xs uppercase tracking-wider"
              />
            </InputGroup>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryColorPicker;
