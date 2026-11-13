import { z } from "zod";
import { CycleOptionSchema } from "./cycle-option.schema";
import { CycleStatusSchema } from "./cycle-primitives.schema";

export const CycleItemSchema = CycleOptionSchema.extend({
    contractId: z.number().int().positive().optional(),
    balanceId: z.number().int().positive().optional(),
    balanceName: z.string().optional(),
    balanceType: z.enum(["CREDIT", "COMMITMENT", "PAYABLE", "RECEIVABLE"]).optional(),
    closingDate: z.union([z.string(), z.date()]).nullable().optional(),
    movementsCount: z.number().int().nonnegative().default(0),
    settlementDate: z.union([z.string(), z.date()]).nullable().optional(),
});

export type CycleItem = z.infer<typeof CycleItemSchema>;

export const CycleFiltersSchema = z.object({
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    year: z.number().int().optional(),
    statuses: z.array(CycleStatusSchema).optional(),
    includeProjected: z.boolean().default(true),
});

export type CycleFilters = z.infer<typeof CycleFiltersSchema>;
