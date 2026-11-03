import { z } from "zod";
import type { Page } from "@/types/pagination.types";

/**
 * Representa a aparência visual de uma categoria, espelhando o modelo BalanceAppearance do Prisma.
 */
export const CategoryAppearanceSchema = z.object({
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export type CategoryAppearance = z.infer<typeof CategoryAppearanceSchema>;

export interface CategoryItem {
  id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
  appearance?: CategoryAppearance;
  amount: number; // em centavos (ex: 184200 = R$ 1.842,00)
  parentId?: number | null;
  childrenCount: number; // quantidade de subcategorias filhas
  children: CategoryItem[]; // array de filhas (vazio na carga inicial, injetado ao expandir)
}

export const CategoryItemSchema: z.ZodType<CategoryItem> = z.lazy(() =>
  z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    appearance: CategoryAppearanceSchema.optional(),
    amount: z.number().int(),
    parentId: z.number().int().positive().nullable().optional(),
    childrenCount: z.number().int().nonnegative().default(0),
    children: z.array(CategoryItemSchema).default([]),
  })
);

export interface CategoryTreeDTO {
  period: {
    from: Date;
    to: Date;
  };
  totalAmount: number;
  page: Page<CategoryItem>;
  items?: CategoryItem[];
}

export const CategoryTreeFilterSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  search: z.string().optional(),
  pageRequest: z
    .object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
    })
    .optional(),
});

export type CategoryTreeFilter = z.infer<typeof CategoryTreeFilterSchema>;

export const DEFAULT_CATEGORY_COLOR = "#06B6D4";
export const DEFAULT_CATEGORY_ICON = "Tag";

export const CategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome da categoria é obrigatório")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export const CreateCategorySchema = CategoryFormSchema;
export type CreateCategoryFormValues = z.infer<typeof CreateCategorySchema>;

export const ArchivedSubcategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

export type ArchivedSubcategory = z.infer<typeof ArchivedSubcategorySchema>;

export const ArchivedCategoryGroupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  archived: z.boolean(),
  children: z.array(ArchivedSubcategorySchema),
});

export type ArchivedCategoryGroup = z.infer<typeof ArchivedCategoryGroupSchema>;

/**
 * Busca recursivamente uma categoria pelo ID na árvore de categorias.
 */
export function findCategoryInTree(items: CategoryItem[], id: number): CategoryItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children && item.children.length > 0) {
      const found = findCategoryInTree(item.children, id);
      if (found) return found;
    }
  }
  return null;
}
