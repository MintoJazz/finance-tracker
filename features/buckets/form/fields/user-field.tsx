import { ControlledField } from "@/components/controlled-field";
import ListSelect from "@/components/list-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { UserOption } from "@/types/database";

interface Props {
    users: UserOption[]
}

export default function BucketUserField({ users }: Props) {
    return <Field>
        <FieldLabel>Dono</FieldLabel>
        <ControlledField name="userId">
            <ListSelect options={users} />
        </ControlledField>
    </Field>
}