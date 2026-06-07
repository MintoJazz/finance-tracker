import { ControlledField } from "@/components/controlled-field";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function BucketNameField() {
    return <Field className="flex flex-col gap-2">
        <FieldLabel>Nome</FieldLabel>
        <ControlledField name="description">
            <Input />
        </ControlledField>
    </Field>
}