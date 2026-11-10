import { z } from "zod"

export const DEFAULT_CATEGORY_INTENT_COLOR = "#06B6D4"
export const DEFAULT_CATEGORY_INTENT_ICON = "Tag"

export const CreateCategoryIntentSliceSchema = z.object({
  name: z
    .string({ error: "Informe o nome da nova categoria" })
    .trim()
    .min(1, "O nome é obrigatório")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
})

export type CreateCategoryIntentSlice = z.infer<
  typeof CreateCategoryIntentSliceSchema
>

export function buildInitialCategoryIntentSlice(): Partial<CreateCategoryIntentSlice> {
  return {
    name: "",
    color: DEFAULT_CATEGORY_INTENT_COLOR,
    icon: DEFAULT_CATEGORY_INTENT_ICON,
  }
}

