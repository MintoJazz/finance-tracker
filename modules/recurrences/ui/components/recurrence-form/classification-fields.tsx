"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import { useWizard } from "@/components/wizard";
import type { FormFieldItem, FormFieldRow } from "@/types/form.types";
import type {
    RecurrenceCategoryDraft,
    RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { CategoryAppearanceFields } from "./controls/category-appearance-fields";
import {
    CategoryComboboxControl,
    CategoryPickerControl,
    SubcategoryComboboxControl,
    SubcategoryPickerControl,
} from "./controls/classification-controls";

type Item = FormFieldItem<RecurrenceFormValues>;
type Row = FormFieldRow<RecurrenceFormValues>;

/** Desktop: linha "Categoria | Subcategoria" com comboboxes. */
export function createClassificationRow(options: RecurrenceCategoryOptions): Row {
    return {
        className: "[&:has(>:nth-child(2))]:grid-cols-2",
        row: [
            {
                name: "categoryId",
                label: "Categoria",
                children: <CategoryComboboxControl options={options} />,
            },
            {
                name: "subcategoryId",
                label: "Subcategoria",
                children: <SubcategoryComboboxControl options={options} />,
            },
        ],
    };
}

/** Mobile: seletor de categoria (filtro / pai da nova subcategoria). */
export function createCategoryPickerField(options: RecurrenceCategoryOptions): Item {
    return {
        name: "categoryId",
        children: <CategoryPickerControl options={options} />,
    };
}

/** Mobile: seletor de subcategoria filtrado pela categoria. */
export function createSubcategoryPickerField(options: RecurrenceCategoryOptions): Item {
    return {
        name: "subcategoryId",
        children: <SubcategoryPickerControl options={options} />,
    };
}

function draftNameError(error: unknown): string | undefined {
    const e = error as { name?: { message?: string }; message?: string } | undefined;
    return e?.name?.message ?? e?.message;
}

function NewSubcategoryParent({
    options,
    children,
}: {
    options: RecurrenceCategoryOptions;
    children: (parentName: string | null) => React.ReactNode;
}) {
    const [categoryId, newCategory] = useWatch<
        RecurrenceFormValues,
        ["categoryId", "newCategory"]
    >({ name: ["categoryId", "newCategory"] });
    const parentName =
        newCategory?.name ||
        options.categories.find((c) => c.id === categoryId)?.name ||
        null;
    return <>{children(parentName)}</>;
}

/**
 * Categoria nova: a subcategoria nova nasceu com a cor dela, então acompanha
 * as trocas de cor enquanto o usuário não tiver escolhido outra.
 */
function NewCategoryFields({
    value,
    onChange,
    nameError,
}: {
    value: RecurrenceCategoryDraft | null;
    onChange: (value: RecurrenceCategoryDraft) => void;
    nameError?: string;
}) {
    const { data, update } = useWizard<RecurrenceFormValues>();
    return (
        <CategoryAppearanceFields
            entity="category"
            value={value}
            nameError={nameError}
            onChange={(next) => {
                const sub = data.newSubcategory;
                if (sub && next.color !== value?.color && sub.color === value?.color) {
                    update({ newSubcategory: { ...sub, color: next.color } });
                }
                onChange(next);
            }}
        />
    );
}

/** Passo de criação de categoria: nome, cor e ícone. */
export function createNewCategoryField(): Item {
    return {
        name: "newCategory",
        render: ({ field, fieldState }) => (
            <NewCategoryFields
                value={field.value as RecurrenceCategoryDraft | null}
                onChange={field.onChange}
                nameError={draftNameError(fieldState.error)}
            />
        ),
    };
}

/** Passo de criação de subcategoria: nome, cor e ícone (pai exibido na prévia). */
export function createNewSubcategoryField(
    options: RecurrenceCategoryOptions
): Item {
    return {
        name: "newSubcategory",
        render: ({ field, fieldState }) => (
            <NewSubcategoryParent options={options}>
                {(parentName) => (
                    <CategoryAppearanceFields
                        entity="subcategory"
                        parentName={parentName}
                        value={field.value as RecurrenceCategoryDraft | null}
                        onChange={field.onChange}
                        nameError={draftNameError(fieldState.error)}
                    />
                )}
            </NewSubcategoryParent>
        ),
    };
}
