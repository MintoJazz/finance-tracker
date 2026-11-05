import { z } from "zod";

export const ContractTypeEnumSchema = z.enum(["PAYABLE", "RECEIVABLE"]);
export type ContractTypeEnum = z.infer<typeof ContractTypeEnumSchema>;

export const ContractFrequencyEnumSchema = z.enum(["ONCE", "WEEKLY", "MONTHLY", "YEARLY"]);
export type ContractFrequencyEnum = z.infer<typeof ContractFrequencyEnumSchema>;

export const ContractBalanceTypeEnumSchema = z.enum(["PAYABLE", "RECEIVABLE", "CREDIT"])
export type ContractBalanceTypeEnum = z.infer<typeof ContractBalanceTypeEnumSchema>

export const ContractSummaryItemSchema = z.object({
  id: z.number().int().positive(), // agreementId or balanceId
  balanceId: z.number().int().positive(),
  name: z.string(),
  type: ContractTypeEnumSchema,
  value: z.number().int().nonnegative(), // in cents
  frequency: ContractFrequencyEnumSchema,
  dueDay: z.number().int(),
  dueMonth: z.number().int().min(1).max(12).nullable().optional(),
  startsAt: z.date(),
  endsAt: z.date().nullable(),
  includeInProjection: z.boolean(),
  isArchived: z.boolean(), // maps to removedAt !== null
});

export type ContractSummaryItem = z.infer<typeof ContractSummaryItemSchema>;

export const ContractTypeCountsSchema = z.object({
  total: z.number().int().nonnegative(),
  payable: z.number().int().nonnegative(),
  receivable: z.number().int().nonnegative(),
});
export type ContractTypeCounts = z.infer<typeof ContractTypeCountsSchema>;

export const ContractFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["ALL", "PAYABLE", "RECEIVABLE"]).optional(),
  archivedOnly: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});
export type ContractFilters = z.infer<typeof ContractFiltersSchema>;
