import { z } from "zod";
import {
    CategoryClassificationBaseSchema,
    looseCategoryDrafts,
    refineClassification,
} from "@/modules/categories/models/category-classification.schema";

/** Escopo da troca de categoria: apenas cauda em aberto (padrão) ou todo o parcelamento. */
export const InstallmentCategoryScopeSchema = z.enum(["OPEN_ONLY", "ALL"]);

export const ChangeInstallmentCategoryBaseSchema = z.object({
    ...CategoryClassificationBaseSchema.shape,
    scope: InstallmentCategoryScopeSchema.default("OPEN_ONLY"),
});

export const ChangeInstallmentCategorySchema =
    ChangeInstallmentCategoryBaseSchema.superRefine((data, ctx) => {
        refineClassification(data, ctx);
    });

/** Desktop: passo principal sem exigir nome dos rascunhos (validados nos passos de criação). */
export const ChangeInstallmentCategoryMainStepSchema =
    ChangeInstallmentCategoryBaseSchema.extend(looseCategoryDrafts).superRefine(
        (data, ctx) => {
            refineClassification(data, ctx);
        }
    );

export type InstallmentCategoryScope = z.infer<
    typeof InstallmentCategoryScopeSchema
>;
export type ChangeInstallmentCategoryInput = z.input<
    typeof ChangeInstallmentCategoryBaseSchema
>;
export type ChangeInstallmentCategoryValues = z.infer<
    typeof ChangeInstallmentCategoryBaseSchema
>;
