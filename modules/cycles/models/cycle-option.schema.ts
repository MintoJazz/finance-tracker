import { z } from "zod";
import { CycleStatusSchema } from "./cycle-primitives.schema";

export const CycleOptionSchema = z.object({
    from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial no formato YYYY-MM-DD"),
    to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final no formato YYYY-MM-DD"),
    dueDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        z.date(),
    ]),
    label: z.string().min(1),
    status: CycleStatusSchema,
    totalAmount: z.number().int().nonnegative(),
    paidAmount: z.number().int().nonnegative().default(0),
    remainingAmount: z.number().int().nonnegative(),
    isOverdue: z.boolean().optional().default(false),

    // Contexto opcional de identificador do contrato/acordo/saldo
    agreementId: z.number().int().positive().optional(),
    balanceId: z.number().int().positive().optional(),

    // Alias compatível para referência de data civil (aponta para from)
    referenceDate: z.string().optional(),
});

export type CycleOption = z.infer<typeof CycleOptionSchema>;
