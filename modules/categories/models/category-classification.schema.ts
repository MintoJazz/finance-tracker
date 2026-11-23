import z from "zod";
import {
  CategoryFormSchema,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "./category.schema";

/**
 * Classificação (categoria + subcategoria, existentes ou novas) usada por quem precisa
 * categorizar algo: o vínculo real é a subcategoria; a categoria só filtra a lista ou serve
 * de pai quando a subcategoria é nova.
 */

/** Categoria/subcategoria a ser criada junto com a entidade que a classifica. */
export const CategoryDraftSchema = CategoryFormSchema.pick({
  name: true,
  color: true,
  icon: true,
});

export type CategoryDraft = z.infer<typeof CategoryDraftSchema>;

export function createCategoryDraft(
  name: string,
  color?: string | null
): CategoryDraft {
  return {
    name,
    color: color ?? DEFAULT_CATEGORY_COLOR,
    icon: DEFAULT_CATEGORY_ICON,
  };
}

/** Campos de classificação (categoria/subcategoria). */
export const CategoryClassificationBaseSchema = z.object({
  categoryId: z.number().int().positive().nullable().optional(),
  newCategory: CategoryDraftSchema.nullable().optional(),
  subcategoryId: z.number().int().positive().nullable().optional(),
  newSubcategory: CategoryDraftSchema.nullable().optional(),
});

export type CategoryClassificationValues = z.infer<
  typeof CategoryClassificationBaseSchema
>;

export function refineClassification(
  data: CategoryClassificationValues,
  ctx: z.RefinementCtx
) {
  const issue = (path: keyof CategoryClassificationValues, message: string) =>
    ctx.addIssue({ code: "custom", path: [path], message });

  const hasSub = data.subcategoryId != null;
  const hasNewSub = data.newSubcategory != null;

  if (hasSub === hasNewSub) {
    issue("subcategoryId", "Selecione ou crie uma subcategoria");
    return;
  }

  if (data.newCategory != null && !hasNewSub) {
    issue("subcategoryId", "Crie uma subcategoria para a nova categoria");
  }

  if (hasNewSub && (data.categoryId != null) === (data.newCategory != null)) {
    issue("categoryId", "Selecione ou crie a categoria da nova subcategoria");
  }
}

export const CategoryClassificationSchema =
  CategoryClassificationBaseSchema.superRefine(refineClassification);

/**
 * Rascunho sem exigir nome: usado nos passos que só escolhem a classificação.
 * O nome é validado no passo de criação correspondente (e na action).
 */
export const LooseCategoryDraftSchema = CategoryDraftSchema.extend({
  name: z.string(),
});

export const looseCategoryDrafts = {
  newCategory: LooseCategoryDraftSchema.nullable().optional(),
  newSubcategory: LooseCategoryDraftSchema.nullable().optional(),
};

/** Passo de categoria (mobile): escolher uma existente ou criar. */
export const CategoryStepSchema = CategoryClassificationBaseSchema.extend(
  looseCategoryDrafts
).superRefine((data, ctx) => {
  if ((data.categoryId != null) === (data.newCategory != null)) {
    ctx.addIssue({
      code: "custom",
      path: ["categoryId"],
      message: "Selecione ou crie uma categoria",
    });
  }
});

/** Passo de subcategoria (mobile). */
export const SubcategoryStepSchema = CategoryClassificationBaseSchema.extend(
  looseCategoryDrafts
).superRefine(refineClassification);

export const NewCategoryStepSchema = z.object({
  newCategory: CategoryDraftSchema,
});

export const NewSubcategoryStepSchema = z.object({
  newSubcategory: CategoryDraftSchema,
});
