import { ControlledField } from "@/components/controlled-field";
import DatePicker from "@/components/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";

export function TransactionDateField() {
    return <Field className="flex flex-col gap-2">
        <FieldLabel>Data</FieldLabel>
        <ControlledField name="date">
            <DatePicker />
        </ControlledField>
    </Field>
}