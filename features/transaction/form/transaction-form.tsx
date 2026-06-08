import { FieldErrors, UseFormReturn } from "react-hook-form";
import { TransactionAmountField } from "./fields/amount-field";
import { TransactionFormType } from "./schema/types";
import { TransactionDescriptionField } from "./fields/description-field";
import { TransactionDateField } from "./fields/date-field";
import TransactionBucketField from "./fields/bucket-field";
import TransactionBadgeList from "./fields/badge-list-field";
import { schemaBadgeList } from "./schema/schema-registry";
import Form from "@/components/form-component";
import { useBucketsContext } from "@/features/buckets/contexts/bucket-context";

interface Props {
    form: UseFormReturn<TransactionFormType>
    isIncome: boolean
    onError: (errors: FieldErrors<TransactionFormType>) => void;
    onSubmit: (data: TransactionFormType) => void;
}

export default function TransactionForm({ isIncome, ...drilling }: Props) {
    const availableBadges = schemaBadgeList.filter(s => s != ((isIncome) ? "addDestination" : "addOrigin"))
    const { buckets } = useBucketsContext()

    return <Form {...drilling} id="transaction-form">
        <TransactionAmountField />
        <TransactionDescriptionField />
        <TransactionDateField />
        <TransactionBucketField otherBucket={(isIncome) ? "Destino" : "Origem"} buckets={buckets} />
        <TransactionBadgeList availableBadges={availableBadges} />
    </Form>
}
