import z from "zod";
import { ContractTypeEnumSchema } from "@/modules/contracts/models/contract.schema";

export const ContractFrequencyEnumSchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);
export type ContractFrequencyEnum = z.infer<typeof ContractFrequencyEnumSchema>;

export const DateRangeSchema = z.object({
  from: z.date({ message: "Data de início é obrigatória" }),
  to: z.date().optional(),
});
export type DateRangeValue = z.infer<typeof DateRangeSchema>;

// Passo 1: Identificação & Natureza
export const contractBasicsStepSchema = z.object({
  type: ContractTypeEnumSchema,
  name: z.string().trim().min(1, "O nome do contrato é obrigatório"),
});
export type ContractBasicsStepValues = z.infer<typeof contractBasicsStepSchema>;

// Passo 2: Valores & Vigência
export const contractValuesStepSchema = z.object({
  value: z
    .number({ message: "Informe um valor válido" })
    .int("Valor inválido")
    .nonnegative("O valor não pode ser negativo"),
  frequency: ContractFrequencyEnumSchema,
  validity: z.object({
    from: z.date({ message: "Data de início é obrigatória" }),
    to: z.date().optional(),
  }),
});
export type ContractValuesStepValues = z.infer<typeof contractValuesStepSchema>;

// Sub-schema de Prazos do Contrato
export const ContractScheduleSchema = z.object({
  dueDay: z
    .number({ message: "Informe um dia válido" })
    .int("O dia deve ser um número inteiro"),
  closingDay: z
    .number({ message: "Informe um dia válido" })
    .int("O dia deve ser um número inteiro")
    .optional()
    .nullable(),
  dueMonth: z.number().int().min(1).max(12).optional().nullable(),
  closingMonth: z.number().int().min(1).max(12).optional().nullable(),
});
export type ContractScheduleValues = z.infer<typeof ContractScheduleSchema>;

interface ScheduleValidationData {
  frequency?: ContractFrequencyEnum;
  hasCustomClosingDay: boolean;
  schedule: ContractScheduleValues;
}

function validateWeeklySchedule(
  data: ScheduleValidationData,
  ctx: z.RefinementCtx
) {
  const { dueDay, closingDay } = data.schedule;
  if (dueDay < 1 || dueDay > 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione um dia da semana válido (Segunda a Domingo)",
      path: ["schedule", "dueDay"],
    });
  }

  if (data.hasCustomClosingDay) {
    if (closingDay === undefined || closingDay === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o dia da semana de fechamento",
        path: ["schedule", "closingDay"],
      });
    } else if (closingDay < 1 || closingDay > 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione um dia da semana de fechamento válido",
        path: ["schedule", "closingDay"],
      });
    }
  }
}

function validateMonthlySchedule(
  data: ScheduleValidationData,
  ctx: z.RefinementCtx
) {
  const { dueDay, closingDay } = data.schedule;
  if (dueDay < 1 || dueDay > 31) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O dia de vencimento deve ser entre 1 e 31",
      path: ["schedule", "dueDay"],
    });
  }

  if (data.hasCustomClosingDay) {
    if (closingDay === undefined || closingDay === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o dia de fechamento",
        path: ["schedule", "closingDay"],
      });
    } else if (closingDay < 1 || closingDay > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O dia de fechamento deve ser entre 1 e 31",
        path: ["schedule", "closingDay"],
      });
    }
  }
}

function validateYearlySchedule(
  data: ScheduleValidationData,
  ctx: z.RefinementCtx
) {
  const { dueDay, dueMonth, closingDay, closingMonth } = data.schedule;
  if (dueDay < 1 || dueDay > 31) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O dia de vencimento deve ser entre 1 e 31",
      path: ["schedule", "dueDay"],
    });
  }

  if (!dueMonth || dueMonth < 1 || dueMonth > 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione o mês de vencimento",
      path: ["schedule", "dueMonth"],
    });
  }

  if (data.hasCustomClosingDay) {
    if (closingDay === undefined || closingDay === null || closingDay < 1 || closingDay > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um dia de fechamento válido (1 a 31)",
        path: ["schedule", "closingDay"],
      });
    }
    if (!closingMonth || closingMonth < 1 || closingMonth > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o mês de fechamento",
        path: ["schedule", "closingMonth"],
      });
    }
  }
}

export function applyScheduleValidation(
  data: ScheduleValidationData,
  ctx: z.RefinementCtx
) {
  const freq = data.frequency ?? "MONTHLY";
  if (freq === "WEEKLY") {
    validateWeeklySchedule(data, ctx);
  } else if (freq === "YEARLY") {
    validateYearlySchedule(data, ctx);
  } else {
    validateMonthlySchedule(data, ctx);
  }
}

// Passo 3: Prazos & Vencimento (Wizard Step)
export const contractScheduleStepSchema = z
  .object({
    frequency: ContractFrequencyEnumSchema.optional(),
    hasCustomClosingDay: z.boolean(),
    schedule: ContractScheduleSchema,
  })
  .superRefine(applyScheduleValidation);

export type ContractScheduleStepValues = z.infer<typeof contractScheduleStepSchema>;

// Schema Completo do Formulário
export const ContractFormSchema = z
  .object({
    type: ContractTypeEnumSchema,
    name: z.string().trim().min(1, "O nome do contrato é obrigatório"),
    value: z
      .number({ message: "Informe um valor válido" })
      .int("Valor inválido")
      .nonnegative("O valor não pode ser negativo"),
    frequency: ContractFrequencyEnumSchema,
    validity: z.object({
      from: z.date({ message: "Data de início é obrigatória" }),
      to: z.date().optional(),
    }),
    schedule: ContractScheduleSchema,
    hasCustomClosingDay: z.boolean(),
    includeInProjection: z.boolean(),
  })
  .superRefine(applyScheduleValidation);

export type ContractFormValues = z.infer<typeof ContractFormSchema>;

export const DEFAULT_CONTRACT_FORM_VALUES: ContractFormValues = {
  type: "PAYABLE",
  name: "",
  value: 0,
  frequency: "MONTHLY",
  validity: {
    from: new Date(),
    to: undefined,
  },
  schedule: {
    dueDay: 10,
    closingDay: null,
    dueMonth: null,
    closingMonth: null,
  },
  hasCustomClosingDay: false,
  includeInProjection: true,
};
