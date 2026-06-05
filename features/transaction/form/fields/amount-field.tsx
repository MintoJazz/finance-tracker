import { ControlledField } from "@/components/controlled-field";
import { MoneyInput } from "@/components/money-input";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export function TransactionAmountField() {
    return <Card>
        <CardHeader className="-mt-3 p-0 flex flex-col justify-center items-center">
            <FieldLabel>Valor</FieldLabel>
            <Separator />
        </CardHeader>
        <Field className="flex flex-col gap-2 justify-center items-center *:w-auto">

            <ControlledField name="amount" className="gap-0 justify-center">
                <MoneyInput className="text-center text-4xl font-bold h-10 placeholder:text-muted/50" autoFocus />
            </ControlledField>
        </Field>
    </Card>
}
