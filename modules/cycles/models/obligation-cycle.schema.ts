import { z } from "zod";
import { CycleStatusSchema, type CycleStatus } from "./cycle-primitives.schema";
import { CycleOptionSchema } from "./cycle-option.schema";

export { CycleStatusSchema, type CycleStatus };

export const CycleViewSchema = z.object({
  agreementId: z.number().int().positive(),
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected: z.number().int().nonnegative().nullable(),
  accrued: z.number().int().nonnegative(),
  settled: z.number().int().nonnegative(),
  outstanding: z.number().int().nonnegative(),
  status: CycleStatusSchema,
  isOverdue: z.boolean(),
  label: z.string().min(1),

  // Campos interoperáveis do CycleOption
  from: z.string().optional(),
  to: z.string().optional(),
  totalAmount: z.number().int().nonnegative().optional(),
  paidAmount: z.number().int().nonnegative().optional(),
  remainingAmount: z.number().int().nonnegative().optional(),
});

export type CycleView = z.infer<typeof CycleViewSchema>;

export const GetObligationCyclesInputSchema = z.object({
  agreementId: z.number().int().positive(),
  cursor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  direction: z.enum(["before", "after"]).default("after"),
  limit: z.number().int().positive().max(50).default(12),
})

export type GetObligationCyclesInput = z.infer<typeof GetObligationCyclesInputSchema>

export interface ObligationCyclesResponse {
  readonly items: readonly CycleView[]
  readonly prevCursor: string | null
  readonly nextCursor: string | null
}

