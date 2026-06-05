import { useBucketsContext } from "@/features/buckets/contexts/bucket-context";
import { Field, FieldLabel } from "@/components/ui/field";
import { ControlledField } from "@/components/controlled-field";
import ListSelect from "@/components/list-select";

interface Props {
    isIncome?: boolean
}

export function TransactionToTransferField({ isIncome }: Props) {
    const { buckets } = useBucketsContext();

    const fieldName = isIncome ? "addDestination.bucketId" : "addOrigin.bucketId";
    const label = isIncome ? "Bucket de Destino" : "Bucket de Origem";

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <ControlledField name={fieldName}>
                <ListSelect options={buckets} />
            </ControlledField>
        </Field>
    );
}

export const TransactionAddOriginField = () => <TransactionToTransferField />
export const TransactionAddDestinationField = () => <TransactionToTransferField isIncome />