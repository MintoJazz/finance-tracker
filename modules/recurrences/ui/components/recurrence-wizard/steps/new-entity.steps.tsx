"use client";

import * as React from "react";
import z from "zod";
import { Input } from "@/components/ui/input";
import { useWizard, type WizardStep } from "@/components/wizard";
import {
  RecurrenceCategoryDraftSchema,
  type RecurrenceFormValues,
} from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { CategoryColorPicker } from "@/modules/categories/ui/components/category-color-picker";
import { CategoryIconPicker } from "@/modules/categories/ui/components/category-icon-picker";

type Step = WizardStep<RecurrenceFormValues>;
type Entity = "category" | "subcategory";

const SLICE = { category: "newCategory", subcategory: "newSubcategory" } as const;

const LABELS = {
  category: {
    singular: "Categoria",
    nameTitle: "Nome da Categoria",
    colorTitle: "Cor da Categoria",
    iconTitle: "Ícone da Categoria",
    placeholder: "Digite o nome da categoria",
    hint: "Ex: Moradia, Assinaturas, Transporte...",
  },
  subcategory: {
    singular: "Subcategoria",
    nameTitle: "Nome da Subcategoria",
    colorTitle: "Cor da Subcategoria",
    iconTitle: "Ícone da Subcategoria",
    placeholder: "Digite o nome da subcategoria",
    hint: "Ex: Aluguel, Condomínio, Internet...",
  },
} as const;

/** Descrição do passo de nome: lembra a quem a subcategoria nova será vinculada. */
function NameHint({
  entity,
  options,
}: {
  entity: Entity;
  options: RecurrenceCategoryOptions;
}) {
  const { data } = useWizard<RecurrenceFormValues>();
  if (entity === "category") return <>{LABELS.category.hint}</>;

  const parent =
    data.newCategory?.name ||
    options.categories.find((c) => c.id === data.categoryId)?.name;
  return (
    <>
      {parent ? `Subcategoria vinculada a ${parent}. ` : ""}
      {LABELS.subcategory.hint}
    </>
  );
}

function IconPickerField({
  entity,
  value,
  onChange,
}: {
  entity: Entity;
  value?: string | null;
  onChange: (icon: string | null) => void;
}) {
  const { data } = useWizard<RecurrenceFormValues>();
  return (
    <CategoryIconPicker
      value={value}
      onChange={onChange}
      activeColor={data[SLICE[entity]]?.color}
      variant="carousel"
      showLabel={false}
    />
  );
}

/**
 * Mobile: criar categoria/subcategoria vira 3 etapas (nome → cor → ícone),
 * como em `modules/categories/ui/components/category-wizard`.
 */
export function createRecurrenceNewEntitySteps(
  entity: Entity,
  options: RecurrenceCategoryOptions
): Step[] {
  const key = SLICE[entity];
  const l = LABELS[entity];
  const when = (data: Partial<RecurrenceFormValues>) => !!data[key];

  const nameSchema = z.object({
    [key]: RecurrenceCategoryDraftSchema.pick({ name: true }),
  });
  const colorSchema = z.object({
    [key]: RecurrenceCategoryDraftSchema.pick({ color: true }),
  });
  const iconSchema = z.object({
    [key]: RecurrenceCategoryDraftSchema.pick({ icon: true }),
  });

  return [
    {
      id: key,
      title: l.nameTitle,
      when,
      schema: nameSchema,
      fields: [
        {
          name: `${key}.name`,
          label: "Nome de identificação",
          description: <NameHint entity={entity} options={options} />,
          children: (
            <Input
              placeholder={l.placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              className="h-9 text-sm"
            />
          ),
        },
      ],
    },
    {
      id: `${key}.color`,
      title: l.colorTitle,
      when,
      schema: colorSchema,
      fields: [
        {
          name: `${key}.color`,
          label: "Escolha uma cor",
          description:
            "Opcional. Deslize para explorar e selecione uma cor, ou toque novamente para desmarcar.",
          children: (_ctx, field) => (
            <CategoryColorPicker
              value={field.value as string | null}
              onChange={(color) => field.onChange(color)}
              variant="carousel"
            />
          ),
        },
      ],
    },
    {
      id: `${key}.icon`,
      title: l.iconTitle,
      when,
      schema: iconSchema,
      fields: [
        {
          name: `${key}.icon`,
          label: "Escolha um ícone",
          description: "Opcional. Deslize para explorar ou busque pelo nome.",
          children: (_ctx, field) => (
            <IconPickerField
              entity={entity}
              value={field.value as string | null}
              onChange={(icon) => field.onChange(icon)}
            />
          ),
        },
      ],
    },
  ] as Step[];
}
