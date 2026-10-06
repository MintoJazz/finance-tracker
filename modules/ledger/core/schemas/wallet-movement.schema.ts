import z from "zod";
import { MovementDirectionEnumSchema } from "./movement.schema";

export const WalletMovementTypeSchema = z.enum([
    "INCOME",
    "EXPENSE",
    "TRANSFER",
    "ADJUSTMENT",
    "REVERSAL",
]);

export type WalletMovementType = z.infer<typeof WalletMovementTypeSchema>;

export const WalletMovementSchema = z.object({
    movementId: z.number().int().positive(),
    entryId: z.number().int().positive(),
    description: z.string().min(1),
    date: z.date(),
    type: WalletMovementTypeSchema,
    direction: MovementDirectionEnumSchema,
    amount: z.number().int().nonnegative(),
    isReversed: z.boolean(),
    hasReceipt: z.boolean(),
});

export type WalletMovement = z.infer<typeof WalletMovementSchema>;

export const WalletMovementFiltersSchema = z.object({
    q: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    direction: MovementDirectionEnumSchema.optional(),
    types: z.array(WalletMovementTypeSchema).optional(),
    includeReversed: z.boolean().optional(),
});

export type WalletMovementFilters = z.infer<typeof WalletMovementFiltersSchema>;

export const GetWalletMovementsDTOSchema = z.object({
    walletId: z.number().int().positive("ID da carteira inválido"),
    pageRequest: z.object({
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().optional(),
    }),
    filter: WalletMovementFiltersSchema.optional(),
});

export type GetWalletMovementsDTO = z.infer<typeof GetWalletMovementsDTOSchema>;