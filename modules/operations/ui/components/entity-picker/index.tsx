"use client"

import * as React from "react"
import * as LucideNamespace from "lucide-react"
import { CircleDot, Search, X, type LucideIcon } from "lucide-react"
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
import type { EntityPickerProps } from "./types"

type IconComponentType = LucideIcon

const LUCIDE_ICONS_MAP: Record<string, IconComponentType> =
  (
    LucideNamespace as unknown as {
      icons?: Record<string, IconComponentType>
    }
  ).icons ?? {}

function resolveLucideIcon(iconName?: string | null): IconComponentType {
  if (!iconName) return CircleDot
  if (LUCIDE_ICONS_MAP[iconName]) return LUCIDE_ICONS_MAP[iconName]
  const pascal = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  return LUCIDE_ICONS_MAP[pascal] ?? CircleDot
}

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
    emptyMessage = "Nenhum item encontrado",
    className,
  } = props

  const [search, setSearch] = React.useState("")

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(query)
      const inSubtitle = item.subtitle?.toLowerCase().includes(query) ?? false
      const inKeywords =
        item.keywords?.some((k) => k.toLowerCase().includes(query)) ?? false
      return inTitle || inSubtitle || inKeywords
    })
  }, [items, search])

  const renderListItems = () => {
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
        className="divide-y divide-border/50 rounded-xl border border-border/70 bg-card/40 max-h-[148px] sm:max-h-[160px] overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
      >
        {filteredItems.map((item) => {
          const IconComp = resolveLucideIcon(item.icon)
          const accent = item.color ?? undefined

          return (
            <WidgetItem
              key={String(item.id)}
              value={item.id}
              className="px-2.5 py-1.5 gap-2.5"
            >
              <WidgetIcon
                icon={<IconComp className="size-3.5 shrink-0" />}
                className="size-8 rounded-lg"
                style={
                  accent
                    ? {
                        backgroundColor: `${accent}18`,
                        color: accent,
                        borderColor: `${accent}35`,
                      }
                    : undefined
                }
              />
              <WidgetContent className="gap-0">
                <WidgetTitle className="text-xs sm:text-sm font-semibold">
                  {item.title}
                </WidgetTitle>
                {item.subtitle && (
                  <WidgetSubtitle className="text-[11px] leading-tight">
                    {item.subtitle}
                  </WidgetSubtitle>
                )}
              </WidgetContent>
              {item.extra && <WidgetExtra>{item.extra}</WidgetExtra>}
              <WidgetCheckbox />
            </WidgetItem>
          )
        })}
      </WidgetList>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2.5 w-full min-w-0 overflow-x-hidden", className)}>
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
