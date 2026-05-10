import { TransactionType } from "@/generated/prisma/enums";
import * as z from "zod"
import { SCHEMA_REGISTRY } from "./schema-registry";

export const newTransactionSchema = {
    ...SCHEMA_REGISTRY
}

export const baseTransactionSchema = z.object({
    description: z.string().min(1, "A descrição é obrigatória"),
    amount: z.number().positive("O valor deve ser maior que zero").int(),
    date: z.coerce.date({ message: "Data inválida" }),
    activeBadges: z.array(z.enum(Object.keys(SCHEMA_REGISTRY) as [keyof typeof SCHEMA_REGISTRY])),
    type: z.enum(Object.keys(TransactionType) as [keyof typeof TransactionType])
})

export const transactionFormSchema = baseTransactionSchema.merge(z.object(newTransactionSchema).partial()).superRefine((data, ctx) => {
    data.activeBadges.forEach(badge => {
        const result = SCHEMA_REGISTRY[badge].safeParse(data[badge])

        if (!result.success) result.error.issues.forEach((issue) => ctx.addIssue({
            ...issue,
            path: [badge, ...issue.path], 
        }));
    })
}).transform((data) => {
    const sanitizedData = { ...data };

    for (const badge of Object.keys(SCHEMA_REGISTRY)) {
        const key = badge as keyof typeof SCHEMA_REGISTRY
        if (!sanitizedData.activeBadges.includes(key)) delete sanitizedData[key]
    }

    return sanitizedData;
})