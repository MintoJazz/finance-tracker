"use client"

import * as React from "react"
import { EntityPicker } from "./index"
import type { EntityPickerItem, EntityPickerSingleProps } from "./types"

export interface CategoryEntityOption {
  id: number
  name: string
  icon?: string | null
  color?: string | null
}

export interface SubcategoryEntityOption {
  id: number
  parentId: number
  parentName?: string
  name: string
  icon?: string | null
  color?: string | null
}

export interface CategoryEntityPickerProps
  extends Pick<
    EntityPickerSingleProps<number>,
    | "value"
    | "onChange"
    | "variant"
    | "indicator"
    | "searchPlaceholder"
    | "emptyMessage"
    | "listClassName"
    | "className"
    | "onCreate"
    | "createLabel"
  > {
  categories: readonly CategoryEntityOption[]
  subcategories?: readonly SubcategoryEntityOption[]
}

/** Seletor reutilizável de categorias baseado no `<EntityPicker />`. */
export function CategoryEntityPicker({
  categories,
  subcategories = [],
  searchPlaceholder = "Buscar categoria...",
  emptyMessage = "Nenhuma categoria encontrada",
  ...pickerProps
}: CategoryEntityPickerProps) {
  const items = React.useMemo<EntityPickerItem<number>[]>(
    () =>
      categories.map((cat) => {
        const subNames = subcategories
          .filter((s) => s.parentId === cat.id)
          .map((s) => s.name)
        const subSummary =
          subNames.length > 0 ? ` • ${subNames.join(", ")}` : ""

        return {
          id: cat.id,
          title: cat.name,
          titleText: cat.name,
          subtitle: subSummary ? `Subcategorias${subSummary}` : "Categoria raiz",
          icon: cat.icon ?? "Tag",
          color: cat.color,
          keywords: [cat.name, ...subNames],
        }
      }),
    [categories, subcategories]
  )

  return (
    <EntityPicker<number>
      {...pickerProps}
      items={items}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  )
}
