import z from "zod";
import {
    EffectiveFromBaseSchema,
    refineEffectiveFrom,
} from "./effective-from.schema";

/** Campos do ajuste de valor (limite do cartão / valor esperado da recorrência). */
export const AmountAdjustmentDetailsSchema = z.object({
    amount: z
        .number({ message: "Informe um valor válido" })
        .int("O valor deve ser em centavos")
        .nonnegative("O valor não pode ser negativo"),
    reason: z
        .string()
        .trim()
        .max(200, "O motivo deve ter no máximo 200 caracteres")
        .nullable()
        .optional(),
});

export const AmountAdjustmentBaseSchema = AmountAdjustmentDetailsSchema.extend(
    EffectiveFromBaseSchema.shape
);

export const AmountAdjustmentSchema =
    AmountAdjustmentBaseSchema.superRefine(refineEffectiveFrom);

export type AmountAdjustmentValues = z.infer<typeof AmountAdjustmentBaseSchema>;
