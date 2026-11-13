import { z } from "zod";
import { CycleItemSchema } from "./cycle-item.schema";
import { CycleRangeSchema } from "./cycle-primitives.schema";

export const CycleDetailSourceSchema = z.object({
    balanceId: z.number().int().positive(),
    kind: z.enum(["CARD", "CONTRACT"]),
    name: z.string().min(1),
});

export type CycleDetailSource = z.infer<typeof CycleDetailSourceSchema>;

export const CycleDetailAmountsSchema = z.object({
    total: z.number().int().nonnegative(),
    paid: z.number().int().nonnegative(),
    transferred: z.number().int().nonnegative().default(0),
    remaining: z.number().int().nonnegative(),
});

export type CycleDetailAmounts = z.infer<typeof CycleDetailAmountsSchema>;

export const CycleDetailRuleSchema = z.object({
    label: z.string(),
    effectiveFrom: z.string(),
});

export type CycleDetailRule = z.infer<typeof CycleDetailRuleSchema>;

export const CycleDetailSchema = CycleItemSchema.extend({
    source: CycleDetailSourceSchema,
    amounts: CycleDetailAmountsSchema,
    prev: CycleRangeSchema.nullable(),
    next: CycleRangeSchema.nullable(),
    hasReceipt: z.boolean().default(false),
    rule: CycleDetailRuleSchema.optional(),
});

export type CycleDetail = z.infer<typeof CycleDetailSchema>;

