import z from "zod";
import { ContractTypeEnumSchema } from "./contract.schema";

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
  validity: z
    .object({
      from: z.date({ message: "Data de início é obrigatória" }),
      to: z.date().optional(),
    }),
});
export type ContractValuesStepValues = z.infer<typeof contractValuesStepSchema>;

// Passo 3: Prazos & Vencimento (Campos digitáveis)
export const contractScheduleStepSchema = z
  .object({
    dueDay: z
      .number({ message: "Informe um dia válido" })
      .int("O dia deve ser um número inteiro")
      .min(1, "O dia deve ser entre 1 e 31")
      .max(31, "O dia deve ser entre 1 e 31"),
    hasCustomClosingDay: z.boolean(),
    closingDay: z
      .number({ message: "Informe um dia válido" })
      .int("O dia deve ser um número inteiro")
      .min(1, "O dia deve ser entre 1 e 31")
      .max(31, "O dia deve ser entre 1 e 31")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.hasCustomClosingDay) {
        return (
          data.closingDay !== undefined &&
          data.closingDay !== null &&
          !Number.isNaN(data.closingDay)
        );
      }
      return true;
    },
    {
      message: "Informe o dia de fechamento",
      path: ["closingDay"],
    }
  );
export type ContractScheduleStepValues = z.infer<typeof contractScheduleStepSchema>;

// Schema Completo
export const ContractFormSchema = z
  .object({
    type: ContractTypeEnumSchema,
    name: z.string().trim().min(1, "O nome do contrato é obrigatório"),
    value: z
      .number({ message: "Informe um valor válido" })
      .int("Valor inválido")
      .nonnegative("O valor não pode ser negativo"),
    frequency: ContractFrequencyEnumSchema,
    validity: z
      .object({
        from: z.date({ message: "Data de início é obrigatória" }),
        to: z.date().optional(),
      }),
    dueDay: z
      .number({ message: "Informe um dia válido" })
      .int("O dia deve ser um número inteiro")
      .min(1, "O dia deve ser entre 1 e 31")
      .max(31, "O dia deve ser entre 1 e 31"),
    hasCustomClosingDay: z.boolean(),
    closingDay: z
      .number({ message: "Informe um dia válido" })
      .int("O dia deve ser um número inteiro")
      .min(1, "O dia deve ser entre 1 e 31")
      .max(31, "O dia deve ser entre 1 e 31")
      .optional()
      .nullable(),
    includeInProjection: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.hasCustomClosingDay) {
        return (
          data.closingDay !== undefined &&
          data.closingDay !== null &&
          !Number.isNaN(data.closingDay)
        );
      }
      return true;
    },
    {
      message: "Informe o dia de fechamento",
      path: ["closingDay"],
    }
  );

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
  dueDay: 10,
  hasCustomClosingDay: false,
  closingDay: null,
  includeInProjection: true,
};
