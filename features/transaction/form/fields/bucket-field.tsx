import { ControlledField } from "@/components/controlled-field";
import ListSelect from "@/components/list-select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Bucket } from "@/generated/prisma/client";

export type OtherBucket = "Destino" | "Origem"

interface Props {
    otherBucket: OtherBucket
    buckets: Bucket[]
}

export default function TransactionBucketField({ otherBucket, buckets }: Props) {
    return <Field>
        <FieldLabel>Bucket de {otherBucket}</FieldLabel>
        <ControlledField name="bucketId">
            <ListSelect options={buckets} />
        </ControlledField>
    </Field>
}
