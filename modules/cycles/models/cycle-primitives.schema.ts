import { z } from "zod";

export const CycleRangeSchema = z
    .object({
        from: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial no formato YYYY-MM-DD"),
        to: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final no formato YYYY-MM-DD"),
    })
    .refine((data) => data.from <= data.to, {
        message: "A data inicial (from) deve ser menor ou igual à data final (to)",
    });

export type CycleRange = z.infer<typeof CycleRangeSchema>;

export const CycleStatusSchema = z.enum([
    "PROJECTED",
    "OPEN",
    "PENDING",
    "PARTIAL",
    "OVERDUE",
    "PAID",
    "SETTLED",
    "TRANSFERRED",
    "UNRECORDED",
]);

export type CycleStatus = z.infer<typeof CycleStatusSchema>;
