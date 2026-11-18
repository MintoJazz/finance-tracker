import {
    AmountAdjustmentBaseSchema,
    AmountAdjustmentSchema,
} from "@/modules/agreements/models/amount-adjustment.schema";
import {
    EffectiveFromBaseSchema,
    refineEffectiveFrom,
} from "@/modules/agreements/models/effective-from.schema";
import {
    RecurrenceDeadlinesBaseSchema,
    RecurrenceDeadlinesSchema,
    refineDeadlines,
} from "./recurrence-form.schema";
import z from "zod";

/** Ajuste de prazos da recorrência -> novo CycleRule. A frequência só orienta os campos. */
export const RecurrenceDeadlinesAdjustmentBaseSchema =
    RecurrenceDeadlinesBaseSchema.extend(EffectiveFromBaseSchema.shape);

export const RecurrenceDeadlinesAdjustmentSchema =
    RecurrenceDeadlinesAdjustmentBaseSchema.superRefine((data, ctx) => {
        refineDeadlines(data, ctx);
        refineEffectiveFrom(data, ctx);
    });

export type RecurrenceDeadlinesAdjustmentValues = z.infer<
    typeof RecurrenceDeadlinesAdjustmentBaseSchema
>;

/** Passo 1 do mobile (sem vigência). */
export const RecurrenceDeadlinesAdjustmentDetailsSchema = RecurrenceDeadlinesSchema;

/** Ajuste do valor esperado da recorrência -> novo AgreementAmountEntry. */
export const RecurrenceAmountAdjustmentSchema = AmountAdjustmentSchema;
export const RecurrenceAmountAdjustmentBaseSchema = AmountAdjustmentBaseSchema;
export type { AmountAdjustmentValues as RecurrenceAmountAdjustmentValues } from "@/modules/agreements/models/amount-adjustment.schema";

const RecurrenceIdSchema = z.number().int().positive("ID da recorrência inválido");

/** Entrada da action de ajuste de valor (form + id da recorrência). */
export const AdjustRecurrenceAmountInputSchema = RecurrenceAmountAdjustmentBaseSchema.extend({
    balanceId: RecurrenceIdSchema,
}).superRefine(refineEffectiveFrom);
export type AdjustRecurrenceAmountInput = z.infer<typeof AdjustRecurrenceAmountInputSchema>;

/**
 * Entrada da action de ajuste de prazos (form + id da recorrência).
 * A `frequency` do form só orienta os campos: o backend usa a do acordo.
 */
export const AdjustRecurrenceDeadlinesInputSchema = RecurrenceDeadlinesAdjustmentBaseSchema.extend({
    balanceId: RecurrenceIdSchema,
}).superRefine((data, ctx) => {
    refineDeadlines(data, ctx);
    refineEffectiveFrom(data, ctx);
});
export type AdjustRecurrenceDeadlinesInput = z.infer<typeof AdjustRecurrenceDeadlinesInputSchema>;
