import z from "zod";

/**
 * Quando um ajuste (CycleRule / AgreementAmountEntry) passa a valer.
 * - NOW: a partir de agora
 * - NEXT_CYCLE: a partir do próximo ciclo (a data real é resolvida no backend)
 * - DATE: a partir de uma data específica (`effectiveFrom`)
 */
export const EffectiveModeSchema = z.enum(["NOW", "NEXT_CYCLE", "DATE"], {
    message: "Selecione quando o ajuste começa a valer",
});

export type EffectiveMode = z.infer<typeof EffectiveModeSchema>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const EffectiveFromBaseSchema = z.object({
    effectiveMode: EffectiveModeSchema,
    /** YYYY-MM-DD. Obrigatório apenas quando `effectiveMode` é DATE. */
    effectiveFrom: z
        .string()
        .regex(ISO_DATE, "Informe uma data válida")
        .nullable()
        .optional(),
});

export type EffectiveFromValues = z.infer<typeof EffectiveFromBaseSchema>;

export function refineEffectiveFrom(
    data: EffectiveFromValues,
    ctx: z.RefinementCtx
) {
    if (data.effectiveMode === "DATE" && !data.effectiveFrom) {
        ctx.addIssue({
            code: "custom",
            path: ["effectiveFrom"],
            message: "Informe a data em que o ajuste começa a valer",
        });
    }
}

export const EffectiveFromSchema =
    EffectiveFromBaseSchema.superRefine(refineEffectiveFrom);

export const DEFAULT_EFFECTIVE_FROM: EffectiveFromValues = {
    effectiveMode: "NEXT_CYCLE",
    effectiveFrom: null,
};

export const EFFECTIVE_MODE_OPTIONS: { value: EffectiveMode; label: string }[] = [
    { value: "NOW", label: "A partir de agora" },
    { value: "NEXT_CYCLE", label: "A partir do próximo ciclo" },
    { value: "DATE", label: "Em data específica" },
];
