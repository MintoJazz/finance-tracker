import z from "zod";

export const ContractCycleKindEnumSchema = z.enum([
    "CONSOLIDATED", // Ciclo com lançamentos reais já apurados
    "PROJECTED",    // Ciclo gerado por estimativa/recorrência da regra sem lançamentos
]);

export type ContractCycleKindEnum = z.infer<typeof ContractCycleKindEnumSchema>;

export const ContractCycleStatusEnumSchema = z.enum([
    "OPEN",      // Em aberto / previsto
    "PENDING",   // Fechado/provisionado aguardando quitação no prazo
    "PARTIAL",   // Quitado parcialmente
    "OVERDUE",   // Vencido
    "PAID",      // Quitado integralmente
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
    kind: ContractCycleKindEnumSchema,     // CONSOLIDATED | PROJECTED
    status: ContractCycleStatusEnumSchema, // OPEN | PENDING | PARTIAL | OVERDUE | PAID
    
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
