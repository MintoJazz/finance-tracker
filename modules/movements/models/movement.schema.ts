import z from "zod";

export const MovementDirectionEnumSchema = z.enum(["CREDIT", "DEBIT"]);

export type MovementDirectionEnum = z.infer<typeof MovementDirectionEnumSchema>;

export const MovementSchema = z.object({
    id: z.number().int().positive().optional(),
    entryId: z.number().int().positive(),
    balanceId: z.number().int().positive(),
    amount: z.number().int(),
    direction: MovementDirectionEnumSchema,
});

export type Movement = z.infer<typeof MovementSchema>;