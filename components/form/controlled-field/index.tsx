"use client"

import { useController, useFormContext, type FieldValues } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import type { FormField } from "@/types/form.types"

interface ControlledFieldProps<
  TForm extends FieldValues = FieldValues,
  TContext = void,
> extends FormField<TForm, TContext> {
  context?: TContext
}

export function ControlledField<
  TForm extends FieldValues = FieldValues,
  TContext = void,
>({
  name,
  label,
  className,
  hidden,
  children,
  context,
}: ControlledFieldProps<TForm, TContext>) {
  const { control, watch } = useFormContext<TForm>()
  const { field, fieldState } = useController({ name, control })

  if (hidden) {
    const currentValues = watch()
    if (hidden(currentValues, context as TContext)) return null
  }

  const resolvedChildren =
    typeof children === "function"
      ? children(context as TContext, field)
      : children

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Slot {...field}>{resolvedChildren}</Slot>
      <FieldError className="text-center" errors={[fieldState.error]} />
    </div>
  )
}