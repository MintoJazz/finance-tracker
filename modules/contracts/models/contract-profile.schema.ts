import z from "zod";
import { ContractTypeEnumSchema } from "@/modules/contracts/models/contract.schema";
import { ContractFrequencyEnumSchema } from "@/modules/contracts/models/contract-form.schema";

export const ContractProfileSummarySchema = z.object({
    totalPaid: z.number().int().nonnegative(),
    totalPending: z.number().int().nonnegative(),
    totalProjected: z.number().int().nonnegative(),
    overdueCount: z.number().int().nonnegative(),
    overdueAmount: z.number().int().nonnegative(),
    nextDueDate: z.date().nullable().optional(),
    cyclesCount: z.object({
        total: z.number().int().nonnegative(),
        consolidated: z.number().int().nonnegative(),
        projected: z.number().int().nonnegative(),
    }),
});

export type ContractProfileSummary = z.infer<typeof ContractProfileSummarySchema>;

export const ContractProfileSchema = z.object({
    id: z.number().int().positive(), // agreementId
    balanceId: z.number().int().positive(),
    name: z.string().min(1),
    type: ContractTypeEnumSchema,
    value: z.number().int().nonnegative(), // em centavos
    frequency: ContractFrequencyEnumSchema,
    dueDay: z.number().int(),
    dueMonth: z.number().int().min(1).max(12).nullable().optional(),
    closingDay: z.number().int().nullable().optional(),
    closingMonth: z.number().int().min(1).max(12).nullable().optional(),
    startsAt: z.date(),
    endsAt: z.date().nullable(),
    includeInProjection: z.boolean(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    summary: ContractProfileSummarySchema,
});

export type ContractProfile = z.infer<typeof ContractProfileSchema>;

export const GetContractProfileSchema = z.object({
    id: z.number().int().positive("ID do contrato inválido"),
});

export type GetContractProfileDTO = z.infer<typeof GetContractProfileSchema>;
