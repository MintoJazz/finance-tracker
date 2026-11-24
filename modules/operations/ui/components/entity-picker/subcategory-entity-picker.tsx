"use client"

import * as React from "react"
import { EntityPicker } from "./index"
import type {
  CategoryEntityOption,
  SubcategoryEntityOption,
} from "./category-entity-picker"
import type { EntityPickerItem, EntityPickerSingleProps } from "./types"

export interface SubcategoryEntityPickerProps
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
  subcategories: readonly SubcategoryEntityOption[]
  /** Quando informada, filtra as subcategorias pela categoria pai e herda aparência como fallback. */
  parentCategory?: CategoryEntityOption | null
}

/** Seletor reutilizável de subcategorias baseado no `<EntityPicker />`. */
export function SubcategoryEntityPicker({
  subcategories,
  parentCategory,
  searchPlaceholder,
  emptyMessage = "Nenhuma subcategoria encontrada",
  ...pickerProps
}: SubcategoryEntityPickerProps) {
  const items = React.useMemo<EntityPickerItem<number>[]>(() => {
    const filtered = parentCategory
      ? subcategories.filter((s) => s.parentId === parentCategory.id)
      : subcategories

    return filtered.map((sub) => {
      const parentName = parentCategory?.name ?? sub.parentName ?? "Categoria"
      return {
        id: sub.id,
        title: sub.name,
        titleText: sub.name,
        subtitle: `Subcategoria de ${parentName}`,
        icon: sub.icon ?? parentCategory?.icon ?? "Tag",
        color: sub.color ?? parentCategory?.color,
        keywords: [sub.name, parentName],
      }
    })
  }, [subcategories, parentCategory])

  return (
    <EntityPicker<number>
      {...pickerProps}
      items={items}
      searchPlaceholder={
        searchPlaceholder ??
        (parentCategory
          ? `Buscar subcategoria em ${parentCategory.name}...`
          : "Buscar subcategoria...")
      }
      emptyMessage={emptyMessage}
    />
  )
}
