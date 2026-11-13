import z from "zod";
import {
    CycleRangeSchema,
    CycleStatusSchema,
    type CycleRange,
    type CycleStatus,
} from "./cycle-primitives.schema";
import {
    CycleItemSchema,
    CycleFiltersSchema,
    type CycleItem,
    type CycleFilters,
} from "./cycle-item.schema";

export { CycleRangeSchema, type CycleRange, CycleStatusSchema, type CycleStatus };

export const ContractCycleStatusEnumSchema = CycleStatusSchema;
export type ContractCycleStatusEnum = CycleStatus;

export const ContractCycleItemSchema = CycleItemSchema;
export type ContractCycleItem = CycleItem;

export const ContractCycleFiltersSchema = CycleFiltersSchema;
export type ContractCycleFilters = CycleFilters;

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

export { type EntryTypeEnum } from "@/modules/cycles/models/cycle-entries.schema";
import { EntryTypeEnumSchema } from "@/modules/cycles/models/cycle-entries.schema";
export { EntryTypeEnumSchema };

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
    status: ContractCycleStatusEnumSchema,
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

export const CycleEntryCounterpartSchema = z.object({
    label: z.string(),
    href: z.string(),
});

export type CycleEntryCounterpart = z.infer<typeof CycleEntryCounterpartSchema>;

export const CycleEntryRowSchema = z.object({
    id: z.number().int().positive(),
    date: z.string(), // ISO YYYY-MM-DD
    description: z.string(),
    type: EntryTypeEnumSchema,
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

