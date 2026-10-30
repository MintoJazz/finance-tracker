import { z } from "zod";

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
  children?: CategoryItem[];
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
    children: z.array(CategoryItemSchema).optional(),
  })
);

export const CategoryTreeDTOSchema = z.object({
  period: z.object({
    from: z.date(),
    to: z.date(),
  }),
  totalAmount: z.number().int(),
  items: z.array(CategoryItemSchema),
});

export type CategoryTreeDTO = z.infer<typeof CategoryTreeDTOSchema>;

export const CategoryTreeFilterSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  search: z.string().optional(),
});

export type CategoryTreeFilter = z.infer<typeof CategoryTreeFilterSchema>;

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
