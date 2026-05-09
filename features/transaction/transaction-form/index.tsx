import DatePicker from "@/components/date-picker"
import { MoneyInput } from "@/components/money-input"
import { Button } from "@/components/ui/button"
import { TransactionFormType } from "./schemas/types"
import { Controller, ControllerProps, SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Props {
    initialData?: TransactionFormType,
    form: UseFormReturn<TransactionFormType>
    onSubmit: (form: TransactionFormType) => void,
    onError: SubmitErrorHandler<TransactionFormType>
}

export default function TransactionForm({ form, onSubmit, onError }: Props) {

    const descriptionField: ControllerProps<TransactionFormType> = {
        name: "description",
        control: form.control,
        render: ({ field, fieldState }) => <Field>
            <FieldLabel>Descrição</FieldLabel>
            <Input {...field} placeholder="Ex.: Celular (1/5)" value={field.value as string} />
            <FieldError errors={[fieldState.error]}></FieldError>
        </Field>
    }

    const amontField: ControllerProps<TransactionFormType> = {
        name: "amount",
        control: form.control,
        render: ({ field, fieldState }) => <Field className="gap-0 -my-2 items-center *:w-auto" data-invalid={!!fieldState.error}>
            <FieldLabel>Valor</FieldLabel>
            <MoneyInput id="amount" className="w-auto text-center text-2xl font-black tracking-tight" value={field.value as number} onChange={field.onChange} placeholder="0,00" />
            <FieldError errors={[fieldState.error]} />
        </Field>
    }

    const dateField: ControllerProps<TransactionFormType> = {
        name: "date",
        control: form.control,
        render: ({ field, fieldState }) => <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Data</FieldLabel>
            <DatePicker date={field.value as Date} setDate={field.onChange} />
            <FieldError errors={[fieldState.error]} />
        </Field>
    }

    return <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
        <FieldGroup className="gap-2">
            <Card className="bg-background">
                <CardHeader className="-mt-4 p-0 flex flex-col justify-center items-center">
                    teste
                    <Separator />
                </CardHeader>
                <Controller {...amontField} />
            </Card>
            <Controller {...descriptionField} />
            <Controller {...dateField} />
        </FieldGroup>
        <Button type="submit" form="transaction-form" >
            Salvar
        </Button>
    </form>
}