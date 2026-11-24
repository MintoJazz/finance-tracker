"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import {
    CategoryEntityPicker,
    SubcategoryEntityPicker,
} from "@/modules/operations/ui/components/entity-picker";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { useClassificationPatch } from "@/modules/recurrences/ui/hooks/use-classification-patch";
import {
    clearClassificationPatch,
    clearSubcategoryPatch,
    createCategoryPatch,
    createSubcategoryPatch,
    selectCategoryPatch,
    selectSubcategoryPatch,
} from "@/modules/recurrences/ui/utils/recurrence-classification.utils";
import { EntityCombobox, type EntityComboboxOption } from "./entity-combobox";

interface ControlProps {
    id?: string;
    "aria-invalid"?: boolean;
    options: RecurrenceCategoryOptions;
}

function useClassificationValues() {
    const [categoryId, newCategory, subcategoryId, newSubcategory] = useWatch<
        RecurrenceFormValues,
        ["categoryId", "newCategory", "subcategoryId", "newSubcategory"]
    >({ name: ["categoryId", "newCategory", "subcategoryId", "newSubcategory"] });
    return { categoryId, newCategory, subcategoryId, newSubcategory };
}

function useSubcategoryList(options: RecurrenceCategoryOptions) {
    const { categoryId, newCategory } = useClassificationValues();
    return React.useMemo(() => {
        if (newCategory) return [];
        if (categoryId != null)
            return options.subcategories.filter((s) => s.parentId === categoryId);
        return options.subcategories;
    }, [options.subcategories, categoryId, newCategory]);
}

/* ------------------------------ Desktop ------------------------------ */

export function CategoryComboboxControl({ options, ...a11y }: ControlProps) {
    const { apply, current } = useClassificationPatch();
    const { categoryId, newCategory } = useClassificationValues();

    return (
        <EntityCombobox
            {...a11y}
            options={options.categories}
            value={categoryId}
            draft={newCategory}
            placeholder="Buscar ou criar categoria"
            emptyMessage="Nenhuma categoria encontrada"
            onSelect={(o) => apply(selectCategoryPatch(o.id, current()))}
            onCreate={(name) => apply(createCategoryPatch(name))}
            onClear={() => apply(clearClassificationPatch())}
        />
    );
}

export function SubcategoryComboboxControl({ options, ...a11y }: ControlProps) {
    const { apply, current } = useClassificationPatch();
    const { categoryId, newCategory, subcategoryId, newSubcategory } =
        useClassificationValues();
    const list = useSubcategoryList(options);
    const hasParent = categoryId != null || newCategory != null;

    const comboOptions = React.useMemo<EntityComboboxOption[]>(
        () =>
            list.map((s) => ({
                id: s.id,
                name: s.name,
                icon: s.icon,
                color: s.color,
                subtitle: hasParent ? undefined : s.parentName,
            })),
        [list, hasParent]
    );

    // Rascunho sem nome (categoria nova recém-criada) ainda não conta como selecionado
    const draft = newSubcategory?.name ? newSubcategory : null;

    return (
        <EntityCombobox
            {...a11y}
            options={comboOptions}
            value={subcategoryId}
            draft={draft}
            placeholder={
                newCategory ? "Digite o nome da nova subcategoria" : "Buscar ou criar subcategoria"
            }
            emptyMessage={
                newCategory
                    ? "Digite para criar a subcategoria"
                    : "Nenhuma subcategoria encontrada"
            }
            createDisabledReason={
                hasParent ? undefined : "Selecione uma categoria para criar a subcategoria"
            }
            onSelect={(o) => {
                const sub = options.subcategories.find((s) => s.id === o.id);
                if (sub) apply(selectSubcategoryPatch(sub));
            }}
            onCreate={(name) => apply(createSubcategoryPatch(name, current(), options))}
            onClear={() => apply(clearSubcategoryPatch(current()))}
        />
    );
}

/* ------------------------------ Mobile ------------------------------ */

export function CategoryPickerControl({ options }: ControlProps) {
    const { apply, current } = useClassificationPatch();
    const { categoryId, newCategory } = useClassificationValues();

    return (
        <div className="flex flex-col gap-2">
            {newCategory && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                    Nova categoria: <strong>{newCategory.name}</strong>
                </div>
            )}
            <CategoryEntityPicker
                categories={options.categories}
                subcategories={options.subcategories}
                value={newCategory ? null : categoryId}
                onChange={(id) =>
                    apply(id == null ? clearClassificationPatch() : selectCategoryPatch(id, current()))
                }
                searchPlaceholder="Buscar ou criar categoria..."
                listClassName="max-h-[240px]"
                onCreate={(name) => apply(createCategoryPatch(name))}
            />
        </div>
    );
}

export function SubcategoryPickerControl({ options }: ControlProps) {
    const { apply, current } = useClassificationPatch();
    const { categoryId, newCategory, subcategoryId, newSubcategory } =
        useClassificationValues();
    const list = useSubcategoryList(options);
    const parentCategory = React.useMemo(
        () =>
            newCategory || categoryId == null
                ? null
                : (options.categories.find((c) => c.id === categoryId) ?? null),
        [options.categories, categoryId, newCategory]
    );

    return (
        <div className="flex flex-col gap-2">
            {newSubcategory?.name && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                    Nova subcategoria: <strong>{newSubcategory.name}</strong>
                </div>
            )}
            <SubcategoryEntityPicker
                subcategories={list}
                parentCategory={parentCategory}
                value={newSubcategory ? null : subcategoryId}
                onChange={(id) => {
                    const sub = options.subcategories.find((s) => s.id === id);
                    apply(sub ? selectSubcategoryPatch(sub) : clearSubcategoryPatch(current()));
                }}
                searchPlaceholder="Buscar ou criar subcategoria..."
                emptyMessage="Nenhuma subcategoria. Digite para criar."
                listClassName="max-h-[240px]"
                onCreate={(name) => apply(createSubcategoryPatch(name, current(), options))}
            />
        </div>
    );
}
