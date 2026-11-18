import type { WizardStep } from "@/components/wizard";
import { RecurrenceEditStepSchema } from "@/modules/recurrences/models/schemas/recurrence-edit.schema";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { createNameField, nameField } from "../../recurrence-form/fields";
import { createClassificationRow } from "../../recurrence-form/classification-fields";
import { recurrenceEditNameStepSchema } from "./edit.schemas";
import {
  createRecurrenceCategoryStep,
  createRecurrenceNewCategoryStep,
  createRecurrenceNewSubcategoryStep,
  createRecurrenceSubcategoryStep,
} from "./classification.step";
import { createRecurrenceNewEntitySteps } from "./new-entity.steps";

type Step = WizardStep<RecurrenceFormValues>;

/** Desktop: nome + categoria/subcategoria numa tela só. */
export function createRecurrenceEditMainStep(options: RecurrenceCategoryOptions): Step {
  return {
    id: "main",
    title: "Editar recorrência",
    description: "Renomeie a recorrência ou troque a categoria padrão.",
    schema: RecurrenceEditStepSchema as unknown as Step["schema"],
    fields: [nameField, createClassificationRow(options)],
  };
}

export function buildRecurrenceEditDesktopSteps(options: RecurrenceCategoryOptions): Step[] {
  return [
    createRecurrenceEditMainStep(options),
    createRecurrenceNewCategoryStep(),
    createRecurrenceNewSubcategoryStep(options),
  ];
}

/** Mobile: nome → categoria → subcategoria (criar nova adiciona seus passos). */
export function buildRecurrenceEditMobileSteps(
  options: RecurrenceCategoryOptions,
  submitText = "Salvar alterações"
): Step[] {
  const steps: Step[] = [
    {
      id: "basics",
      title: "Nome",
      schema: recurrenceEditNameStepSchema,
      fields: [createNameField("Ex: Aluguel, Internet...", "h-9 text-sm")],
    },
    createRecurrenceCategoryStep(options),
    ...createRecurrenceNewEntitySteps("category", options),
    createRecurrenceSubcategoryStep(options),
    ...createRecurrenceNewEntitySteps("subcategory", options),
  ];
  // O último passo possível é sempre o de subcategoria ou a criação dela
  const last = steps.length - 1;
  steps[last] = { ...steps[last], submitText };
  return steps;
}
