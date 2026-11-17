import {
    createCategoryDraft,
    type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { SubcategoryOptionDTO } from "@/modules/categories/models/category.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";

export type ClassificationPatch = Pick<
    RecurrenceFormValues,
    "categoryId" | "newCategory" | "subcategoryId" | "newSubcategory"
>;

type Current = Partial<ClassificationPatch>;

/** Categoria existente: serve de filtro. Troca de categoria descarta a subcategoria. */
export function selectCategoryPatch(id: number, current: Current): ClassificationPatch {
    const sameCategory = current.categoryId === id && current.newCategory == null;
    return {
        categoryId: id,
        newCategory: null,
        subcategoryId: sameCategory ? (current.subcategoryId ?? null) : null,
        newSubcategory: sameCategory ? (current.newSubcategory ?? null) : null,
    };
}

/** Categoria nova obriga criar a subcategoria (que nasce sem nome, herdando a cor). */
export function createCategoryPatch(name: string): ClassificationPatch {
    const newCategory = createCategoryDraft(name);
    return {
        categoryId: null,
        newCategory,
        subcategoryId: null,
        newSubcategory: createCategoryDraft("", newCategory.color),
    };
}

export function clearClassificationPatch(): ClassificationPatch {
    return {
        categoryId: null,
        newCategory: null,
        subcategoryId: null,
        newSubcategory: null,
    };
}

/** Subcategoria existente: o pai vira a categoria selecionada. */
export function selectSubcategoryPatch(sub: SubcategoryOptionDTO): ClassificationPatch {
    return {
        categoryId: sub.parentId,
        newCategory: null,
        subcategoryId: sub.id,
        newSubcategory: null,
    };
}

export function createSubcategoryPatch(
    name: string,
    current: Current,
    options: RecurrenceCategoryOptions
): Partial<ClassificationPatch> {
    const parentColor =
        current.newCategory?.color ??
        options.categories.find((c) => c.id === current.categoryId)?.color;
    return {
        subcategoryId: null,
        newSubcategory: createCategoryDraft(name, parentColor),
    };
}

export function clearSubcategoryPatch(current: Current): Partial<ClassificationPatch> {
    // Com categoria nova a subcategoria nova é obrigatória: mantém o rascunho, só zera o nome.
    if (current.newCategory) {
        return {
            subcategoryId: null,
            newSubcategory: createCategoryDraft("", current.newCategory.color),
        };
    }
    return { subcategoryId: null, newSubcategory: null };
}

/** Nomes resolvidos para exibição (revisão, prévias). */
export function describeClassification(
    data: Partial<RecurrenceFormValues>,
    options: RecurrenceCategoryOptions
): { category: string | null; subcategory: string | null; isNewCategory: boolean; isNewSubcategory: boolean } {
    const category =
        data.newCategory?.name ||
        options.categories.find((c) => c.id === data.categoryId)?.name ||
        null;
    const subcategory =
        data.newSubcategory?.name ||
        options.subcategories.find((s) => s.id === data.subcategoryId)?.name ||
        null;
    return {
        category,
        subcategory,
        isNewCategory: data.newCategory != null,
        isNewSubcategory: data.newSubcategory != null,
    };
}
