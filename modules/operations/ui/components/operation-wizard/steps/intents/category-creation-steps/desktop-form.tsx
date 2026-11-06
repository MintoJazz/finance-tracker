"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CategoryColorPicker } from "@/modules/categories/ui/components/category-color-picker"
import { CategoryIconPicker } from "@/modules/categories/ui/components/category-icon-picker"
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon"
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "@/modules/categories/models/category.schema"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"
import { useWizard } from "@/components/wizard"
import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"

export interface CategoryCreationDesktopFormProps {
  sliceKey: "CREATE_CATEGORY" | "CREATE_SUBCATEGORY"
  entityLabel: "Categoria" | "Subcategoria"
}

export function CategoryCreationDesktopForm({
  sliceKey,
  entityLabel,
}: CategoryCreationDesktopFormProps) {
  const { draft, lookups, updateDraft } = useOperationWizard()
  const { update } = useWizard<OperationDraft>()

  const isSubcategory = sliceKey === "CREATE_SUBCATEGORY"

  // Parent Category Name para subcategorias
  const parentName = React.useMemo(() => {
    if (!isSubcategory) return null
    if (draft.CREATE_CATEGORY?.name?.trim()) {
      return draft.CREATE_CATEGORY.name.trim()
    }
    const found = lookups.categories.find(
      (c) => c.id === draft.base?.categoryId
    )
    return found?.name || "Categoria Base"
  }, [isSubcategory, draft.CREATE_CATEGORY?.name, draft.base?.categoryId, lookups.categories])

  const nameVal = draft[sliceKey]?.name ?? ""
  const colorVal =
    draft[sliceKey]?.color ??
    (isSubcategory ? draft.CREATE_CATEGORY?.color : undefined) ??
    DEFAULT_CATEGORY_COLOR
  const iconVal = draft[sliceKey]?.icon ?? DEFAULT_CATEGORY_ICON

  const activeColor = (colorVal || DEFAULT_CATEGORY_COLOR).toUpperCase()
  const activeIcon = iconVal || DEFAULT_CATEGORY_ICON

  const placeholderName = isSubcategory
    ? "Nome da subcategoria"
    : "Nome da categoria"
  const subtitle = isSubcategory
    ? `Subcategoria • ${parentName}`
    : "Categoria raiz"

  // Inicializa cor e ícone caso ainda não existam no draft
  React.useEffect(() => {
    const current = draft[sliceKey]
    if (!current?.color || !current?.icon) {
      const patch = {
        color: current?.color ?? activeColor,
        icon: current?.icon ?? activeIcon,
      }
      updateDraft({
        [sliceKey]: patch,
      })
      update({
        [sliceKey]: patch,
      })
    }
  }, [sliceKey, draft, activeColor, activeIcon, updateDraft, update])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value
    updateDraft({
      [sliceKey]: {
        name: nextVal,
      },
    })
    update({
      [sliceKey]: {
        name: nextVal,
      },
    })
  }

  const handleColorChange = (newColor: string | null) => {
    const resolvedColor = newColor ?? DEFAULT_CATEGORY_COLOR
    updateDraft({
      [sliceKey]: {
        color: resolvedColor,
      },
      ...(sliceKey === "CREATE_CATEGORY" && !draft.CREATE_SUBCATEGORY?.color
        ? {
            CREATE_SUBCATEGORY: {
              color: resolvedColor,
            },
          }
        : {}),
    })
    update({
      [sliceKey]: {
        color: resolvedColor,
      },
    })
  }

  const handleIconChange = (newIcon: string | null) => {
    const resolvedIcon = newIcon ?? DEFAULT_CATEGORY_ICON
    updateDraft({
      [sliceKey]: {
        icon: resolvedIcon,
      },
    })
    update({
      [sliceKey]: {
        icon: resolvedIcon,
      },
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[216px_1fr] gap-5 items-stretch py-1">
      {/* Coluna Esquerda: Preview Card ao vivo + Input de Nome */}
      <div className="flex flex-col gap-3.5 justify-between">
        {/* Preview Card */}
        <div
          style={{
            backgroundColor: `${activeColor}14`,
            borderColor: `${activeColor}30`,
          }}
          className="flex flex-1 min-h-48 flex-col items-center justify-center rounded-xl border p-5 text-center transition-colors select-none"
        >
          <div
            style={{
              backgroundColor: `${activeColor}1F`,
              borderColor: `${activeColor}66`,
              color: activeColor,
            }}
            className="mb-3.5 flex size-13 items-center justify-center rounded-2xl border transition-colors shadow-2xs"
          >
            <CategoryIcon name={activeIcon} className="size-6" />
          </div>

          <p
            className={cn(
              "max-w-full truncate text-base font-semibold tracking-tight transition-colors",
              nameVal ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {nameVal || placeholderName}
          </p>

          <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </div>

        {/* Input de Nome */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-foreground">
            {isSubcategory ? "Nome da subcategoria" : "Nome da categoria"}
          </Label>
          <Input
            value={nameVal}
            onChange={handleNameChange}
            placeholder={
              isSubcategory
                ? "Ex: Padaria, Feira, Streaming..."
                : "Ex: Alimentação, Lazer, Saúde..."
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {/* Coluna Direita: Seletor de Cor + Seletor de Ícone */}
      <div className="flex flex-col gap-4 justify-between min-w-0">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-foreground">
            Cor de identificação
          </Label>
          <CategoryColorPicker
            value={colorVal}
            onChange={handleColorChange}
            variant="grid"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-foreground">Ícone</Label>
          <CategoryIconPicker
            value={iconVal}
            onChange={handleIconChange}
            activeColor={activeColor}
            variant="grid"
            showLabel={false}
          />
        </div>
      </div>
    </div>
  )
}
