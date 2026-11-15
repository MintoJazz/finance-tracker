import { z } from "zod";

export const MovementEntryScopeSchema = z.enum(["WALLET", "CARD"]);
export type MovementEntryScope = z.infer<typeof MovementEntryScopeSchema>;

export const MovementEntryTypeSchema = z.enum([
    "INCOME",        // Receita
    "EXPENSE",       // Despesa (carteira)
    "PURCHASE",      // Compra (cartão)
    "PROVISION",     // Provisão (contrato)
    "SETTLEMENT",    // Pagamento / Quitação
    "TRANSFER",      // Transferência entre contas ou cessão de dívida
    "ADJUSTMENT",    // Ajuste
    "REVERSAL",      // Estorno
]);

export type MovementEntryType = z.infer<typeof MovementEntryTypeSchema>;

export const MovementEntryDirectionSchema = z.enum(["CREDIT", "DEBIT"]);
export type MovementEntryDirection = z.infer<typeof MovementEntryDirectionSchema>;

export const MovementEntryCounterpartKindSchema = z.enum([
    "CATEGORY",  // Categoria orçamentária
    "CUSTODY",   // Conta de custódia (carteira, reserva, etc.)
    "CARD",      // Cartão de crédito
    "CONTRACT",  // Contrato / Acordo (PAYABLE ou RECEIVABLE)
    "NONE",      // Sem contraparte (ajustes simples)
]);

export type MovementEntryCounterpartKind = z.infer<
    typeof MovementEntryCounterpartKindSchema
>;

export const MovementEntryAppearanceSchema = z.object({
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
});

export type MovementEntryAppearance = z.infer<typeof MovementEntryAppearanceSchema>;

export const MovementEntryCounterpartSchema = z.object({
    kind: MovementEntryCounterpartKindSchema,
    id: z.number().int().positive().optional(),
    name: z.string().optional(),
    appearance: MovementEntryAppearanceSchema.nullable().optional(),
});

export type MovementEntryCounterpart = z.infer<typeof MovementEntryCounterpartSchema>;

export const MovementEntrySchema = z.object({
    id: z.union([z.string(), z.number()]),
    entryId: z.number().int().positive(),
    movementId: z.number().int().positive().optional(),
    date: z.union([z.date(), z.string()]),
    description: z.string().min(1),
    type: MovementEntryTypeSchema,
    direction: MovementEntryDirectionSchema,
    amount: z.number().int().nonnegative(), // Centavos (sempre positivo)
    isReversed: z.boolean().default(false),
    hasAttachment: z.boolean().default(false),
    counterpart: MovementEntryCounterpartSchema,
});

export type MovementEntry = z.infer<typeof MovementEntrySchema>;

export const MovementEntryFiltersSchema = z.object({
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    direction: MovementEntryDirectionSchema.optional(),
    types: z.array(MovementEntryTypeSchema).optional(),
    includeReversed: z.boolean().default(false),
});

export type MovementEntryFilters = z.infer<typeof MovementEntryFiltersSchema>;

export const PageRequestSchema = z.object({
    page: z.number().int().positive().optional().default(1),
    pageSize: z.number().int().positive().optional().default(10),
});

export const GetBalanceMovementEntriesDTOSchema = z.object({
    balanceId: z.number().int().positive("ID do saldo inválido"),
    pageRequest: PageRequestSchema.optional().default({ page: 1, pageSize: 10 }),
    filter: MovementEntryFiltersSchema.optional(),
});

export type GetBalanceMovementEntriesDTO = z.infer<
    typeof GetBalanceMovementEntriesDTOSchema
>;
