"use client"

import * as React from "react"
import { Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import {
  Widget,
  WidgetCheckbox,
  WidgetContent,
  WidgetExtra,
  WidgetIcon,
  WidgetItem,
  WidgetList,
  WidgetSubtitle,
  WidgetTitle,
} from "@/components/form/widget"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon"
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge"
import { STATUS_BADGE_CLASSES } from "@/modules/cycles/ui/components/cycle-summary/labels"
import type { EntityPickerProps } from "./types"

/**
 * Seletor vertical de entidades baseado no compound component `<Widget />`,
 * com barra de busca no topo e suporte a seleção única ou múltipla.
 */
export function EntityPicker<TId extends string | number = number>(
  props: EntityPickerProps<TId>
) {
  const {
    items,
    searchable = true,
    searchPlaceholder = "Buscar...",
    navigator,
    emptyMessage = "Nenhum item encontrado",
    loading = false,
    listClassName,
    className,
    hideIcon
  } = props

  const [search, setSearch] = React.useState("")

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) => {
      const titleStr =
        item.titleText ??
        (typeof item.title === "string" ? item.title : "")
      const inTitle = titleStr.toLowerCase().includes(query)
      const inSubtitle = item.subtitle?.toLowerCase().includes(query) ?? false
      const inKeywords =
        item.keywords?.some((k) => k.toLowerCase().includes(query)) ?? false
      return inTitle || inSubtitle || inKeywords
    })
  }, [items, search])

  const renderListItems = () => {
    const indicator = props.indicator ?? (props.multiple ? "checkbox" : "checkbox")
    if (loading) {
      return (
        <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground animate-pulse">
          Carregando...
        </div>
      )
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return (
      <WidgetList
        data-vaul-no-drag=""
        className={cn(
          "divide-y divide-border/50 rounded-xl border border-border/70 bg-card/40 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar",
          listClassName ?? "max-h-[148px] sm:max-h-[160px]"
        )}
      >
        {filteredItems.map((item) => {
          const theme = getCategoryTheme(item.color)

          return (
            <WidgetItem
              key={String(item.id)}
              value={item.id}
              disabled={item.disabled}
              className="px-3 py-2 gap-3 transition-colors data-[state=checked]:bg-primary/10 data-[state=checked]:border-l-2 data-[state=checked]:border-l-primary"
            >
              {!hideIcon && <WidgetIcon
                icon={<CategoryIcon name={item.icon} className="size-4 shrink-0" />}
                style={theme.style}
                className={cn(
                  "size-8 rounded-lg shrink-0 transition-all border",
                  theme.palette
                    ? cn(
                        theme.palette.bg,
                        theme.palette.text,
                        theme.palette.border ?? "border-border/40",
                        "group-hover/widget-item:text-current"
                      )
                    : "border-border/40 bg-muted/70 text-foreground",
                  "group-data-[state=checked]/widget-item:border-primary/60 group-data-[state=checked]/widget-item:ring-2 group-data-[state=checked]/widget-item:ring-primary/25"
                )}
              />}
              <WidgetContent className="gap-0">
                <WidgetTitle className="text-xs sm:text-sm font-semibold group-data-[state=checked]/widget-item:text-primary transition-colors">
                  {item.title}
                </WidgetTitle>
                {item.subtitle && (
                  <WidgetSubtitle className="text-[11px] leading-tight">
                    {item.subtitle}
                  </WidgetSubtitle>
                )}
              </WidgetContent>
              {item.extra && <WidgetExtra>{item.extra}</WidgetExtra>}
              {indicator === "checkbox" && <WidgetCheckbox />}
              {indicator === "chevron" && (
                <div className="shrink-0 flex items-center justify-center ml-1">
                  <div className="hidden group-data-[state=checked]/widget-item:flex size-5 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-xs">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60 shrink-0 group-hover/widget-item:text-foreground transition-transform group-hover/widget-item:translate-x-0.5 group-data-[state=checked]/widget-item:hidden" />
                </div>
              )}
              {indicator === "radio" && (
                <div className="size-4 rounded-full border border-primary/60 flex items-center justify-center shrink-0">
                  <div className="size-2 rounded-full bg-primary opacity-0 group-data-[state=checked]/widget-item:opacity-100 transition-opacity" />
                </div>
              )}
            </WidgetItem>
          )
        })}
      </WidgetList>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2.5 w-full min-w-0 overflow-x-hidden", className)}>
      {navigator && (
        <div className="flex items-center justify-between gap-2 px-1.5 rounded-lg border border-border/80 bg-card/60 shadow-2xs h-9 w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={navigator.canPrev === false || navigator.isLoading}
            onClick={navigator.onPrev}
            aria-label={navigator.prevLabel ?? "Anterior"}
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            {navigator.isLoading ? (
              <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
            ) : (
              <>
                <span className="truncate text-xs sm:text-sm font-semibold text-foreground tabular-nums">
                  {navigator.title}
                </span>
                {navigator.badge && (
                  <span
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none transition-colors",
                      STATUS_BADGE_CLASSES[navigator.badge.tone ?? "neutral"] ??
                        STATUS_BADGE_CLASSES.neutral
                    )}
                  >
                    {navigator.badge.label}
                  </span>
                )}
              </>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={navigator.canNext === false || navigator.isLoading}
            onClick={navigator.onNext}
            aria-label={navigator.nextLabel ?? "Próximo"}
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {searchable && (
        <InputGroup className="w-full h-9">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
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
                aria-label="Limpar busca"
              >
                <X className="size-3" />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
      )}

      {props.multiple ? (
        <Widget<TId>
          multiple
          value={props.value ? [...props.value] : []}
          onChange={(nextIds) => {
            const nextItems = items.filter((it) => nextIds.includes(it.id))
            props.onChange(nextIds, nextItems)
          }}
        >
          {renderListItems()}
        </Widget>
      ) : (
        <Widget<TId>
          value={props.value ?? null}
          allowDeselect={props.allowDeselect}
          onChange={(nextId) => {
            const found =
              nextId != null
                ? items.find((it) => it.id === nextId)
                : undefined
            props.onChange(nextId, found)
          }}
        >
          {renderListItems()}
        </Widget>
      )}
    </div>
  )
}

export * from "./types"
