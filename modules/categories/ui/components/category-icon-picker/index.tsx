"use client";

import * as React from "react";
import * as LucideNamespace from "lucide-react";
import { Loader2, Search, X, type LucideProps } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { translateIconSearchAction } from "@/modules/categories/ui/actions/translate-icon-search.action";
import { DEFAULT_CATEGORY_COLOR } from "@/modules/categories/models/category.schema";

type IconComponentType = React.ComponentType<LucideProps>;

const LUCIDE_ICONS_MAP: Record<string, IconComponentType> =
  (
    LucideNamespace as unknown as {
      icons?: Record<string, IconComponentType>;
    }
  ).icons ?? {};

const ALL_ICON_ENTRIES: {
  name: string;
  lower: string;
  words: string[];
}[] = Object.keys(LUCIDE_ICONS_MAP).map((name) => {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return {
    name,
    lower: name.toLowerCase(),
    words,
  };
});

/**
 * Ícones iniciais exibidos antes de qualquer busca, seguindo o layout das imagens de referência.
 */
export const INITIAL_SUGGESTED_ICONS: string[] = [
  "House",
  "Zap",
  "Droplet",
  "Wifi",
  "Phone",
  "Wrench",
  "Hammer",
  "Shield",
  "Utensils",
  "ShoppingCart",
  "Coffee",
  "Pizza",
  "Apple",
  "Car",
  "Fuel",
  "Bus",
];

function resolveExistingInitialIcons(): string[] {
  return INITIAL_SUGGESTED_ICONS.map((iconName) => {
    if (LUCIDE_ICONS_MAP[iconName]) return iconName;
    if (iconName === "House" && LUCIDE_ICONS_MAP["Home"]) return "Home";
    return iconName;
  }).filter((name) => Boolean(LUCIDE_ICONS_MAP[name]));
}

export function matchLucideIconsByTokens(
  tokens: string[],
  limit = 32
): string[] {
  const cleanTokens = tokens
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);

  if (cleanTokens.length === 0) {
    return resolveExistingInitialIcons();
  }

  const scored: { name: string; score: number }[] = [];

  for (const entry of ALL_ICON_ENTRIES) {
    let bestScore = 0;

    for (let i = 0; i < cleanTokens.length; i++) {
      const token = cleanTokens[i];
      // Dá leve preferência aos primeiros tokens (tradução principal)
      const weight = i === 0 ? 10 : i < 3 ? 6 : 3;

      if (entry.lower === token) {
        bestScore = Math.max(bestScore, 100 + weight);
      } else if (entry.words.includes(token)) {
        // Ícones com menos palavras (mais diretos, ex: "Car" vs "CableCar") ganham bônus
        const brevityBonus = Math.max(0, 10 - entry.words.length * 2);
        bestScore = Math.max(bestScore, 70 + weight + brevityBonus);
      } else if (entry.words.some((w) => w.startsWith(token))) {
        const brevityBonus = Math.max(0, 8 - entry.words.length * 2);
        bestScore = Math.max(bestScore, 45 + weight + brevityBonus);
      } else if (token.length >= 3 && entry.lower.includes(token)) {
        bestScore = Math.max(bestScore, 25 + weight);
      }
    }

    if (bestScore > 0) {
      scored.push({ name: entry.name, score: bestScore });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.slice(0, limit).map((s) => s.name);
}

export interface CategoryIconPickerProps {
  value?: string | null;
  onChange: (icon: string | null) => void;
  activeColor?: string | null;
  variant?: "grid" | "carousel";
  allowDeselect?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function CategoryIconPicker({
  value,
  onChange,
  activeColor,
  variant = "grid",
  allowDeselect = true,
  showLabel = true,
  className,
}: CategoryIconPickerProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [matchedIcons, setMatchedIcons] = React.useState<string[]>(() =>
    resolveExistingInitialIcons()
  );

  React.useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) {
      setMatchedIcons(resolveExistingInitialIcons());
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    const runSearch = async () => {
      try {
        const res = await translateIconSearchAction(query);
        if (cancelled) return;

        const tokens = res.success && res.data ? res.data : [query];
        const results = matchLucideIconsByTokens(tokens, 32);
        setMatchedIcons(results);
      } catch {
        if (!cancelled) {
          setMatchedIcons(matchLucideIconsByTokens([query], 32));
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    };

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const displayedIcons = React.useMemo(() => {
    if (!debouncedSearch.trim() && value && LUCIDE_ICONS_MAP[value]) {
      if (!matchedIcons.includes(value)) {
        return [value, ...matchedIcons.slice(0, 15)];
      }
    }
    return matchedIcons;
  }, [debouncedSearch, matchedIcons, value]);

  const handleSelectIcon = (iconName: string) => {
    if (allowDeselect && value === iconName) {
      onChange(null);
      return;
    }
    onChange(iconName);
  };

  const resolvedHighlightColor = (
    activeColor || DEFAULT_CATEGORY_COLOR
  ).toUpperCase();

  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">Ícone</span>
      )}

      {/* Campo de busca de ícone */}
      <InputGroup className="w-full h-9">
        <InputGroupAddon>
          {isTranslating ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-4 text-muted-foreground" />
          )}
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            variant === "carousel" ? "Buscar ícone..." : "Buscar ícone"
          }
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {search && (
          <InputGroupAddon align="inline-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              aria-label="Limpar busca de ícone"
            >
              <X className="size-3" />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Grade de ícones (Desktop) ou Carrossel Horizontal (Mobile) */}
      {variant === "grid" ? (
        <div className="rounded-xl border border-border/70 bg-muted/10 p-2">
          {displayedIcons.length > 0 ? (
            <div className="grid grid-cols-8 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
              {displayedIcons.map((iconName) => {
                const IconComponent = LUCIDE_ICONS_MAP[iconName];
                if (!IconComponent) return null;
                const isSelected = value === iconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelectIcon(iconName)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${resolvedHighlightColor}20`,
                            borderColor: resolvedHighlightColor,
                            color: resolvedHighlightColor,
                          }
                        : undefined
                    }
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-current shadow-2xs"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                    title={iconName}
                    aria-label={`Selecionar ícone ${iconName}`}
                    aria-pressed={isSelected}
                  >
                    <IconComponent className="size-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
              Nenhum ícone encontrado para &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      ) : (
        <div
          data-vaul-no-drag=""
          data-swipe-ignore=""
          data-base-ui-swipe-ignore=""
          style={{ touchAction: "pan-x" }}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar select-none"
        >
          {displayedIcons.length > 0 ? (
            displayedIcons.map((iconName) => {
              const IconComponent = LUCIDE_ICONS_MAP[iconName];
              if (!IconComponent) return null;
              const isSelected = value === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  data-vaul-no-drag=""
                  data-swipe-ignore=""
                  data-base-ui-swipe-ignore=""
                  onClick={() => handleSelectIcon(iconName)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${resolvedHighlightColor}20`,
                          borderColor: resolvedHighlightColor,
                          color: resolvedHighlightColor,
                        }
                      : undefined
                  }
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer focus-visible:outline-none",
                    isSelected
                      ? "border-2 shadow-xs"
                      : "border-border/70 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  title={iconName}
                  aria-label={`Selecionar ícone ${iconName}`}
                  aria-pressed={isSelected}
                >
                  <IconComponent className="size-5" />
                </button>
              );
            })
          ) : (
            <div className="flex h-12 w-full items-center justify-center text-xs text-muted-foreground">
              Nenhum ícone encontrado para &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryIconPicker;

