import { ControlledField } from "@/components/controlled-field";
import ListSelect from "@/components/list-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { BucketOption } from "@/types/database";

export type OtherBucket = "Destino" | "Origem"

interface Props {
    otherBucket: OtherBucket
    buckets: BucketOption[]
}

export default function TransactionBucketField({ otherBucket, buckets }: Props) {
    return <Field>
        <FieldLabel>Bucket de {otherBucket}</FieldLabel>
        <ControlledField name="bucketId">
            <ListSelect options={buckets} />
        </ControlledField>
    </Field>
}
