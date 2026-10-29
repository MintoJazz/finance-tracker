import { z } from "zod";
import {
  ContractFrequencyEnumSchema,
  ContractScheduleSchema,
  applyScheduleValidation,
} from "@/modules/contracts/models/contract-form.schema";

export const AdjustContractScheduleEffectiveScopeSchema = z.enum(["IMMEDIATE", "NEXT_CYCLE", "SPECIFIC_DATE"]);

export type AdjustContractScheduleEffectiveScope = z.infer<typeof AdjustContractScheduleEffectiveScopeSchema>;

export const AdjustContractScheduleFormSchema = z
  .object({
    frequency: ContractFrequencyEnumSchema.optional(),
    hasCustomClosingDay: z.boolean(),
    schedule: ContractScheduleSchema,
    effectiveScope: AdjustContractScheduleEffectiveScopeSchema,
    effectiveDate: z.date().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    applyScheduleValidation(
      {
        frequency: data.frequency,
        hasCustomClosingDay: data.hasCustomClosingDay,
        schedule: data.schedule,
      },
      ctx
    );

    if (data.effectiveScope === "SPECIFIC_DATE" && !data.effectiveDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveDate"],
        message: "Informe a data para quando começa a valer",
      });
    }
    if (data.effectiveScope !== "SPECIFIC_DATE") {
      data.effectiveDate = null;
    }
  });

export type AdjustContractScheduleFormValues = z.infer<typeof AdjustContractScheduleFormSchema>;

export const DEFAULT_ADJUST_CONTRACT_SCHEDULE_FORM_VALUES: AdjustContractScheduleFormValues = {
  frequency: "MONTHLY",
  hasCustomClosingDay: false,
  schedule: {
    dueDay: 10,
    closingDay: null,
    dueMonth: null,
    closingMonth: null,
  },
  effectiveScope: "NEXT_CYCLE",
  effectiveDate: null,
};
