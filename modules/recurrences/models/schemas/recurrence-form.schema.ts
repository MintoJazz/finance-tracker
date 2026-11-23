import z from "zod";
import {
    CategoryClassificationBaseSchema,
    CategoryClassificationSchema,
    CategoryDraftSchema,
    CategoryStepSchema,
    NewCategoryStepSchema,
    NewSubcategoryStepSchema,
    SubcategoryStepSchema,
    createCategoryDraft,
    looseCategoryDrafts,
    refineClassification,
    type CategoryDraft,
} from "@/modules/categories/models/category-classification.schema";

export const RecurrenceFormDirectionSchema = z.enum(["DEBIT", "CREDIT"], {
    message: "Selecione a natureza da recorrência",
});

export const RecurrenceFormFrequencySchema = z.enum(
    ["WEEKLY", "MONTHLY", "YEARLY"],
    { message: "Selecione a frequência" }
);

export type RecurrenceFormFrequency = z.infer<
    typeof RecurrenceFormFrequencySchema
>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const StartDateSchema = z
    .string({ message: "Informe a data de início" })
    .regex(ISO_DATE, "Informe uma data de início válida");

/**
 * A classificação (categoria/subcategoria) vive em `modules/categories`; aqui só os nomes
 * antigos são reexportados para a UI de recorrências não mudar.
 */
export const RecurrenceCategoryDraftSchema = CategoryDraftSchema;
export type RecurrenceCategoryDraft = CategoryDraft;
export { createCategoryDraft, refineClassification };

export const RecurrenceFormBaseSchema = z.object({
    direction: RecurrenceFormDirectionSchema,
    name: z
        .string({ message: "Informe o nome da recorrência" })
        .trim()
        .min(1, "O nome da recorrência é obrigatório")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    amount: z
        .number({ message: "Informe um valor válido" })
        .int("O valor deve ser em centavos")
        .nonnegative("O valor não pode ser negativo"),
    frequency: RecurrenceFormFrequencySchema,
    /** Início da recorrência (YYYY-MM-DD). */
    startDate: StartDateSchema,
    hasCustomClosingDate: z.boolean(),

    // Prazos — quais campos valem depende da frequência
    /** Mensal/Anual: dia do mês (1–31). Semanal: dia da semana (0–6). */
    dueDay: z
        .number({ message: "Informe o dia de vencimento" })
        .int()
        .min(0)
        .max(31),
    closingDay: z.number().int().min(0).max(31).nullable().optional(),
    dueMonth: z.number().int().min(1).max(12).nullable().optional(),
    closingMonth: z.number().int().min(1).max(12).nullable().optional(),

    // Classificação — o dado de fato é a subcategoria; a categoria só filtra
    // a lista ou serve de pai quando a subcategoria é nova.
    ...CategoryClassificationBaseSchema.shape,
});

export type RecurrenceFormValues = z.infer<typeof RecurrenceFormBaseSchema>;

/** Campos que compõem o passo/seção de prazos. */
export const RecurrenceDeadlinesBaseSchema = RecurrenceFormBaseSchema.pick({
    frequency: true,
    hasCustomClosingDate: true,
    dueDay: true,
    closingDay: true,
    dueMonth: true,
    closingMonth: true,
});

type DeadlinesData = z.infer<typeof RecurrenceDeadlinesBaseSchema>;

/** Regras de prazos por frequência (compartilhadas entre form completo e passo do wizard). */
export function refineDeadlines(data: DeadlinesData, ctx: z.RefinementCtx) {
    const issue = (path: keyof DeadlinesData, message: string) =>
        ctx.addIssue({ code: "custom", path: [path], message });

    const inRange = (v: number | null | undefined, min: number, max: number) =>
        typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

    switch (data.frequency) {
        case "MONTHLY":
            if (!inRange(data.dueDay, 1, 31))
                issue("dueDay", "O dia de vencimento deve ser entre 1 e 31");
            if (data.hasCustomClosingDate && !inRange(data.closingDay, 1, 31))
                issue("closingDay", "O dia de fechamento deve ser entre 1 e 31");
            break;
        case "WEEKLY":
            if (!inRange(data.dueDay, 0, 6))
                issue("dueDay", "Selecione o dia da semana do vencimento");
            if (data.hasCustomClosingDate && !inRange(data.closingDay, 0, 6))
                issue("closingDay", "Selecione o dia da semana do fechamento");
            break;
        case "YEARLY":
            if (!inRange(data.dueDay, 1, 31) || !inRange(data.dueMonth, 1, 12))
                issue("dueMonth", "Informe o dia e o mês de vencimento");
            if (
                data.hasCustomClosingDate &&
                (!inRange(data.closingDay, 1, 31) ||
                    !inRange(data.closingMonth, 1, 12))
            )
                issue("closingMonth", "Informe o dia e o mês de fechamento");
            break;
    }
}

/** Campos de classificação (categoria/subcategoria). */
export const RecurrenceClassificationBaseSchema = CategoryClassificationBaseSchema;

export const RecurrenceClassificationSchema = CategoryClassificationSchema;

export const RecurrenceDeadlinesSchema =
    RecurrenceDeadlinesBaseSchema.superRefine(refineDeadlines);

export const RecurrenceFormSchema = RecurrenceFormBaseSchema.superRefine(
    (data, ctx) => {
        refineDeadlines(data, ctx);
        refineClassification(data, ctx);
    }
);

/** Passo principal do desktop: tudo, exceto o nome dos rascunhos. */
export const RecurrenceMainStepSchema = RecurrenceFormBaseSchema.extend(
    looseCategoryDrafts
).superRefine((data, ctx) => {
    refineDeadlines(data, ctx);
    refineClassification(data, ctx);
});

export const RecurrenceCategoryStepSchema = CategoryStepSchema;
export const RecurrenceSubcategoryStepSchema = SubcategoryStepSchema;
export const RecurrenceNewCategoryStepSchema = NewCategoryStepSchema;
export const RecurrenceNewSubcategoryStepSchema = NewSubcategoryStepSchema;

export const CreateRecurrenceSchema = RecurrenceFormSchema;
export type CreateRecurrenceFormValues = RecurrenceFormValues;
