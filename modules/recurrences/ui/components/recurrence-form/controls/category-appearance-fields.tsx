"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CategoryColorPicker } from "@/modules/categories/ui/components/category-color-picker";
import { CategoryIconPicker } from "@/modules/categories/ui/components/category-icon-picker";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import {
    DEFAULT_CATEGORY_COLOR,
    DEFAULT_CATEGORY_ICON,
} from "@/modules/categories/models/category.schema";
import type { RecurrenceCategoryDraft } from "@/modules/recurrences/models/schemas/recurrence-form.schema";

interface Props {
    value?: RecurrenceCategoryDraft | null;
    onChange: (value: RecurrenceCategoryDraft) => void;
    entity: "category" | "subcategory";
    /** Nome da categoria pai (subcategoria) */
    parentName?: string | null;
    nameError?: string;
}

/**
 * Nome, cor e ícone de uma categoria/subcategoria nova, com prévia ao vivo.
 * Layout inspirado em operations/.../category-creation-steps/desktop-form.tsx.
 */
export function CategoryAppearanceFields({
    value,
    onChange,
    entity,
    parentName,
    nameError,
}: Props) {
    const isSub = entity === "subcategory";
    const name = value?.name ?? "";
    const color = (value?.color || DEFAULT_CATEGORY_COLOR).toUpperCase();
    const icon = value?.icon || DEFAULT_CATEGORY_ICON;

    const patch = (p: Partial<RecurrenceCategoryDraft>) =>
        onChange({ name, color, icon, ...p });

    const preview = (
        <div
            style={{ backgroundColor: `${color}14`, borderColor: `${color}30` }}
            className="flex flex-1 min-h-40 flex-col items-center justify-center rounded-xl border p-5 text-center transition-colors select-none"
        >
            <div
                style={{ backgroundColor: `${color}1F`, borderColor: `${color}66`, color }}
                className="mb-3 flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs"
            >
                <CategoryIcon name={icon} className="size-6" />
            </div>
            <div className="min-w-0">
                <p
                    className={cn(
                        "truncate text-sm font-semibold",
                        name ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    {name || (isSub ? "Nome da subcategoria" : "Nome da categoria")}
                </p>
                <span className="block truncate text-xs text-muted-foreground">
                    {isSub ? `Subcategoria • ${parentName || "Categoria"}` : "Categoria raiz"}
                </span>
            </div>
        </div>
    );

    const nameField = (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-foreground">
                {isSub ? "Nome da subcategoria" : "Nome da categoria"}
            </Label>
            <Input
                value={name}
                onChange={(e) => patch({ name: e.target.value })}
                aria-invalid={!!nameError}
                placeholder={isSub ? "Ex: Aluguel, Condomínio..." : "Ex: Moradia, Assinaturas..."}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-9 text-sm"
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
    );

    const pickers = (
        <>
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Cor de identificação</Label>
                <CategoryColorPicker
                    value={color}
                    onChange={(c) => patch({ color: c ?? DEFAULT_CATEGORY_COLOR })}
                    variant="grid"
                    allowDeselect={false}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Ícone</Label>
                <CategoryIconPicker
                    value={icon}
                    onChange={(i) => patch({ icon: i ?? DEFAULT_CATEGORY_ICON })}
                    activeColor={color}
                    variant="grid"
                    allowDeselect={false}
                    showLabel={false}
                />
            </div>
        </>
    );

    return (
        <div className="grid grid-cols-1 gap-5 py-1 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col justify-between gap-3.5">
                {preview}
                {nameField}
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-4">{pickers}</div>
        </div>
    );
}
