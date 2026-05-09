import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/money-input"
import DatePicker from "@/components/date-picker"
import { TransactionFormType } from "./schemas/types"
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form"

interface Props {
    field: ControllerRenderProps<TransactionFormType>
    fieldState: ControllerFieldState
}

export function DescriptionField({ field, fieldState }: Props) {
    return <Field>
        <FieldLabel>Descrição</FieldLabel>
        <Input {...field} value={field.value as string} placeholder="Ex.: Celular (1/5)" />
        <FieldError errors={[fieldState.error]} />
    </Field>
}

export function AmountField({ field, fieldState }: Props) {
    return <Field data-invalid={!!fieldState.error}>
        <FieldLabel>Valor</FieldLabel>
        <MoneyInput value={field.value as number} onChange={field.onChange} />
        <FieldError errors={[fieldState.error]} />
    </Field>
}

export function DateField({ field, fieldState }: Props) {
    return <Field data-invalid={!!fieldState.error}>
        <FieldLabel>Data</FieldLabel>
        <DatePicker date={field.value as Date} setDate={field.onChange} />
        <FieldError errors={[fieldState.error]} />
    </Field>
}