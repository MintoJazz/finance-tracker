import { BucketType } from "@/generated/prisma/enums";
import z from "zod";

export const bucketSchema = z.object({
    name: z.string().min(1, "O nome do Bucket é obrigatório"),
    userId: z.number().positive("Selecione um Usuário válido"),
    type: z.enum(BucketType)
})

export type BucketFormType = z.infer<typeof bucketSchema>