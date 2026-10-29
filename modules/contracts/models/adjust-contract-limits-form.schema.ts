import { z } from "zod";

export const AdjustContractLimitsEffectiveScopeSchema = z.enum(["IMMEDIATE", "NEXT_CYCLE", "SPECIFIC_DATE"]);

export type AdjustContractLimitsEffectiveScope = z.infer<typeof AdjustContractLimitsEffectiveScopeSchema>;

export const AdjustContractLimitsFormSchema = z
  .object({
    value: z.coerce.number().int().min(0, "Valor inválido"),
    effectiveScope: AdjustContractLimitsEffectiveScopeSchema,
    effectiveDate: z.date().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.effectiveScope === "SPECIFIC_DATE" && !data.effectiveDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveDate"],
        message: "Informe a data para quando começa a valer",
      });
    }
    if (data.effectiveScope !== "SPECIFIC_DATE") {
      (data as any).effectiveDate = null;
    }
  });

export type AdjustContractLimitsFormValues = z.infer<typeof AdjustContractLimitsFormSchema>;

export const DEFAULT_ADJUST_CONTRACT_LIMITS_FORM_VALUES: AdjustContractLimitsFormValues = {
  value: 0,
  effectiveScope: "NEXT_CYCLE",
  effectiveDate: null,
};
