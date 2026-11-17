import type { WizardStep } from "@/components/wizard";
import {
  RecurrenceCategoryStepSchema,
  RecurrenceNewCategoryStepSchema,
  RecurrenceNewSubcategoryStepSchema,
  RecurrenceSubcategoryStepSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import {
  createCategoryPickerField,
  createNewCategoryField,
  createNewSubcategoryField,
  createSubcategoryPickerField,
} from "../../recurrence-form/classification-fields";

type Step = WizardStep<RecurrenceFormValues>;

/** Mobile: escolhe a categoria (filtro da subcategoria) ou cria uma nova. */
export function createRecurrenceCategoryStep(options: RecurrenceCategoryOptions): Step {
  return {
    id: "category",
    title: "Categoria",
    schema: RecurrenceCategoryStepSchema,
    fields: [createCategoryPickerField(options)],
  };
}

/** Mobile: com categoria nova não há subcategorias existentes, então o passo é pulado. */
export function createRecurrenceSubcategoryStep(options: RecurrenceCategoryOptions): Step {
  return {
    id: "subcategory",
    title: "Subcategoria",
    when: (data) => !data.newCategory,
    schema: RecurrenceSubcategoryStepSchema,
    fields: [createSubcategoryPickerField(options)],
  };
}

/** Desktop: nome, cor e ícone da categoria nova numa tela só. */
export function createRecurrenceNewCategoryStep(): Step {
  return {
    id: "newCategory",
    title: "Nova categoria",
    description: "Defina o nome, a cor e o ícone da categoria.",
    when: (data) => !!data.newCategory,
    schema: RecurrenceNewCategoryStepSchema,
    fields: [createNewCategoryField()],
  };
}

/** Desktop: nome, cor e ícone da subcategoria nova numa tela só. */
export function createRecurrenceNewSubcategoryStep(
  options: RecurrenceCategoryOptions
): Step {
  return {
    id: "newSubcategory",
    title: "Nova subcategoria",
    description: "Defina o nome, a cor e o ícone da subcategoria.",
    when: (data) => !!data.newSubcategory,
    schema: RecurrenceNewSubcategoryStepSchema,
    fields: [createNewSubcategoryField(options)],
  };
}
