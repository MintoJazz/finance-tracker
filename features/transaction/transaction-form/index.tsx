import { Button } from "@/components/ui/button"
import { TransactionFormType } from "./schemas/types"
import { SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ControlledField } from "@/components/controlled-field"
import { MoneyInput } from "@/components/money-input"
import { Input } from "@/components/ui/input"
import DatePicker from "@/components/date-picker"

// initialData?: TransactionFormType,
interface Props {
    form: UseFormReturn<TransactionFormType>
    onSubmit: (form: TransactionFormType) => void,
    onError: SubmitErrorHandler<TransactionFormType>
}

export default function TransactionForm({ form, onSubmit, onError }: Props) {

    return <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
        <FieldGroup className="gap-2">
            <Card className="bg-background">
                <CardHeader className="-mt-4 p-0 flex flex-col justify-center items-center">
                    teste
                    <Separator />
                </CardHeader>
                <ControlledField label="Amount" name="amount">
                    <MoneyInput />
                </ControlledField>
            </Card>
            <ControlledField label="Descrição" name="description">
                <Input />
            </ControlledField>
            <ControlledField label="Data" name="date" >
                <DatePicker />
            </ControlledField>
        </FieldGroup>
        <Button type="submit" form="transaction-form">
            Salvar
        </Button>
    </form>
}