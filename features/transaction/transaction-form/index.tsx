import { Button } from "@/components/ui/button"
import { TransactionFormType } from "./schemas/types"
import { Controller, SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FIELD_REGISTRY } from "./field-registry"

interface Props {
    initialData?: TransactionFormType,
    form: UseFormReturn<TransactionFormType>
    onSubmit: (form: TransactionFormType) => void,
    onError: SubmitErrorHandler<TransactionFormType>
}

export default function TransactionForm({ form, onSubmit, onError }: Props) {
    const field = (key: keyof typeof FIELD_REGISTRY) => ({
        control: form.control,
        ...FIELD_REGISTRY[key],
    })

    return <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
        <FieldGroup className="gap-2">
            <Card className="bg-background">
                <CardHeader className="-mt-4 p-0 flex flex-col justify-center items-center">
                    teste
                    <Separator />
                </CardHeader>
                <Controller {...field('amount')} />
            </Card>
            <Controller {...field('description')} />
            <Controller {...field('date')} />
        </FieldGroup>
        <Button type="submit" form="transaction-form">
            Salvar
        </Button>
    </form>
}