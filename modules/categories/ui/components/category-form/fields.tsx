import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { FormFieldItem } from "@/types/form.types";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import { CategoryColorPicker } from "../category-color-picker";
import { CategoryIconPicker } from "../category-icon-picker";
import type { CategoryFormContext } from "./types";

function CategoryIconFieldControl({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (val: string | null) => void;
}) {
  const { watch } = useFormContext<CategoryFormValues>();
  const currentColor = watch("color");

  return (
    <CategoryIconPicker
      value={value}
      onChange={onChange}
      activeColor={currentColor}
      variant="grid"
      showLabel={false}
    />
  );
}

export const categoryNameField: FormFieldItem<
  CategoryFormValues,
  CategoryFormContext
> = {
  name: "name",
  label: "Nome",
  children: (ctx, field) => (
    <Input
      placeholder={
        ctx?.parentCategory ? "Ex.: Mercado, Restaurantes" : "Ex.: Alimentação"
      }
      value={typeof field.value === "string" ? field.value : ""}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
      name={field.name}
      ref={field.ref}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      data-1p-ignore="true"
      data-lpignore="true"
    />
  ),
};

export const categoryColorField: FormFieldItem<
  CategoryFormValues,
  CategoryFormContext
> = {
  name: "color",
  render: ({ field }) => (
    <CategoryColorPicker
      value={typeof field.value === "string" ? field.value : null}
      onChange={(color) => field.onChange(color)}
      variant="grid"
    />
  ),
};

export const categoryIconField: FormFieldItem<
  CategoryFormValues,
  CategoryFormContext
> = {
  name: "icon",
  label: "Ícone",
  children: (_ctx, field) => (
    <CategoryIconFieldControl
      value={typeof field.value === "string" ? field.value : null}
      onChange={(icon) => field.onChange(icon)}
    />
  ),
};

export const categoryFormFields = [
  categoryNameField,
  categoryColorField,
  categoryIconField,
];
