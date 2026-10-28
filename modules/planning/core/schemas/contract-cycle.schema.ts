import z from "zod";

export const ContractCycleStatusEnumSchema = z.enum([
    "PROJECTED", // Fase zero: ciclo puramente projetado/estimado sem lançamentos consolidados
    "OPEN",      // Em aberto / previsto
    "PENDING",   // Fechado/provisionado aguardando quitação no prazo
    "PARTIAL",   // Quitado parcialmente
    "OVERDUE",   // Vencido
    "PAID",      // Quitado integralmente
    "TRANSFERRED", // Quitado por transferência/parcelamento
]);

export type ContractCycleStatusEnum = z.infer<typeof ContractCycleStatusEnumSchema>;

export const ContractCycleItemSchema = z.object({
    cycleKey: z.string().min(1),           // Identificador estável (ex: "contract-1-2026-10")
    contractId: z.number().int().positive(),
    label: z.string().min(1),              // Ex: "Outubro 2026"
    from: z.string().min(1),               // Data inicial da competência (YYYY-MM-DD)
    to: z.string().min(1),                 // Data final da competência (YYYY-MM-DD)
    closingDate: z.date().optional(),       // Data de fechamento do ciclo
    dueDate: z.date(),                     // Data de vencimento do ciclo
    status: ContractCycleStatusEnumSchema, // PROJECTED | OPEN | PENDING | PARTIAL | OVERDUE | PAID
    
    // Valores monetários em centavos
    totalAmount: z.number().int().nonnegative(),     // Valor total/previsto da obrigação
    paidAmount: z.number().int().nonnegative(),      // Valor pago/liquidado
    remainingAmount: z.number().int().nonnegative(), // Saldo pendente a liquidar
    
    movementsCount: z.number().int().nonnegative().default(0), // Quantidade de entradas contábeis vinculadas
    settlementDate: z.date().nullable().optional(),            // Data do pagamento integral, se houver
});

export type ContractCycleItem = z.infer<typeof ContractCycleItemSchema>;

export const ContractCycleFiltersSchema = z.object({
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    year: z.number().int().optional(),
    statuses: z.array(ContractCycleStatusEnumSchema).optional(),
    includeProjected: z.boolean().default(true),
});

export type ContractCycleFilters = z.infer<typeof ContractCycleFiltersSchema>;

export const GetContractCyclesDTOSchema = z.object({
    contractId: z.number().int().positive("ID do contrato inválido"),
    pageRequest: z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(10),
    }),
    filter: ContractCycleFiltersSchema.optional(),
});

export type GetContractCyclesDTO = z.infer<typeof GetContractCyclesDTOSchema>;

// ==========================================
// Perfil Detalhado do Ciclo de Contrato
// ==========================================

export const CycleRangeSchema = z
    .object({
        from: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial no formato YYYY-MM-DD"),
        to: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final no formato YYYY-MM-DD"),
    })
    .refine((data) => data.from <= data.to, {
        message: "A data inicial (from) deve ser menor ou igual à data final (to)",
    });

export type CycleRange = z.infer<typeof CycleRangeSchema>;

export const ContractCycleProfileStatusSchema = z.enum([
    "projected",
    "open",
    "paid",
    "partial",
    "overdue",
    "transferred",
]);

export type ContractCycleProfileStatus = z.infer<
    typeof ContractCycleProfileStatusSchema
>;

export const ContractCycleRuleSchema = z.object({
    label: z.string(),
    effectiveFrom: z.string(),
});

export type ContractCycleRule = z.infer<typeof ContractCycleRuleSchema>;

export const ContractCycleProfileSchema = z.object({
    contractId: z.number().int().positive(),
    contractName: z.string(),
    title: z.string(), // Ex: "Outubro 2026"
    range: CycleRangeSchema,
    dueDate: z.string(), // ISO YYYY-MM-DD
    status: ContractCycleProfileStatusSchema,
    expectedAmount: z.number().int().nonnegative(), // Centavos
    paidAmount: z.number().int().nonnegative(), // Centavos
    transferredAmount: z.number().int().nonnegative(), // Centavos
    openAmount: z.number().int().nonnegative(), // Centavos
    hasReceipt: z.boolean(),
    prev: CycleRangeSchema.nullable(),
    next: CycleRangeSchema.nullable(),
    rule: ContractCycleRuleSchema,
});

export type ContractCycleProfile = z.infer<typeof ContractCycleProfileSchema>;

export const CycleEntryTypeSchema = z.enum([
    "provision",
    "adjustment",
    "settlement",
    "claim_opening",
    "reversal",
]);

export type CycleEntryType = z.infer<typeof CycleEntryTypeSchema>;

export const CycleEntryCounterpartSchema = z.object({
    label: z.string(),
    href: z.string(),
});

export type CycleEntryCounterpart = z.infer<typeof CycleEntryCounterpartSchema>;

export const CycleEntryRowSchema = z.object({
    id: z.number().int().positive(),
    date: z.string(), // ISO YYYY-MM-DD
    description: z.string(),
    type: CycleEntryTypeSchema,
    direction: z.enum(["CREDIT", "DEBIT"]),
    amount: z.number().int().positive(), // Centavos (sempre positivo)
    hasAttachment: z.boolean(),
    reversesEntryId: z.number().int().positive().nullable(),
    reversedByEntryId: z.number().int().positive().nullable(),
    counterpart: CycleEntryCounterpartSchema.nullable(),
});

export type CycleEntryRow = z.infer<typeof CycleEntryRowSchema>;

// Payloads para fase futura de backend (mutações)
export const PayCyclePayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
    amount: z.number().int().positive("O valor deve ser maior que zero"),
    paymentDate: z.string(),
    walletId: z.number().int().positive("Selecione a carteira de origem"),
});

export type PayCyclePayload = z.infer<typeof PayCyclePayloadSchema>;

export const InstallmentCyclePayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
    totalAmount: z.number().int().positive(),
    installmentsCount: z.number().int().min(2).max(72),
    firstDueDate: z.string(),
    targetContractId: z.number().int().positive().optional(),
});

export type InstallmentCyclePayload = z.infer<
    typeof InstallmentCyclePayloadSchema
>;

export const AdjustCyclePayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
    newAmount: z.number().int().nonnegative(),
    reason: z.string().min(1, "Informe o motivo do ajuste"),
});

export type AdjustCyclePayload = z.infer<typeof AdjustCyclePayloadSchema>;

export const AttachReceiptPayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
    attachmentId: z.string().min(1, "Anexo obrigatório"),
    notes: z.string().optional(),
});

export type AttachReceiptPayload = z.infer<typeof AttachReceiptPayloadSchema>;

export const SkipCyclePayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
});

export type SkipCyclePayload = z.infer<typeof SkipCyclePayloadSchema>;

export const ReverseEntryPayloadSchema = z.object({
    contractId: z.number().int().positive(),
    cycleRange: CycleRangeSchema,
    entryId: z.number().int().positive(),
    reason: z.string().optional(),
});

export type ReverseEntryPayload = z.infer<typeof ReverseEntryPayloadSchema>;

