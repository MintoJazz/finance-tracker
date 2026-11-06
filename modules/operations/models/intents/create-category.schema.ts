import { z } from "zod"

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

