import { z } from "zod";
import { CycleItem } from "@/modules/cycles/models/cycle-item.schema";

export const RecurrenceCycleStatusFilterSchema = z.enum([
    "ALL",
    "OVERDUE",
    "PENDING",
    "PAID",
]);

export type RecurrenceCycleStatusFilter = z.infer<
    typeof RecurrenceCycleStatusFilterSchema
>;

export const RecurrenceCycleFiltersSchema = z.object({
    q: z.string().optional(),
    offset: z.coerce.number().int().default(0),
    status: RecurrenceCycleStatusFilterSchema.default("ALL"),
    includeProjected: z.coerce.boolean().default(true),
    from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial no formato YYYY-MM-DD")
        .optional(),
    to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final no formato YYYY-MM-DD")
        .optional(),
});

export type RecurrenceCycleFilters = z.infer<
    typeof RecurrenceCycleFiltersSchema
>;

export interface MacroHorizonInfo {
    label: string; // ex: "2026", "2020 – 2029", "01/01/2026 – 31/12/2026"
    offset: number;
    canPrev: boolean;
    canNext: boolean;
    prevOffset: number;
    nextOffset: number;
    from?: string;
    to?: string;
    isCustom?: boolean;
}

export interface RecurrenceCyclesResult {
    horizon: MacroHorizonInfo;
    cycles: CycleItem[];
}
