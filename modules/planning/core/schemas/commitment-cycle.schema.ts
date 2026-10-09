import z from "zod";
import { Page } from "@/types/pagination.types";

export const CommitmentCycleKindEnumSchema = z.enum([
    "ACTUAL",    // Ciclo gerado com entradas reais registradas
    "PROJECTED", // Ciclo puramente projetado por regra sem lançamentos
]);

export type CommitmentCycleKindEnum = z.infer<typeof CommitmentCycleKindEnumSchema>;

export const CommitmentSourceTypeEnumSchema = z.enum([
    "CREDIT",     // Fatura de Cartão de Crédito
    "COMMITMENT", // Contrato / Obrigação Recorrente
]);

export type CommitmentSourceTypeEnum = z.infer<typeof CommitmentSourceTypeEnumSchema>;

export const CommitmentCycleStatusEnumSchema = z.enum([
    "OPEN",      // Ciclo/Fatura em aberto ou previsto
    "PENDING",   // Fechado / Provisionado aguardando pagamento no prazo
    "PARTIAL",   // Pago parcialmente
    "OVERDUE",   // Vencido (dueDate < hoje e remainingAmount > 0)
    "PAID",      // Quitado integralmente
]);

export type CommitmentCycleStatusEnum = z.infer<typeof CommitmentCycleStatusEnumSchema>;

export const CommitmentCycleItemSchema = z.object({
    balanceId: z.number().int().positive(),
    balanceName: z.string().min(1),
    balanceType: CommitmentSourceTypeEnumSchema,
    kind: CommitmentCycleKindEnumSchema.default("ACTUAL"),

    // Janela do ciclo gerada pela Engine
    label: z.string().min(1),        // Ex: "Outubro 2026"
    from: z.string().min(1),         // YYYY-MM-DD (Início da competência)
    to: z.string().min(1),           // YYYY-MM-DD (Fim da competência)
    dueDate: z.date(),               // Data de vencimento do ciclo

    // Valores em centavos
    totalAmount: z.number().int().nonnegative(),
    paidAmount: z.number().int().nonnegative(),
    remainingAmount: z.number().int().nonnegative(),

    status: CommitmentCycleStatusEnumSchema,
});

export type CommitmentCycleItem = z.infer<typeof CommitmentCycleItemSchema>;

export interface CommitmentCyclesResult {
    summary: CommitmentsPeriodSummary;
    cycles: Page<CommitmentCycleItem>;
}

export const CommitmentCycleFiltersSchema = z.object({
    from: z.string().min(1, "Data inicial obrigatória"), // YYYY-MM-DD
    to: z.string().min(1, "Data final obrigatória"),     // YYYY-MM-DD
    q: z.string().optional(),
    balanceTypes: z.array(CommitmentSourceTypeEnumSchema).optional(),
    statuses: z.array(CommitmentCycleStatusEnumSchema).optional(),
});

export type CommitmentCycleFilters = z.infer<typeof CommitmentCycleFiltersSchema>;

export const CommitmentsPeriodSummarySchema = z.object({
    totalAmount: z.number().int().nonnegative(),
    paidAmount: z.number().int().nonnegative(),
    pendingAmount: z.number().int().nonnegative(),
    overdueAmount: z.number().int().nonnegative(),
    overdueCount: z.number().int().nonnegative(),
});

export type CommitmentsPeriodSummary = z.infer<typeof CommitmentsPeriodSummarySchema>;

export const GetCommitmentCyclesDTOSchema = z.object({
    contextId: z.number().int().positive().optional(),
    pageRequest: z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(10),
    }),
    filter: CommitmentCycleFiltersSchema,
});

export type GetCommitmentCyclesDTO = z.infer<typeof GetCommitmentCyclesDTOSchema>;

export const GetCommitmentsSummaryDTOSchema = z.object({
    contextId: z.number().int().positive().optional(),
    filter: CommitmentCycleFiltersSchema,
});

export type GetCommitmentsSummaryDTO = z.infer<typeof GetCommitmentsSummaryDTOSchema>;