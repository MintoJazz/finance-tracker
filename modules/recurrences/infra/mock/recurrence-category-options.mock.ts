import type { RecurrenceCategoryOptions } from "@/modules/recurrences/models/schemas/recurrence-form-options.schema";
import { MOCK_FULL_CATEGORIES } from "@/modules/categories/infra/mock/categories.mock";

export type { RecurrenceCategoryOptions };

/**
 * Opções de categoria/subcategoria do formulário de recorrência (mock).
 * Usado só como fallback quando a leitura real falha (os ids do mock não existem no banco).
 */
export const MOCK_RECURRENCE_CATEGORY_OPTIONS: RecurrenceCategoryOptions = {
    categories: MOCK_FULL_CATEGORIES.filter((c) => c.parentId === null).map(
        ({ id, name, icon, color }) => ({ id, name, icon, color })
    ),
    subcategories: MOCK_FULL_CATEGORIES.flatMap((parent) =>
        parent.children.map(({ id, name, icon, color }) => ({
            id,
            parentId: parent.id,
            parentName: parent.name,
            name,
            icon,
            color,
        }))
    ),
};
