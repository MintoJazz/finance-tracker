import z from "zod";
import {
    AmountAdjustmentBaseSchema,
    AmountAdjustmentSchema,
} from "@/modules/agreements/models/amount-adjustment.schema";
import {
    EffectiveFromBaseSchema,
    refineEffectiveFrom,
} from "@/modules/agreements/models/effective-from.schema";
import { CardFormSchema } from "./card.schema";

/** Ajuste do limite do cartão -> novo AgreementAmountEntry. */
export const CardLimitAdjustmentSchema = AmountAdjustmentSchema;
export const CardLimitAdjustmentBaseSchema = AmountAdjustmentBaseSchema;
export type CardLimitAdjustmentValues = z.infer<
    typeof CardLimitAdjustmentBaseSchema
>;

/** Cartão é sempre mensal: fechamento e vencimento são obrigatórios (1–31). */
export const CardDeadlinesDetailsSchema = z.object({
    closingDay: CardFormSchema.shape.closingDay,
    dueDay: CardFormSchema.shape.dueDay,
});

/** Ajuste do ciclo da fatura -> novo CycleRule. */
export const CardDeadlinesAdjustmentBaseSchema = CardDeadlinesDetailsSchema.extend(
    EffectiveFromBaseSchema.shape
);
export const CardDeadlinesAdjustmentSchema =
    CardDeadlinesAdjustmentBaseSchema.superRefine(refineEffectiveFrom);
export type CardDeadlinesAdjustmentValues = z.infer<
    typeof CardDeadlinesAdjustmentBaseSchema
>;

const CardIdSchema = z.number().int().positive("ID do cartão inválido");

/** Entrada da action de ajuste de limite (form + id do cartão). */
export const AdjustCardLimitInputSchema = CardLimitAdjustmentBaseSchema.extend({
    id: CardIdSchema,
}).superRefine(refineEffectiveFrom);
export type AdjustCardLimitInput = z.infer<typeof AdjustCardLimitInputSchema>;

/** Entrada da action de ajuste de prazos (form + id do cartão). */
export const AdjustCardDeadlinesInputSchema = CardDeadlinesAdjustmentBaseSchema.extend({
    id: CardIdSchema,
}).superRefine(refineEffectiveFrom);
export type AdjustCardDeadlinesInput = z.infer<typeof AdjustCardDeadlinesInputSchema>;
