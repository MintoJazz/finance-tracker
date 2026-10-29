import z from "zod";

export const CardCycleStatusEnumSchema = z.enum([
    "OPEN",      // Fatura atual em aberto
    "CLOSED",    // Fechada, aguardando pagamento
    "PAID",      // Paga
    "OVERDUE",   // Vencida
    "FUTURE",    // Próximas faturas (parcelamentos/projeção)
    "PROJECTED", // Projetada
    "PENDING",   // Aguardando pagamento
    "PARTIAL",   // Parcialmente paga
]);

export type CardCycleStatusEnum = z.infer<typeof CardCycleStatusEnumSchema>;

export const CardCycleOptionSchema = z.object({
    label: z.string().min(1),          // Ex: "Outubro 2026"
    from: z.string().min(1),           // YYYY-MM-DD (ex: "2026-09-28")
    to: z.string().min(1),             // YYYY-MM-DD (ex: "2026-10-27")
    closingDate: z.date(),
    dueDate: z.date(),
    status: CardCycleStatusEnumSchema,
    invoiceAmount: z.number().int(),   // Total da fatura no ciclo (centavos)
    paidAmount: z.number().int(),      // Total pago no ciclo (centavos)
});

export type CardCycleOption = z.infer<typeof CardCycleOptionSchema>;

export const CardProfileSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    limit: z.number().int().nonnegative(),
    usedLimit: z.number().int().nonnegative(),
    availableLimit: z.number().int().nonnegative(),
    closingDay: z.number().int().min(1).max(31),
    dueDay: z.number().int().min(1).max(31),
    isArchived: z.boolean(),
    createdAt: z.date(),
    cycles: z.array(CardCycleOptionSchema),
});

export type CardProfile = z.infer<typeof CardProfileSchema>;

export const GetCardProfileSchema = z.object({
    id: z.number().int().positive("ID do cartão inválido"),
});

export type GetCardProfileDTO = z.infer<typeof GetCardProfileSchema>;