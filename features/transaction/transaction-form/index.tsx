import { Button } from "@/components/ui/button"
import { TransactionFormType } from "./schemas/types"
import { FormProvider, SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ControlledField } from "@/components/controlled-field"
import { MoneyInput } from "@/components/money-input"
import { Input } from "@/components/ui/input"
import DatePicker from "@/components/date-picker"
import { ReactNode } from "react"

interface Props {
    form: UseFormReturn<TransactionFormType>
    onSubmit: (form: TransactionFormType) => void,
    onError: SubmitErrorHandler<TransactionFormType>
    children: ReactNode
}

export default function TransactionForm({ form, onSubmit, onError, children }: Props) {

    return <FormProvider {...form}>
        <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <FieldGroup className="gap-2">
                {children}
            </FieldGroup>
            <Button type="submit" form="transaction-form">
                Salvar
            </Button>
        </form>
    </FormProvider>
}

export function TransactionAmountField() {
    return <Card className="bg-background">
        <CardHeader className="-mt-3 p-0 flex flex-col justify-center items-center">
            <FieldLabel>Valor</FieldLabel>
            <Separator />
        </CardHeader>
        <Field className="flex flex-col gap-2 justify-center items-center *:w-auto">

            <ControlledField name="amount" className="flex flex-col justify-center">
                <MoneyInput className="text-center text-4xl font-bold h-10 placeholder:text-muted/50" autoFocus />
            </ControlledField>
        </Field>
    </Card>
}

export function TransactionDescriptionField() {
    return <Field className="flex flex-col gap-2">
        <FieldLabel>Descrição</FieldLabel>
        <ControlledField name="description">
            <Input />
        </ControlledField>
    </Field>
}

export function TransactionDateField() {
    return <Field className="flex flex-col gap-2">
        <FieldLabel>Data</FieldLabel>
        <ControlledField name="date">
            <DatePicker />
        </ControlledField>
    </Field>
}