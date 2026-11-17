import type {
    CategoryOptionDTO,
    SubcategoryOptionDTO,
} from "@/modules/categories/models/category.schema";

/** Opções de categoria/subcategoria do formulário de recorrência. */
export interface RecurrenceCategoryOptions {
    categories: CategoryOptionDTO[];
    subcategories: SubcategoryOptionDTO[];
}
