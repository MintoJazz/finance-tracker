import { z } from "zod";
import { CommitmentCycleItemSchema } from "./commitment-cycle.schema";

export const AgreementDetailRuleSchema = z.object({
    id: z.number().int().positive(),
    frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().positive(),
    closingDay: z.number().int().nullable(),
    dueDay: z.number().int(),
    effectiveFrom: z.date(),
});

export type AgreementDetailRule = z.infer<typeof AgreementDetailRuleSchema>;

export const AgreementAmountHistoryItemSchema = z.object({
    id: z.number().int().positive(),
    amount: z.number().int(),
    effectiveAt: z.date(),
    reason: z.string().nullable(),
    createdAt: z.date(),
});

export type AgreementAmountHistoryItem = z.infer<typeof AgreementAmountHistoryItemSchema>;

export const AgreementDetailSchema = z.object({
    id: z.number().int().positive(),
    balanceId: z.number().int().positive(),
    name: z.string(),
    balanceType: z.enum(["COMMITMENT", "PAYABLE", "RECEIVABLE", "CREDIT"]),
    includeInProjection: z.boolean(),
    startsAt: z.date(),
    endsAt: z.date().nullable(),
    isArchived: z.boolean(),

    // Regra vigente
    rule: AgreementDetailRuleSchema.nullable(),

    // Valor vigente na data de referência (centavos >= 0)
    currentExpectedValue: z.number().int().nonnegative(),

    // Histórico de deltas de valor ordenado cronologicamente
    amountHistory: z.array(AgreementAmountHistoryItemSchema),

    // Ciclos deste acordo projetados na janela
    cycles: z.array(CommitmentCycleItemSchema),
});

export type AgreementDetail = z.infer<typeof AgreementDetailSchema>;

export const GetAgreementDetailInputSchema = z.object({
    agreementId: z.number().int().positive().optional(),
    balanceId: z.number().int().positive().optional(),
    from: z.string().optional(), // YYYY-MM-DD
    to: z.string().optional(),   // YYYY-MM-DD
}).refine((data) => data.agreementId !== undefined || data.balanceId !== undefined, {
    message: "É necessário informar agreementId ou balanceId.",
});

export type GetAgreementDetailInput = z.infer<typeof GetAgreementDetailInputSchema>;
